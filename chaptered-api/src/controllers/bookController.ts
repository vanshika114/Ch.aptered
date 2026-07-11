import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Book } from '../models/Book';

export const createBook = async (req: AuthRequest, res: Response): Promise<any> => {
  const { title, author, genre, pages, desc, color, googleBookId, coverUrl, hasPdf } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const errors: Record<string, string> = {};
  if (!title || !title.trim()) errors.title = 'Title is required';
  if (!author || !author.trim()) errors.author = 'Author is required';
  if (!pages || pages < 1) errors.pages = 'Pages must be at least 1';
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const book = new Book({
      userId, title: title.trim(), author: author.trim(),
      genre: genre || 'Fiction', pages, desc, color: color || '#8B3A3A',
      googleBookId, coverUrl, hasPdf: false,
    });
    await book.save();
    return res.status(201).json(stripPdf(book));
  } catch (error) {
    console.error('[Create Book Error]:', error);
    return res.status(500).json({ error: 'Server error creating book.' });
  }
};

function stripPdf(book: any) {
  if (!book) return book;
  const clean = (b: any) => {
    const { pdf, _isNew, _table, ...rest } = b;
    return { ...rest, hasPdf: !!b.hasPdf };
  };
  if (Array.isArray(book)) return book.map(clean);
  return clean(book);
}

export const getBooks = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const books = await Book.find({ userId }).sort({ createdAt: -1 });
    return res.json({ books: stripPdf(books) });
  } catch (error) {
    console.error('[Get Books Error]:', error);
    return res.status(500).json({ error: 'Server error fetching books.' });
  }
};

export const updateBook = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const book = await Book.findOne({ _id: req.params.id, userId });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const allowed = ['title', 'author', 'genre', 'pages', 'desc', 'color', 'googleBookId', 'coverUrl', 'hasPdf'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) (book as any)[field] = req.body[field];
    });
    await book.save();
    return res.json(book);
  } catch (error) {
    console.error('[Update Book Error]:', error);
    return res.status(500).json({ error: 'Server error updating book.' });
  }
};

export const deleteBook = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, userId });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('[Delete Book Error]:', error);
    return res.status(500).json({ error: 'Server error deleting book.' });
  }
};

export const uploadPdf = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const book = await Book.findOne({ _id: req.params.id, userId });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const { pdf } = req.body;
    if (!pdf) return res.status(400).json({ error: 'PDF data is required (base64-encoded)' });

    book.pdf = pdf;
    book.hasPdf = true;
    await book.save();
    return res.json({ message: 'PDF uploaded successfully', hasPdf: true });
  } catch (error) {
    console.error('[Upload PDF Error]:', error);
    return res.status(500).json({ error: 'Server error uploading PDF.' });
  }
};

export const getPdf = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const book = await Book.findOne({ _id: req.params.id, userId });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (!book.pdf) return res.status(404).json({ error: 'No PDF uploaded for this book' });

    const raw = book.pdf instanceof Buffer ? book.pdf.toString('utf-8') : book.pdf;
    const buf = Buffer.from(raw, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.title}.pdf"`);
    res.setHeader('Content-Length', buf.length);
    return res.send(buf);
  } catch (error) {
    console.error('[Get PDF Error]:', error);
    return res.status(500).json({ error: 'Server error fetching PDF.' });
  }
};
