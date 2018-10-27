require('dotenv').config();
const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
console.log(`workers: ${WORKERS}`);

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);

function start() {
  var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    ProjectDevice = require('./models/ProjectDevice'),
    Prototype = require('./models/Prototype'),
    Request = require('./models/Request'),
    Team = require('./models/Team');

  var isProduction = process.env.NODE_ENV === 'production';
  var port = process.env.PORT || 3001;

  // Create global app object
  var app = express();

  mongoose.connect(isProduction ? process.env.MONGODB_URI : 'mongodb://localhost/tc-marvel', {
    useMongoClient: true
  });
  mongoose.set('debug', true);
  // mongoose.Promise = global.Promise
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  app.use(session({
    secret: 'tc-marvel-secret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: db,
      autoRemove: 'native'
    })
  }));

  app.use(cors());

  // Normal express config defaults
  app.use(require('morgan')('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(require('method-override')());
  app.use(express.static(__dirname + '/public'));

  if (!isProduction) {
    app.use(errorhandler());
  }

  app.use(require('./routes'));

  /// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  /// error handlers

  // development error handler
  // will print stacktrace
  if (!isProduction) {
    app.use(function(err, req, res, next) {
      console.log(err.stack);

      res.status(err.status || 500);

      res.json({'errors': {
        message: err.message,
        error: err
      }});
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: {}
    }});
  });

  // finally, let's start our server...
  var server = app.listen(port, function(){
    console.log('Listening on port ' + server.address().port);
  });
}
