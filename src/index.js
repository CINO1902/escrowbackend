require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

// routes
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// connect to DB
connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get('/', (_req, res) => {
  res.json('hello world');
});

// error handler
app.use(errorHandler);

// **No app.listen() here!**
// Just export the app for Vercel to wrap as a function:
module.exports = app;
