const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroup);
router.post('/:id/members', groupController.addMember);

module.exports = router;
