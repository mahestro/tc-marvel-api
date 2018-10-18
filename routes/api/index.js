var router = require('express').Router(),
    mailRouter = require('./mail'),
    deviceRouter = require('./devices'),
    teamRouter = require('./teams'),
    requestRouter = require('./requests');

router.use('/mail', mailRouter);
router.use('/devices', deviceRouter);
router.use('/teams', teamRouter);
router.use('/requests', requestRouter);

module.exports = router;
