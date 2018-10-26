const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');

const chromeCapabilities = Capabilities.chrome();
const chromeOptions = {
    'args': ['--test-type', '--start-maximized', '--disable-plugins'],
    'prefs': {
      'download.default_directory': '/Users/**/app/output/'
    }
};

chromeCapabilities.set('chromeOptions', chromeOptions);

async function createPrototype(parameters) {
  let driver = await new Builder().forBrowser('chrome')
    .withCapabilities(chromeCapabilities)
    .build();

  try {
    await driver.get('http://www.google.com');
    await driver.getTitle().then(function(title) {
      console.log('Old page title is: ' + title);
    })
    // await driver.wait(until.elementLocated(By.id('lst-ib')), 20000);
    const element = await driver.findElement(By.name('q'));
    await element.sendKeys('Cheese!');
    await element.submit();
    await driver.getTitle().then(function(title) {
      console.log('New age title is: ' + title);
    });
  } finally {
    await driver.quit();
  }
};

module.exports = {
  createPrototype
};
