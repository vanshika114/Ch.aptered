
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdfFiles=new Map();
const MAX_MB=100;

const DB={
  B:'chaptered_books_v2',S:'chaptered_sessions_v2',
  books(){try{return JSON.parse(localStorage.getItem(this.B)||'[]')}catch{return[]}},
  saveBooks(b){localStorage.setItem(this.B,JSON.stringify(b))},
  sessions(){try{return JSON.parse(localStorage.getItem(this.S)||'[]')}catch{return[]}},
  saveSessions(s){localStorage.setItem(this.S,JSON.stringify(s))},
  addBook(b){const a=this.books();a.push(b);this.saveBooks(a)},
  updateBook(id,patch){this.saveBooks(this.books().map(b=>b.id===id?{...b,...patch}:b))},
  deleteBook(id){
    this.saveBooks(this.books().filter(b=>b.id!==id));
    this.saveSessions(this.sessions().filter(s=>s.bookId!==id));
    pdfFiles.delete(id);
  },
  addSession(s){const a=this.sessions();a.push(s);this.saveSessions(a)},
  deleteSession(id){this.saveSessions(this.sessions().filter(s=>s.id!==id))},
  sessFor(bid){return this.sessions().filter(s=>s.bookId===bid)},
  pagesFor(bid){return this.sessFor(bid).reduce((a,s)=>a+(s.pages||0),0)},
  totalPages(){return this.sessions().reduce((a,s)=>a+(s.pages||0),0)},
  streak(){
    const ss=this.sessions();if(!ss.length)return 0;
    const days=[...new Set(ss.map(s=>s.date))].sort().reverse();
    const t=new Date().toISOString().slice(0,10),y=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(days[0]!==t&&days[0]!==y)return 0;
    let n=1;for(let i=1;i<days.length;i++){if((new Date(days[i-1])-new Date(days[i]))/86400000===1)n++;else break;}
    return n;
  }
};

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const pct=b=>Math.min(100,Math.round((DB.pagesFor(b.id)/b.pages)*100));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

function toast(msg,type=''){
  const el=document.createElement('div');
  el.className='toast'+(type?' '+type:'');el.textContent=msg;
  document.getElementById('tc').appendChild(el);setTimeout(()=>el.remove(),2800);
}

let addColor='#8B3A3A',editColor='#8B3A3A',editId=null,selFile=null,curView='grid';
let detectedAddPages=null,detectedEditPages=null;

// ── AUTO DETECT PAGES ─────────────────────────────────────────────────────────
async function detectPages(file){
  try{
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    return pdf.numPages;
  }catch{return null;}
}

// ── PDF COMPRESSOR (uses jsPDF — produces valid readable PDF) ─────────────────
async function compressPDF(file,progressBarId,progressLabelId,progressWrapId){
  const sizeMB=(file.size/1024/1024).toFixed(1);
  if(file.size<=MAX_MB*1024*1024) return file;

  toast(`📦 File is ${sizeMB}MB — auto-compressing...`);
  document.getElementById(progressWrapId).style.display='block';
  const bar=document.getElementById(progressBarId);
  const label=document.getElementById(progressLabelId);

  try{
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const totalPages=pdf.numPages;
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');
    const quality=file.size>200*1024*1024?0.4:0.6;
    const scale=file.size>200*1024*1024?0.8:1.0;
    const {jsPDF}=window.jspdf;
    let doc=null;

    for(let i=1;i<=totalPages;i++){
      const page=await pdf.getPage(i);
      const viewport=page.getViewport({scale});
      canvas.width=viewport.width;
      canvas.height=viewport.height;
      await page.render({canvasContext:ctx,viewport}).promise;
      const imgData=canvas.toDataURL('image/jpeg',quality);
      const w=viewport.width*0.75;
      const h=viewport.height*0.75;
      if(!doc){
        doc=new jsPDF({orientation:w>h?'l':'p',unit:'pt',format:[w,h]});
      }else{
        doc.addPage([w,h],w>h?'l':'p');
      }
      doc.addImage(imgData,'JPEG',0,0,w,h);
      const p=Math.round((i/totalPages)*100);
      bar.style.width=p+'%';
      label.textContent=`⏳ Compressing page ${i} of ${totalPages} (${p}%)...`;
    }

    const compressedBlob=doc.output('blob');
    const compressedMB=(compressedBlob.size/1024/1024).toFixed(1);
    label.textContent=`✓ Compressed: ${sizeMB}MB → ${compressedMB}MB`;
    bar.style.width='100%';
    toast(`✅ Compressed ${sizeMB}MB → ${compressedMB}MB`);
    setTimeout(()=>document.getElementById(progressWrapId).style.display='none',2500);
    return new File([compressedBlob],file.name,{type:'application/pdf'});
  }catch(err){
    console.error('Compression failed:',err);
    label.textContent='⚠️ Compression failed — using original.';
    toast('Compression failed — uploading original.','err');
    setTimeout(()=>document.getElementById(progressWrapId).style.display='none',2500);
    return file;
  }
}

// ── DRAG & DROP ───────────────────────────────────────────────────────────────
function handleDrop(e,form){
  e.preventDefault();
  document.getElementById(form==='add'?'ua':'eua').classList.remove('drag');
  const file=e.dataTransfer.files[0];
  if(!file||file.type!=='application/pdf'){toast('Please drop a PDF file.','err');return;}
  processFile(file,form);
}

async function processFile(file,form){
  const isAdd=form==='add';
  const labelId=isAdd?'ul':'eul';
  const areaId=isAdd?'ua':'eua';
  const barId=isAdd?'compress-bar':'ecompress-bar';
  const lblId=isAdd?'compress-label':'ecompress-label';
  const wrapId=isAdd?'compress-progress':'ecompress-progress';

  document.getElementById(labelId).textContent='⏳ Processing...';
  document.getElementById(areaId).classList.add('has');

  const processed=await compressPDF(file,barId,lblId,wrapId);
  const n=await detectPages(processed);

  if(isAdd){
    selFile=processed;
    detectedAddPages=n;
    document.getElementById(labelId).textContent=`✓ ${file.name}${n?' — '+n+' pages':''}`;
    if(n){
      const inp=document.getElementById('bPages');
      inp.value=n;
      inp.max=n;
      document.getElementById('bPagesHint').textContent=`📄 ${n} pages detected from PDF — cannot exceed this.`;
    }
  }else{
    editFile=processed;
    detectedEditPages=n;
    document.getElementById(labelId).textContent=`✓ ${file.name}${n?' — '+n+' pages':''}`;
    if(n){
      const inp=document.getElementById('ePages');
      inp.value=n;
      inp.max=n;
      document.getElementById('ePagesHint').textContent=`📄 ${n} pages detected from PDF — cannot exceed this.`;
    }
  }
  if(n) toast(`📄 Detected ${n} pages automatically`);
}

// ── HEADER STATS ──────────────────────────────────────────────────────────────
function rStats(){
  const bks=DB.books(),pg=DB.totalPages(),ss=DB.sessions().length,st=DB.streak();
  document.getElementById('hs-b').textContent=bks.length;
  document.getElementById('hs-p').textContent=pg>=1000?(pg/1000).toFixed(1)+'k':pg;
  document.getElementById('hs-s').textContent=ss;
  document.getElementById('hs-st').textContent=st+' 🔥';
  document.getElementById('ms-b').textContent=bks.length;
  document.getElementById('ms-d').textContent=bks.filter(b=>pct(b)>=100).length;
  document.getElementById('ms-r').textContent=bks.filter(b=>{const p=pct(b);return p>0&&p<100}).length;
  document.getElementById('ms-u').textContent=bks.filter(b=>pct(b)===0).length;
}

// ── PANEL SWITCH ──────────────────────────────────────────────────────────────
function sp(name){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('p-'+name).classList.add('active');
  document.querySelectorAll('.sb-btn').forEach(b=>b.classList.toggle('active',b.dataset.p===name));
  if(name==='shelf')rShelf();
  if(name==='progress')rProgress();
}

// ── SHELF ─────────────────────────────────────────────────────────────────────
function sv(v){
  curView=v;
  document.getElementById('gvb').classList.toggle('active',v==='grid');
  document.getElementById('lvb').classList.toggle('active',v==='list');
  document.getElementById('bg').classList.toggle('lv',v==='list');
}

function rShelf(){
  const q=(document.getElementById('si').value||'').toLowerCase();
  const genre=document.getElementById('fg').value;
  const status=document.getElementById('fst').value;
  let bks=DB.books();
  if(q)bks=bks.filter(b=>b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q));
  if(genre)bks=bks.filter(b=>b.genre===genre);
  if(status)bks=bks.filter(b=>{const p=pct(b);return status==='completed'?p>=100:status==='reading'?p>0&&p<100:p===0});
  const grid=document.getElementById('bg'),empty=document.getElementById('se');
  document.getElementById('bcnt').textContent=bks.length;
  grid.classList.toggle('lv',curView==='list');
  if(!bks.length){empty.style.display='block';grid.innerHTML='';return;}
  empty.style.display='none';
  grid.innerHTML=bks.map(b=>{
    const p=pct(b),pr=DB.pagesFor(b.id);
    return`<div class="bcard" onclick="openBook('${b.id}')">
      ${b.hasPdf?'<span class="pdf-badge">PDF</span>':''}
      <div class="bactions">
        <button class="bab" onclick="event.stopPropagation();openEdit('${b.id}')" title="Edit">✎</button>
        <button class="bab del" onclick="event.stopPropagation();delBook('${b.id}')" title="Delete">✕</button>
      </div>
      <div class="bcover" style="background:linear-gradient(145deg,${b.color} 0%,${b.color}bb 100%)">
        <div class="bcover-t">${esc(b.title)}</div>
      </div>
      <div class="bbody">
        <div class="bt">${esc(b.title)}</div>
        <div class="ba">${esc(b.author)}</div>
        <span class="bg-chip">${esc(b.genre)}</span>
        <div class="bprog">
          <div class="pb"><div class="pf" style="width:${p}%"></div></div>
          <div class="pp">${pr}/${b.pages} pages · ${p}%</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function delBook(id){
  const b=DB.books().find(x=>x.id===id);
  if(!b||!confirm(`Remove "${b.title}"? All sessions will also be deleted.`))return;
  DB.deleteBook(id);toast('Book removed.','err');
  rStats();rShelf();if(document.getElementById('p-progress').classList.contains('active'))rProgress();
}

// ── OPEN BOOK ─────────────────────────────────────────────────────────────────
let _blobUrl=null;
function openBook(id){
  const b=DB.books().find(x=>x.id===id);if(!b)return;
  document.getElementById('rTitle').textContent=b.title;
  document.getElementById('rMeta').textContent='· '+b.author;
  const body=document.getElementById('rBody');
  const file=pdfFiles.get(id);
  if(file){
    if(_blobUrl){URL.revokeObjectURL(_blobUrl);}
    _blobUrl=URL.createObjectURL(file);
    body.innerHTML=`<iframe src="${_blobUrl}" title="${esc(b.title)}"></iframe>`;
  }else{
    body.innerHTML=`<div class="no-pdf"><div class="ni">📖</div><p>No PDF uploaded for this book.</p><p style="font-size:.82rem;opacity:.6">PDFs are session-only — re-upload via Edit after refreshing.</p></div>`;
  }
  const p=pct(b);
  document.getElementById('rInfo').innerHTML=`
    <div class="ri-item"><label>Genre</label><span>${esc(b.genre)}</span></div>
    <div class="ri-item"><label>Pages</label><span>${b.pages}</span></div>
    <div class="ri-item"><label>Progress</label><span>${p}%</span></div>
    ${b.desc?`<div class="ri-item"><label>Note</label><span>${esc(b.desc)}</span></div>`:''}`;
  document.getElementById('ro').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeReader(){
  document.getElementById('ro').classList.remove('open');
  document.getElementById('rBody').innerHTML='';
  document.body.style.overflow='';
  if(_blobUrl){URL.revokeObjectURL(_blobUrl);_blobUrl=null;}
}
document.getElementById('ro').addEventListener('click',function(e){if(e.target===this)closeReader();});

// ── COLOR PICKERS ─────────────────────────────────────────────────────────────
document.querySelectorAll('#acr .co').forEach(el=>el.addEventListener('click',()=>{
  document.querySelectorAll('#acr .co').forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');addColor=el.dataset.c;
}));
document.querySelectorAll('#ecr .co').forEach(el=>el.addEventListener('click',()=>{
  document.querySelectorAll('#ecr .co').forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');editColor=el.dataset.c;
}));

// ── FILE INPUT LISTENERS ──────────────────────────────────────────────────────
document.getElementById('fi').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  await processFile(f,'add');
});
document.getElementById('efi').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  await processFile(f,'edit');
});

// ── ADD BOOK ──────────────────────────────────────────────────────────────────
function addBook(){
  const title=document.getElementById('bTitle').value.trim();
  const author=document.getElementById('bAuthor').value.trim();
  const genre=document.getElementById('bGenre').value;
  const pages=parseInt(document.getElementById('bPages').value);
  const desc=document.getElementById('bDesc').value.trim();
  if(!title||!author){toast('Please fill in Title and Author.','err');return;}
  if(!pages||pages<1){toast('Enter a valid page count.','err');return;}
  if(detectedAddPages&&pages>detectedAddPages){
    toast(`Page count cannot exceed detected pages (${detectedAddPages}).`,'err');
    document.getElementById('bPages').value=detectedAddPages;
    return;
  }
  const id=uid();
  const book={id,title,author,genre,pages,desc,color:addColor,hasPdf:!!selFile,addedAt:new Date().toISOString()};
  if(selFile){pdfFiles.set(id,selFile);}
  DB.addBook(book);
  resetForm();
  toast('📚 "'+title+'" added!');
  rStats();sp('shelf');
}

function resetForm(){
  ['bTitle','bAuthor','bPages','bDesc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('bPages').max='';
  document.getElementById('bPagesHint').textContent='';
  document.getElementById('ul').textContent='📄 Upload PDF — drag & drop or click to browse';
  document.getElementById('ua').classList.remove('has');
  document.getElementById('fi').value='';
  selFile=null;detectedAddPages=null;
}

// ── EDIT ──────────────────────────────────────────────────────────────────────
let editFile=null;
function openEdit(id){
  const b=DB.books().find(x=>x.id===id);if(!b)return;
  editId=id;editColor=b.color;editFile=null;detectedEditPages=null;
  document.getElementById('eTitle').value=b.title;
  document.getElementById('eAuthor').value=b.author;
  document.getElementById('ePages').value=b.pages;
  document.getElementById('ePages').max='';
  document.getElementById('ePagesHint').textContent='';
  document.getElementById('eDesc').value=b.desc||'';
  document.getElementById('eGenre').value=b.genre;
  document.querySelectorAll('#ecr .co').forEach(el=>el.classList.toggle('sel',el.dataset.c===b.color));
  const hasPdf=pdfFiles.has(id);
  document.getElementById('eul').textContent=hasPdf?'✓ PDF in memory — click to replace':'📄 Click or drag & drop PDF to attach';
  document.getElementById('eua').className='fu'+(hasPdf?' has':'');
  document.getElementById('efi').value='';
  document.getElementById('em').classList.add('open');
}

function closeEdit(){document.getElementById('em').classList.remove('open');editId=null;editFile=null;detectedEditPages=null;}

function saveEdit(){
  const title=document.getElementById('eTitle').value.trim();
  const author=document.getElementById('eAuthor').value.trim();
  const pages=parseInt(document.getElementById('ePages').value);
  const desc=document.getElementById('eDesc').value.trim();
  const genre=document.getElementById('eGenre').value;
  if(!title||!author){toast('Title and Author required.','err');return;}
  if(!pages||pages<1){toast('Enter a valid page count.','err');return;}
  if(detectedEditPages&&pages>detectedEditPages){
    toast(`Page count cannot exceed detected pages (${detectedEditPages}).`,'err');
    document.getElementById('ePages').value=detectedEditPages;
    return;
  }
  if(editFile){pdfFiles.set(editId,editFile);}
  const hasPdf=pdfFiles.has(editId);
  DB.updateBook(editId,{title,author,pages,desc,genre,color:editColor,hasPdf});
  toast('✓ Book updated!');closeEdit();rStats();rShelf();
  if(document.getElementById('p-progress').classList.contains('active'))rProgress();
}
document.getElementById('em').addEventListener('click',function(e){if(e.target===this)closeEdit();});

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function updatePageHint(){
  const bid=document.getElementById('lBook').value;
  const inp=document.getElementById('lPages');
  const hint=document.getElementById('lHint');
  if(!bid){inp.max='';hint.textContent='';return;}
  const book=DB.books().find(b=>b.id===bid);if(!book)return;
  const alreadyRead=DB.pagesFor(bid);
  const remaining=Math.max(0,book.pages-alreadyRead);
  inp.max=remaining;
  if(remaining===0){
    hint.textContent='✓ Fully read!';
    hint.style.color='var(--green)';
  }else{
    hint.textContent=`${remaining} pages remaining of ${book.pages}`;
    hint.style.color='var(--muted)';
  }
}

function rProgress(){
  const bks=DB.books(),ss=DB.sessions(),tp=DB.totalPages(),st=DB.streak();
  document.getElementById('tstats').innerHTML=`
    <div class="ts"><div class="tsn">${bks.length}</div><div class="tsl">Books</div></div>
    <div class="ts"><div class="tsn a">${tp.toLocaleString()}</div><div class="tsl">Pages Read</div></div>
    <div class="ts"><div class="tsn">${ss.length}</div><div class="tsl">Sessions</div></div>
    <div class="ts"><div class="tsn a">${st} 🔥</div><div class="tsl">Streak</div></div>
    <div class="ts"><div class="tsn">${bks.filter(b=>pct(b)>=100).length}</div><div class="tsl">Finished</div></div>`;
  const sel=document.getElementById('lBook');
  const prevVal=sel.value;
  sel.innerHTML=bks.length?bks.map(b=>`<option value="${b.id}">${esc(b.title)}</option>`).join(''):'<option value="">No books yet</option>';
  if(prevVal)sel.value=prevVal;
  updatePageHint();
  const cont=document.getElementById('sc');
  if(!bks.length){cont.innerHTML='<div class="no-s" style="padding:2rem">Add books to start tracking.</div>';return;}
  const w=bks.filter(b=>DB.sessFor(b.id).length),wo=bks.filter(b=>!DB.sessFor(b.id).length);
  cont.innerHTML=[...w,...wo].map(book=>{
    const slist=DB.sessFor(book.id).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
    const pr=DB.pagesFor(book.id),p=pct(book);
    return`<div class="sb-book">
      <div class="sb-hd">
        <div><div class="sb-t">${esc(book.title)}</div><div class="sb-au">${esc(book.author)} · ${esc(book.genre)}</div></div>
        <div style="text-align:right">
          <div class="sb-pct">${p}%</div>
          <div style="font-size:.75rem;color:var(--muted)">${pr}/${book.pages} pages</div>
          ${p>=100?'<span class="done-badge">✓ Completed</span>':''}
        </div>
      </div>
      <div class="spbar"><div class="spfill" style="width:${p}%"></div></div>
      <div class="s-items">
        ${slist.length?slist.map(s=>`
          <div class="s-item">
            <span class="s-date">${fmt(s.date)}</span>
            <span class="s-pg">${s.pages}<span> pages</span></span>
            <span class="s-note">${s.note?esc(s.note):'—'}</span>
            <button class="s-del" onclick="delSess('${s.id}')" title="Remove">✕</button>
          </div>`).join(''):'<div class="no-s">No sessions yet — log one above.</div>'}
      </div>
    </div>`;
  }).join('');
}

function logSession(){
  const bid=document.getElementById('lBook').value;
  const pages=parseInt(document.getElementById('lPages').value);
  const note=document.getElementById('lNote').value.trim();
  if(!bid){toast('Add a book first!','err');return;}
  if(!pages||pages<1){toast('Enter a valid page count.','err');return;}
  const book=DB.books().find(b=>b.id===bid);if(!book)return;
  const alreadyRead=DB.pagesFor(bid);
  const remaining=book.pages-alreadyRead;
  if(remaining<=0){toast(`"${book.title}" is already fully read!`,'err');return;}
  if(pages>remaining){
    toast(`Only ${remaining} pages left in "${book.title}" — adjusted.`,'err');
    document.getElementById('lPages').value=remaining;return;
  }
  DB.addSession({id:uid(),bookId:bid,pages,note,date:new Date().toISOString().slice(0,10),timestamp:new Date().toISOString()});
  document.getElementById('lPages').value='';document.getElementById('lNote').value='';
  const p=Math.min(100,Math.round((DB.pagesFor(bid)/book.pages)*100));
  toast(`✓ Logged ${pages} pages — "${book.title}" at ${p}%`);
  if(p>=100)toast(`🎉 You finished "${book.title}"!`);
  rStats();rProgress();rShelf();
}

function delSess(id){
  DB.deleteSession(id);toast('Session removed.','err');rStats();rProgress();rShelf();
}

// ── KEYBOARD + MOBILE NAV ─────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeReader();closeEdit();}});
document.getElementById('mb').addEventListener('click',()=>document.getElementById('nl').classList.toggle('open'));
document.querySelectorAll('#nl a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nl').classList.remove('open')));

// ── INIT ──────────────────────────────────────────────────────────────────────
rStats();rShelf();
