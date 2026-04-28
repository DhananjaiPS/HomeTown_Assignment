const { z } = require('zod');

const hintSchema = z.object({
  body: z.object({
    questionText: z.string().min(5)
  })
});

module.exports = { hintSchema };
