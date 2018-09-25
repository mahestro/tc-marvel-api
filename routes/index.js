var router = require('express').Router(),
    apiRouter = require('./api');

router.use('/api', apiRouter);

module.exports = router;
