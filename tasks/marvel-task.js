var async = require('async');
const { Builder, By, Key, until, promise, Capabilities } = require('selenium-webdriver');

const chromeCapabilities = Capabilities.chrome();
const chromeOptions = {
    'args': ['--test-type', '--start-maximized', '--disable-plugins', '--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    // 'args': ['--test-type', '--start-maximized', '--disable-plugins'],
    'prefs': {
      'download.default_directory': '/Users/**/app/output/'
    }
};

chromeCapabilities.set('chromeOptions', chromeOptions);

let driver;
const defaultWaitTime = 25000;

async function createPrototype(parameters) {
  const { prototypes, email } = parameters;

  try {
    driver = await new Builder().forBrowser('chrome')
      .withCapabilities(chromeCapabilities)
      .build();

    await login();

    // add collaborators loop: async counter
    let i = 0;
    do {
      await addCollaborator(email, prototypes[i].idPrototypeMarvelApp);
      await (async() => {
        i += 1;
      })();
    } while(i < prototypes.length)

    await process.send({
      error: false,
      log: '',
      payload: prototypes
    });
  } catch(err) {
    await process.send({
      error: true,
      log: err.message,
      payload: prototypes[0]
    });
  } finally {
    await driver.quit();
  }
};

async function login() {
  await driver.get('https://marvelapp.com/signin');
  const emailInput = await driver.wait(until.elementLocated(By.id('email')), defaultWaitTime);
  await emailInput.sendKeys(process.env.MARVELAPP_EMAIL);
  const passwordInput = driver.findElement(By.id('password'));
  await passwordInput.sendKeys(process.env.MARVELAPP_PASSWORD);
  await passwordInput.submit();
  await driver.wait(until.urlContains('dashboard'), defaultWaitTime);
}

async function addCollaborator(email, idPrototypeMarvelApp) {
  await driver.navigate().to(`https://marvelapp.com/project/${idPrototypeMarvelApp}`);
  const addCollaboratorLink = await driver.wait(until.elementLocated(By.id('open-collaborators')), defaultWaitTime);
  await driver.wait(until.elementIsVisible(addCollaboratorLink), defaultWaitTime);
  await addCollaboratorLink.click();
  const inviteByEmailTab = await driver.wait(until.elementLocated(By.xpath('//div[contains(text(), "Invite by Email")]')), defaultWaitTime);
  await driver.wait(until.elementIsVisible(inviteByEmailTab), defaultWaitTime);
  await inviteByEmailTab.click();
  const collaboratorEmailInput = await driver.wait(until.elementLocated(By.xpath('//div[@class="marginBottom-s"]//input[@placeholder="Enter email address"]')), defaultWaitTime);
  await collaboratorEmailInput.sendKeys(email);
  const inviteButton = await driver.findElement(By.xpath('//div[contains(text(), "Invite 1 person")]'));
  await inviteButton.click();
  await driver.wait(until.stalenessOf(inviteButton), defaultWaitTime);
}

module.exports = {
  createPrototype
};
