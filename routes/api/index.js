var router = require('express').Router(),
    mailRouter = require('./mail'),
    deviceRouter = require('./devices'),
    teamRouter = require('./teams'),
    requestRouter = require('./requests'),
    auth = require('../auth');

router.use(function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent' });
  }

  if (auth.getBearerFromHeader(req) !== process.env.LOCAL_API_TOKEN) {
    return res.status(403).json({ error: 'Wrong authentication credentials' });
  }

  next();
});

router.use('/mail', mailRouter);
router.use('/devices', deviceRouter);
router.use('/teams', teamRouter);
router.use('/requests', requestRouter);

module.exports = router;
