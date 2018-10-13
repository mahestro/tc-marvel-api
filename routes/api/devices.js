var router = require('express').Router(),
    mongoose = require('mongoose'),
    ProjectDevice = mongoose.model('ProjectDevice');

router
  .get('/', function(req, res, next) {
    ProjectDevice.find({}).then(function(results) {
      return res.json({
        devices: results.map(function(data) {
          return data.toJSONFor();
        })
      });
    }).catch(next);
  });

module.exports = router;
