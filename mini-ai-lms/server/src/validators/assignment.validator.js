const { z } = require('zod');

const questionSchema = z.object({
  questionText: z.string().min(3),
  type: z.enum(['mcq', 'short_answer']),
  options: z.array(z.object({
    label: z.string(),
    text: z.string()
  })).optional(),
  correctOption: z.string().optional(),
  expectedAnswer: z.string().optional(),
  rubric: z.string().optional(),
  marks: z.number().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional()
});

const createAssignmentSchema = z.object({
  body: z.object({
    articleId: z.string(),
    title: z.string().min(3),
    instructions: z.string().optional(),
    questions: z.array(questionSchema).min(1),
    totalMarks: z.number().min(1),
    maxAttempts: z.number().min(1).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

const updateAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    instructions: z.string().optional(),
    questions: z.array(questionSchema).optional(),
    totalMarks: z.number().min(1).optional(),
    maxAttempts: z.number().min(1).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

module.exports = { createAssignmentSchema, updateAssignmentSchema };
