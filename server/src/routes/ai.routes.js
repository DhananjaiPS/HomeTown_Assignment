const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { hintSchema, chatSchema, ingestSchema } = require('../validators/ai.validator');

router.use(protect);

router.post('/hint', validate(hintSchema), aiController.getHint);
router.post('/chat', validate(chatSchema), aiController.chat);
router.post('/ingest', validate(ingestSchema), aiController.ingest);

module.exports = router;
