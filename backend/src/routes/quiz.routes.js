const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Quiz routes coming in Week 2' });
});

module.exports = router;