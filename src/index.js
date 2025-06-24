require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
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
app.route("/").get((req,res)=>{
    res.json("hello world");
    });
    
// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
