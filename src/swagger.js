const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Escrow API',
    description: 'API documentation for the Escrow backend service',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your bearer token in the format **Bearer <token>**'
    }
  }
};

const outputFile = './src/swagger-output.json';

// Include your main entry and all routes
const endpointsFiles = [
  './src/index.js',
  './src/routes/**/*.js'
];

const options = { 
  autoBody: true, 
  openapi: '3.0.0'
};

swaggerAutogen(outputFile, endpointsFiles, doc, options)
  .then(() => {
    console.log('✅ swagger-output.json generated.');
  })
  .catch(err => {
    console.error('🔥 swagger-autogen error:', err);
  }); 