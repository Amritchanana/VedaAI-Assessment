import OpenAI from 'openai';
import type { AssignmentInput, GeneratedPaper, GeneratedSection, GeneratedQuestion, QuestionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis';

// Initialize OpenRouter client
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'VedaAI - Assessment Generator',
  },
});

const Q_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice Questions (MCQ)',
  short_answer: 'Short Answer Questions',
  long_answer: 'Long Answer / Essay Questions',
  true_false: 'True or False Questions',
  fill_in_blank: 'Fill in the Blank Questions',
};

function buildPrompt(input: AssignmentInput): string {
  const qTypesList = input.questionTypes.map(t => Q_TYPE_LABELS[t]).join(', ');

  return `You are an expert teacher creating a structured exam question paper.

ASSIGNMENT DETAILS:
- Title: ${input.title}
- Subject: ${input.subject}
${input.grade ? `- Grade/Class: ${input.grade}` : ''}
- Question Types: ${qTypesList}
- Total Questions: ${input.totalQuestions}
- Total Marks: ${input.totalMarks}
- Difficulty: ${input.difficulty}
${input.additionalInstructions ? `- Special Instructions: ${input.additionalInstructions}` : ''}
${input.fileContent ? `\nSOURCE MATERIAL (generate questions based on this):\n${input.fileContent.slice(0, 3000)}` : ''}

INSTRUCTIONS:
1. Create one Section per question type (Section A for first type, Section B for second, etc.)
2. Distribute questions evenly across sections
3. Each question must have appropriate marks (MCQ: 1-2 marks, Short Answer: 3-5 marks, Long Answer: 8-10 marks)
4. Total marks across all questions MUST equal ${input.totalMarks}
5. Difficulty distribution: ${input.difficulty === 'mixed' ? '40% easy, 40% medium, 20% hard' : `all ${input.difficulty}`}
6. For MCQ questions, provide exactly 4 options labeled A, B, C, D

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text before or after.

{
  "title": "${input.title}",
  "subject": "${input.subject}",
  "grade": "${input.grade || ''}",
  "duration": "2 Hours",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questionType": "mcq",
      "questions": [
        {
          "text": "Question text here?",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
        }
      ]
    }
  ]
}

Rules:
- "questionType" must be one of: mcq, short_answer, long_answer, true_false, fill_in_blank
- "difficulty" must be one of: easy, medium, hard
- "options" array is ONLY for mcq type, omit for all other types
- Every question needs "text", "difficulty", and "marks"`;
}

export async function generateQuestionPaper(
  input: AssignmentInput,
  onProgress?: (progress: number, message: string) => void
): Promise<GeneratedPaper> {
  // Check Redis cache first
  onProgress?.(5, 'Checking cache...');
  const cacheKey = `assessment:${input.subject}:${input.difficulty}:${input.questionTypes.sort().join(',')}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    onProgress?.(100, 'Loaded from cache');
    return JSON.parse(cached);
  }

  onProgress?.(10, 'Building prompt from assignment details...');

  const prompt = buildPrompt(input);

  onProgress?.(25, 'Sending to OpenRouter AI...');

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content || '';
    onProgress?.(65, 'Parsing AI response...');

    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`OpenRouter returned invalid JSON. Raw: ${rawText.slice(0, 300)}`);
    }

    onProgress?.(80, 'Structuring question paper...');

    const sections: GeneratedSection[] = (parsed.sections || []).map((sec: any, sIdx: number) => {
      const sectionLabel = sec.title || `Section ${String.fromCharCode(65 + sIdx)}`;
      const questions: GeneratedQuestion[] = (sec.questions || []).map((q: any) => ({
        id: uuidv4(),
        text: q.text || '',
        type: sec.questionType as QuestionType,
        difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium') as any,
        marks: Number(q.marks) || 1,
        options: q.options,
        answer: q.answer,
      }));

      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      return {
        title: sectionLabel,
        instruction: sec.instruction || 'Attempt all questions.',
        questionType: sec.questionType as QuestionType,
        questions,
        totalMarks,
      };
    });

    const totalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0);
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

    onProgress?.(95, 'Finalizing paper...');

    const result = {
      assignmentId: '',
      title: parsed.title || input.title,
      subject: parsed.subject || input.subject,
      grade: parsed.grade || input.grade,
      dueDate: input.dueDate,
      totalMarks,
      totalQuestions,
      duration: parsed.duration,
      sections,
      generatedAt: new Date().toISOString(),
    };

    // Cache the result for 24 hours
    await redisClient.setex(cacheKey, 86400, JSON.stringify(result)); // 86400 = 24 hours

    onProgress?.(100, 'Complete');
    return result;
  } catch (error: any) {
    throw new Error(`Failed to generate question paper: ${error.message}`);
  }}