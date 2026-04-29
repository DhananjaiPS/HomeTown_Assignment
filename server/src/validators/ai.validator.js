const { z } = require('zod');

const hintSchema = z.object({
  body: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
    questionText: z.string().min(5, 'Question text is required')
  })
});

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required'),
    articleId: z.string().optional(),
    assignmentId: z.string().optional(),
    mode: z.enum(['normal', 'hint', 'viva', 'interview', 'strict_teacher', 'code_helper']).optional()
  }).passthrough()
});

const ingestSchema = z.object({
  body: z.object({
    articleId: z.string().min(1, 'Article ID is required')
  }).passthrough()
});

module.exports = { hintSchema, chatSchema, ingestSchema };
