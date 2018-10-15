
var router = require('express').Router(),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    ProjectDevice = mongoose.model('ProjectDevice');


router.param('team', function(req, res, next, idTeamMarvelApp) {
  Team.findOne({ idTeamMarvelApp: idTeamMarvelApp })
    .then(function(team) {
      if (!team) { return res.sendStatus(404); }

      req.team = team;

      return next();
    }).catch(next);
});

router
  .post('/', function(req, res) {
    var team = new Team(req.body.team);
    return team.save().then(function() {
      return res.json({ team: team.toJSONFor() });
    });
  })
  .get('/:team', function(req, res, next) {
    Team.findById(req.params.team).then(function(result) {
      if (!result) {
        return res.sendStatus(404);
      }

      return res.json({team: result.toJSONFor()});
    }).catch(function(err) {
      return next(err);
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

    return team.save().then(function() {
      return res.json({ team: team.toJSONFor() });
    });
  })
  .delete('/:team', function(req, res, next) {
    var team = req.team;
    return team.remove().then(function() {
      return res.sendStatus(204);
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
  });

module.exports = router;
