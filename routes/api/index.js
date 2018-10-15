var router = require('express').Router(),
    mailRouter = require('./mail'),
    deviceRouter = require('./devices'),
    teamRouter = require('./teams');

router.use('/mail', mailRouter);
router.use('/devices', deviceRouter);
router.use('/teams', teamRouter);

module.exports = router;
