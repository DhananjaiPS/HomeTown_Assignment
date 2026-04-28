const { z } = require('zod');

const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    slug: z.string().min(3),
    content: z.string().min(10),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    readingTimeMinutes: z.number().optional()
  })
});

const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    readingTimeMinutes: z.number().optional()
  })
});

const progressSchema = z.object({
  body: z.object({
    progressPercentage: z.number().min(0).max(100),
    completed: z.boolean().optional()
  })
});

module.exports = { createArticleSchema, updateArticleSchema, progressSchema };
