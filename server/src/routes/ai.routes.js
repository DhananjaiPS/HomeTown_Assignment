const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const validate = require('../middlewares/validate.middleware');
const protect = require('../middlewares/auth.middleware');
const { hintSchema } = require('../validators/ai.validator');

router.use(protect);

router.post('/hint', validate(hintSchema), aiController.getHint);

module.exports = router;
