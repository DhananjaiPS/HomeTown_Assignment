const { z } = require('zod');

const submitAssignmentSchema = z.object({
  body: z.object({
    articleId: z.string(),
    assignmentId: z.string(),
    timeTakenSeconds: z.number().min(0).optional(),
    answers: z.array(z.object({
      questionId: z.string(),
      userAnswer: z.string().optional(),
      selectedOption: z.string().optional()
    }))
  })
});

module.exports = { submitAssignmentSchema };
