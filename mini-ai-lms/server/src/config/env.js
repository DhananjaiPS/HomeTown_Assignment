const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

module.exports = _env.data;
