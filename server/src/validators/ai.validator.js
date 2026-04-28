const { z } = require('zod');

const hintSchema = z.object({
  body: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
    questionText: z.string().min(5, 'Question text is required')
  })
});

module.exports = { hintSchema };
