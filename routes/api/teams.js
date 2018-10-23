
var router = require('express').Router(),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    Request = mongoose.model('Request'),
    ProjectDevice = mongoose.model('ProjectDevice');


router.param('team', function(req, res, next, idTeamMarvelApp) {
  Team.findOne({ idTeamMarvelApp: idTeamMarvelApp })
    .then(function(team) {
      if (!team) { return res.sendStatus(404); }

      req.team = team;

      return next();
    }).catch(function(err) {
      next(err);
    });
});

router
  .post('/', function(req, res, next) {
    var team = new Team(req.body.team);
    return team.save()
      .then(function(doc) {
        Team.findById(doc._id)
          .populate('projectTypes')
          .exec()
          .then(function(result) {
            return res.json({ team: result.toJSONFor() });
          });
      })
      .catch(function(err) {
        next(err);
      });
  })
  .put('/:team', function(req, res, next) {
    var team = req.team;

    if (typeof req.body.team.idTeamMarvelApp !== 'undefined') {
      team.idTeamMarvelApp = req.body.team.idTeamMarvelApp;
    }

    if (typeof req.body.team.idTopcoderChallenge !== 'undefined') {
      team.idTopcoderChallenge = req.body.team.idTopcoderChallenge;
    }

    if (typeof req.body.team.teamName !== 'undefined') {
      team.teamName = req.body.team.teamName;
    }

    if (typeof req.body.team.baseName !== 'undefined') {
      team.baseName = req.body.team.baseName;
    }

    if (typeof req.body.team.projectTypes !== 'undefined') {
      team.projectTypes = req.body.team.projectTypes;
    }

    return team.save()
      .then(function(doc) {
        Team.findById(doc._id)
          .populate('projectTypes')
          .exec()
          .then(function(result) {
            return res.json({ team: result.toJSONFor() });
          });
      })
      .catch(function(err) {
        next(err);
      });
  })
  .get('/:team', function(req, res, next) {
    Promise.all([
      req.team
    ]).then(function(result) {
      team = result[0];
      return res.json({team: team.toJSONFor()})
    }).catch(function(err) {
      next(err);
    });
  })
  .delete('/:team', function(req, res, next) {
    var team = req.team;
    return team.remove().then(function() {
      return res.sendStatus(204);
    }).catch(function(err) {
      next(err);
    });
  })
  .get('/', function(req, res, next) {
    Promise.all([
      Team.find({})
        .sort({_id: 'desc'})
        .populate('projectTypes')
        .exec()
    ]).then(function(results) {
      var teams = results[0];
      return res.json({
        teams: teams.map(function(team){
          return team.toJSONFor();
        })
      });
    });
  })
  .get('/:team/requests', function(req, res, next) {
    Promise.all([
      Request.find({idTeamMarvelApp: req.team.idTeamMarvelApp})
        .sort({createdAt: 'desc'})
        .populate('projects')
        .exec()
    ]).then(function(results) {
      var requests = results[0];
      return res.json({
        requests: requests.map(function(request){
          return request.toJSONFor();
        })
      });
    }).catch(function(err) {
      next(err);
    });
  });

module.exports = router;
