const express = require('express');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, (req, res) => {
  res.status(200).json({
    message: 'profile route placeholder — not implemented yet.',
    user: req.user.email,
  });
});

module.exports = router;