
var router = require('express').Router(),
  mongoose = require('mongoose'),
  Team = mongoose.model('Team'),
  Request = mongoose.model('Request'),
  Prototype = mongoose.model('Prototype'),
  async = require('async');

  var apolloLink = require('apollo-link');
  var linkHttp = require('apollo-link-http');
  var gql = require('graphql-tag');
  var fetch = require('node-fetch');

  var execute = apolloLink.execute;
  var makePromise = apolloLink.makePromise;
  var HttpLink = linkHttp.HttpLink;

  const uri = 'https://api.marvelapp.com/graphql';
  const token = 'IvsXbXpa4XrkUyHYtb4jS5RRZVFqrF';
  const link = new HttpLink({
    uri,
    fetch: fetch,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  const operation = {
    query: gql`query projects {
                project(pk: 3350906) {
                  companyPk
                  settings {
                    deviceFrame
                  }
                }
              }`
  };

  // execute returns an Observable so it can be subscribed to
  execute(link, operation).subscribe({
    next: data => console.log(`received data: ${JSON.stringify(data, null, 2)}`),
    error: error => console.log(`received error ${error}`),
    complete: () => console.log(`complete`),
  })

  // For single execution operations, a Promise can be used
  makePromise(execute(link, operation))
    .then(data => console.log(`received data ${JSON.stringify(data, null, 2)}`))
    .catch(error => console.log(`received error ${error}`))

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
        var projectsInProcess = req.team.projectTypes.length;
        var projects = [];
        var protoId = Math.floor(Math.random(1) * 50000);

        async.each(req.team.projectTypes, function(projectType) {
          var prototype = new Prototype({
            title: `${req.team.baseName} - ${req.team.baseCount} - ${projectType.projectName}`,
            idPrototypeMarvelApp: protoId,
            projectType: projectType._id
          });

          protoId += 1;

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



    // var request = new Request({
    //   ...req.body.request,
    //   projects: projects
    // });

    // return request.save().then(function() {
    //   return res.json({ request: request.toJSONFor() });
    // }).catch(function(err) {
    //   next(err);
    // });
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
