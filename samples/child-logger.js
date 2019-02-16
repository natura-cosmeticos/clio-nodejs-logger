const Logger = require('../index');

class ChildLoggerSample {
  constructor() {
    this.logger = Logger.current().createChildLogger('child-logger');
  }

  execute() {
    try {
      this.logger.debug('Child logger example');

      throw new Error('Sorry...');
    } catch (error) {
      this.logger.error(error.message, { errorCode: '5000', stack: error.stack });
    }
  }
}

const childLoggerSample = new ChildLoggerSample();

childLoggerSample.execute();
