const { z } = require('zod');

const emptyStringToUndefined = (value) => {
  return value === '' ? undefined : value;
};

const questionSchema = z
  .object({
    _id: z.string().optional(),

    questionText: z.string().trim().min(1, 'Question text is required'),

    type: z.enum(['mcq', 'short_answer', 'msq', 'true_false']),

    options: z
      .array(
        z
          .object({
            _id: z.string().optional(),
            label: z.string().optional(),
            text: z.string().optional(),
            isCorrect: z.coerce.boolean().optional()
          })
          .passthrough()
      )
      .optional(),

    expectedAnswer: z.string().optional(),
    rubric: z.string().optional(),

    marks: z.coerce.number().min(1, 'Marks must be at least 1'),

    difficulty: z.enum(['easy', 'medium', 'hard']).optional()
  })
  .passthrough();

const createAssignmentSchema = z.object({
  body: z
    .object({
      articleId: z.string().min(1, 'Article is required'),

      title: z.string().trim().min(1, 'Title is required'),

      instructions: z.string().optional(),

      questions: z.array(questionSchema).min(1, 'At least one question is required'),

      totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),

      maxAttempts: z.coerce.number().min(1, 'Max attempts must be at least 1').optional(),

      dueDate: z.preprocess(
        emptyStringToUndefined,
        z.string().optional()
      ),

      status: z.enum(['active', 'inactive']).optional()
    })
    .passthrough()
});

const updateAssignmentSchema = z.object({
  body: z
    .object({
      _id: z.string().optional(),

      articleId: z.string().optional(),

      title: z.string().trim().min(1, 'Title is required').optional(),

      instructions: z.string().optional(),

      questions: z.array(questionSchema).optional(),

      totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1').optional(),

      maxAttempts: z.coerce.number().min(1, 'Max attempts must be at least 1').optional(),

      dueDate: z.preprocess(
        emptyStringToUndefined,
        z.string().optional()
      ),

      status: z.enum(['active', 'inactive']).optional()
    })
    .passthrough()
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentSchema
};