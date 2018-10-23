
var router = require('express').Router(),
  mongoose = require('mongoose'),
  Team = mongoose.model('Team'),
  Request = mongoose.model('Request'),
  Prototype = mongoose.model('Prototype'),
  async = require('async'),
  gql = require('graphql-tag'),
  config = require('../../utils/config'),
  graphConnector = require('../../utils/graphql-connect');

router.param('challenge', function(req, res, next, idTopcoderChallenge) {
  Team.findOne({ idTopcoderChallenge: idTopcoderChallenge })
    .populate('projectTypes')
    .exec()
    .then(function(team) {
      if (!team) { return res.sendStatus(404); }

      req.team = team;

      return next();
    }).catch(function(err) {
      next(err);
    });
});

router.param('request', function(req, res, next, idRequest) {
  Request.findOne({ _id: idRequest })
    .then(function(request) {
      if (!request) { return res.sendStatus(404); }

      req.request = request;

      return next();
    }).catch(function(err) {
      next(err);
    });
});

router
  .post('/:challenge', function(req, res, next) {
    var tasks = [
      function createPrototypes(cb) {
        var mutationNewProject = {
          query: gql`mutation newProject($companyId: Int, $teamId: Int, $projectName: String!, $device: FrameEnum) {
            createProject(input: {
              companyPk: $companyId,
              teamPk: $teamId,
              name: $projectName,
              settings: {
                deviceFrame: $device
              }
            }) {
              ok
              project {
                pk
                name
                prototypeUrl
              }
            }
          }`
        };

        var projectsInProcess = req.team.projectTypes.length;
        var projects = [];

        async.each(req.team.projectTypes, function(projectType) {
          mutationNewProject.variables = {
            companyPk: config.MARVELAPP_TC_COMPANYID,
            teamId: req.team.idTeamMarvelApp,
            projectName: `${req.team.baseName} - ${req.team.baseCount} - ${projectType.projectName}`,
            device: projectType.marvelAppId,
          };

          graphConnector.makePromise(graphConnector.execute(graphConnector.link, mutationNewProject))
            .then(function(data) {
              if (data.data.createProject.ok) {
                var projectData = data.data.createProject.project;
                var prototype = new Prototype({
                  title: projectData.name,
                  idPrototypeMarvelApp: projectData.pk,
                  prototypeUrl: projectData.prototypeUrl,
                  projectType: projectType._id,
                  baseCount: req.team.baseCount
                });

                prototype
                  .save()
                  .then(function() {
                    projects.push(prototype._id);
                    projectsInProcess--;

                    if (projectsInProcess === 0) {
                      cb(null, projects);
                    }
                  })
                  .catch(function(err) {
                    cb(err);
                  });
              }
            })
            .catch(function(error) {
              console.log(`received error ${error}`);
              cb(error);
            });
        });
      },
      function saveRequest(projects, cb) {
        req.team.baseCount += 1;
        req.team.save()
          .catch(function(err) {
            return cb(err);
          });

        var request = new Request({
          ...req.body.request,
          projects: projects
        });

        request.save().then(function(doc) {
            Request.findById(doc._id)
              .populate('projects')
              .then(function(result) {
                return cb(null, { request: result.toJSONFor() });
              })
        }).catch(function(err) {
          return cb(err);
        });
      }
    ];

    async.waterfall(tasks, (err, results) => {
        if (err) {
            return next(err);
        }
        return res.json(results);
    });
  })
  .put('/:request', function(req, res, next) {
    var request = req.request;

    if (typeof req.body.request.tcEmail !== 'undefined') {
      request.tcEmail = req.body.request.tcEmail;
    }

    if (typeof req.body.request.tcHandle !== 'undefined') {
      request.tcHandle = req.body.request.tcHandle;
    }

    if (typeof req.body.request.projects !== 'undefined') {
      request.projects = req.body.request.projects;
    }

    return request.save().then(function() {
      return res.json({ request: request.toJSONFor() });
    });
  })
  .delete('/:request', function(req, res, next) {
    var request = req.request;
    return request.remove().then(function() {
      return res.sendStatus(204);
    }).catch(function(err) {
      next(err);
    });
  });

module.exports = router;
