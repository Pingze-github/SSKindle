
const router = require('express').Router();
const indexCtrl = require('../controllers/index');

module.exports = router;

router.get('/', indexCtrl.index);

router.get('/search', indexCtrl.search);

router.get('/book', indexCtrl.getBook);
