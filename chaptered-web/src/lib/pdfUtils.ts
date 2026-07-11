export async function detectPages(file: File): Promise<number | null> {
  try {
    const buf = await file.arrayBuffer();
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    return pdf.numPages;
  } catch {
    return null;
  }
}

export async function compressPDF(
  file: File,
  barId: string,
  labelId: string,
  wrapId: string
): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB <= 5) return file;

  const wrap = document.getElementById(wrapId);
  const bar = document.getElementById(barId);
  const label = document.getElementById(labelId);
  if (wrap) wrap.style.display = 'block';

  try {
    const pdfjsLib = await loadPdfJs();
    const { jsPDF } = await loadJsPdf();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const totalPages = pdf.numPages;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const quality = sizeMB > 200 ? 0.35 : sizeMB > 100 ? 0.5 : sizeMB > 50 ? 0.65 : sizeMB > 20 ? 0.75 : 0.85;
    const scale = sizeMB > 200 ? 0.7 : sizeMB > 100 ? 0.85 : sizeMB > 50 ? 0.9 : 1.0;
    let doc: any = null;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgData = canvas.toDataURL('image/jpeg', quality);
      const w = viewport.width * 0.75;
      const h = viewport.height * 0.75;
      if (!doc) {
        doc = new jsPDF({
          orientation: w > h ? 'l' : 'p',
          unit: 'pt',
          format: [w, h],
        });
      } else {
        doc.addPage([w, h], w > h ? 'l' : 'p');
      }
      doc.addImage(imgData, 'JPEG', 0, 0, w, h);
      const pct = Math.round((i / totalPages) * 100);
      if (bar) bar.style.width = pct + '%';
      if (label) label.textContent = `Compressing page ${i} of ${totalPages} (${pct}%)`;
    }

    const compressedBlob = doc.output('blob');
    const compressedMB = (compressedBlob.size / 1024 / 1024).toFixed(1);
    if (label) label.textContent = `Compressed: ${sizeMB.toFixed(1)}MB -> ${compressedMB}MB (${sizeMB > 0 ? Math.round((1 - compressedBlob.size / file.size) * 100) : 0}% smaller)`;
    if (bar) bar.style.width = '100%';
    setTimeout(() => { if (wrap) wrap.style.display = 'none'; }, 2500);
    return new File([compressedBlob], file.name, { type: 'application/pdf' });
  } catch {
    if (label) label.textContent = 'Compression failed - using original';
    setTimeout(() => { if (wrap) wrap.style.display = 'none'; }, 2500);
    return file;
  }
}

async function loadPdfJs(): Promise<any> {
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return (window as any).pdfjsLib;
}

async function loadJsPdf(): Promise<any> {
  if ((window as any).jspdf) return (window as any).jspdf;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  return (window as any).jspdf;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
