var router = require('express').Router(),
    mailRouter = require('./mail'),
    deviceRouter = require('./devices');

router.use('/mail', mailRouter);
router.use('/devices', deviceRouter);

module.exports = router;
