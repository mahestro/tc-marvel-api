var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    ProjectDevice = require('./models/ProjectDevice'),
    Prototype = require('./models/Prototype'),
    Request = require('./models/Request'),
    Team = require('./models/Team');
    require('dotenv').config();

var isProduction = process.env.NODE_ENV === 'production';
var port = process.env.PORT || 3001;

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'tc-marvel', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/tc-marvel');
  mongoose.set('debug', true);

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
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


// const { Builder, By, until } = require('selenium-webdriver');
// const capabilities = {
//     'browserName': 'chrome',
//     'chromeOptions': {
//       'args' : ["--disable-plugins"]
//     }
// };
// const driver = new Builder().withCapabilities(capabilities).build();

// driver.get('http://www.google.com')
//   .then(() => {
//     driver.getTitle().then(function(title) {
//       console.log('Old page title is: ' + title);
//     })
//   })

// var element = driver.findElement(By.name('q'));
// element.sendKeys('Cheese!')
//   .then(() => {
//     element.submit()
//       .then(() => {
//         driver.getTitle()
//           .then(function(title) {
//             console.log('New age title is: ' + title);
//             driver.close()
//               .catch(err => {console.log(err)});
//             driver.quit()
//             .catch(err => {console.log(err)});
//           })
//           .catch(err => {
//             console.log(err);
//           });
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   })
//   .catch(err => {
//     console.log(err);
//   });



const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
var chromeCapabilities = Capabilities.chrome();
var chromeOptions = {
    'args': ['--test-type', '--start-maximized', '--disable-plugins'],
    'prefs': {
      'download.default_directory': '/Users/**/app/output/'
    }
};
chromeCapabilities.set('chromeOptions', chromeOptions);

(async function google() {
  let driver = await new Builder().forBrowser('chrome')
    .withCapabilities(chromeCapabilities)
    .build();

  try {
    await driver.get('http://www.google.com');
    await driver.getTitle().then(function(title) {
      console.log('Old page title is: ' + title);
    })
    await driver.wait(until.elementLocated(By.id('lst-ib')), 20000);
    const element = await driver.findElement(By.name('q'));
    await element.sendKeys('Cheese!');
    await element.submit();
    await driver.getTitle().then(function(title) {
      console.log('New age title is: ' + title);
    });
  } finally {
    await driver.quit();
  }
})();
