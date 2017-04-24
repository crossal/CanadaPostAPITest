
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');

const app = express();

const routes = require('./app/routes/');

const PORT = process.env.PORT || 8080;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost';

app.use(bodyParser.json());

routes.set(app);

app.listen(PORT, () => {
  winston.info(`App listening on ${SERVER_URL}:${PORT}`);
});

module.exports = app;
