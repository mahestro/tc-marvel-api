
var router = require('express').Router(),
  mongoose = require('mongoose'),
  Team = mongoose.model('Team'),
  Request = mongoose.model('Request'),
  Prototype = mongoose.model('Prototype'),
  async = require('async'),
  // apolloLink = require('apollo-link'),
  // linkHttp = require('apollo-link-http'),
  gql = require('graphql-tag'),
  // fetch = require('node-fetch')
  config = require('../../utils/config'),
  graphConnector = require('../../utils/graphql-connect');

// var execute = apolloLink.execute;
// var makePromise = apolloLink.makePromise;
// var HttpLink = linkHttp.HttpLink;

// var link = new HttpLink({
//   uri: config.MARVELAPP_GQL_URL,
//   fetch: fetch,
//   headers: {
//     authorization: `Bearer ${process.env.MARVELAPP_TOKEN}`
//   }
// });



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
        var operationNewProject = {
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
          operationNewProject.variables = {
            companyPk: config.MARVELAPP_TC_COMPANYID,
            teamId: req.team.idTeamMarvelApp,
            projectName: `${req.team.baseName} - ${req.team.baseCount} - ${projectType.projectName}`,
            device: projectType.marvelAppId,
          };

          graphConnector.makePromise(graphConnector.execute(graphConnector.link, operationNewProject))
            .then(function(data) {
              if (data.data.createProject.ok) {
                var projectData = data.data.createProject.project;
                var prototype = new Prototype({
                  title: projectData.name,
                  idPrototypeMarvelApp: projectData.pk,
                  prototypeUrl: projectData.prototypeUrl,
                  projectType: projectType._id
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
        var request = new Request({
          ...req.body.request,
          projects: projects
        });

        request.save().then(function() {
          return cb(null, { request: request.toJSONFor() });
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
