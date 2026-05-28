import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import type { Request, Response, NextFunction } from 'express';
import {
  createAssignment,
  getAssignment,
  listAssignments,
  regenerateAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';

const router = Router();

// Multer: memory storage so we can parse PDF buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'text/plain'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

// Middleware: extract text from uploaded file
async function extractFileText(req: Request, res: Response, next: NextFunction) {
  if (!req.file) return next();
  try {
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      (req as any).extractedText = data.text.slice(0, 5000); // limit context
    } else {
      (req as any).extractedText = req.file.buffer.toString('utf-8').slice(0, 5000);
    }
  } catch (e) {
    console.warn('[Upload] Could not extract text from file:', e);
  }
  next();
}

router.post('/', upload.single('file'), extractFileText, createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
