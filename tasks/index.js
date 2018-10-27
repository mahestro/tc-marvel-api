var schedule = require('node-schedule'),
  marvelTask = require('./marvel-task');

process.on('message', function(message) {
  switch (message.operation) {
    case 'createPrototype':
      // schedule.scheduleJob(Date.now() + 0.1*60000, async() => {
      //   marvelTask.createPrototype(message.parameters);
      // });
      marvelTask.createPrototype(message.parameters);
      break;

    default:
      break;
  }
});
