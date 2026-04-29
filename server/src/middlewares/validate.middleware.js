const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.log('--- VALIDATION FAILED ---');
      console.log(JSON.stringify(err.flatten(), null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.flatten()
      });
    }
    next(err);
  }
};

module.exports = validate;
