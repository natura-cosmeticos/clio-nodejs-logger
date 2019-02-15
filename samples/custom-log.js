const Logger = require('../index');

const correlationId = '39c74d4d-50a9-4ccb-8c7d-ac413564f4a1';

const logger = new Logger({ context: { correlationId }, logPatterns: '*', namespace: 'app' });

const customAttributes = {
  currentUser: 'User X',
  orderNumber: '1234',
  orderStatus: 'PENDING',
};

logger.log('hello from Clio', customAttributes);
