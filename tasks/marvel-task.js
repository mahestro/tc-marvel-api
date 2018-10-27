var async = require('async');
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
    await driver.get('https://marvelapp.com/signin');
    const emailInput = await driver.wait(until.elementLocated(By.id('email')), 20000);
    await emailInput.sendKeys(process.env.MARVELAPP_EMAIL);
    const passwordInput = driver.findElement(By.id('password'));
    await passwordInput.sendKeys(process.env.MARVELAPP_PASSWORD);
    await passwordInput.submit();
    await driver.wait(until.urlContains('dashboard'), 20000);

    await async.each(parameters.prototypes, async(prototype) => {
      await driver.navigate().to(`https://marvelapp.com/project/${prototype.idPrototypeMarvelApp}`);
      const addCollaboratorLink = await driver.wait(until.elementLocated(By.id('open-collaborators')), 50000);
      await driver.wait(until.elementIsVisible(addCollaboratorLink), 50000);
      await addCollaboratorLink.click();
      const inviteByEmailTab = await driver.wait(until.elementLocated(By.xpath('//div[contains(text(), "Invite by Email")]')), 20000);
      await driver.wait(until.elementIsVisible(inviteByEmailTab), 20000);
      await inviteByEmailTab.click();
      const collaboratorEmailInput = await driver.wait(until.elementLocated(By.xpath('//div[@class="marginBottom-s"]//input[@placeholder="Enter email address"]')), 20000);
      await collaboratorEmailInput.sendKeys(parameters.email);
      const inviteButton = await driver.findElement(By.xpath('//div[contains(text(), "Invite 1 person")]'));
      await inviteButton.click();
      await driver.wait(until.stalenessOf(inviteButton), 20000);
    });

    await process.send(parameters.prototypes);
  } catch(err) {
    throw(err);
  } finally {
    await driver.quit();
  }
};

module.exports = {
  createPrototype
};
