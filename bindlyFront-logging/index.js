const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(bodyParser.json()); // Parse JSON bodies

// Middleware to log the content-length of the request
app.use((req, res, next) => {
  console.log(`Received request with content-length: ${req.headers['content-length']} bytes`);
  next();
});

// Routes
app.get('/hello', (req, res) => {
  res.send('Hello10 World!');
});

app.post('/log', (req, res) => {
  const {logData} = req.body;
  console.log('Received log data:', logData);
  res.status(200).json({ message: 'Log received' });
});

// Start the server (commented out for serverless deployment)
// app.listen(port, () => {
//   console.log(`Listening app listening at ${port}`);
// });

module.exports.handler = serverless(app);
