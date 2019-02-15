const domain = require('domain');
const Logger = require('../index');

const currentDomain = domain.create();
const context = { correlationId: '39c74d4d-50a9-4ccb-8c7d-ac413564f4a1' };

currentDomain.logger = new Logger({ context, logPatterns: '*' });

function myAwesomeAppEntryPoint() {
  Logger.current().log('Awesome app running with execution context!');

  new Logger({ logPatterns: '*' }).log('Awesome app running without execution context!');
}

currentDomain.run(myAwesomeAppEntryPoint);
