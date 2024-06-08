const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;

app.use((req, res, next) => {
  console.log(`Received request with content-length: ${req.headers['content-length']} bytes`);
  next();
});

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '50mb' }));

// Routes
app.get('/hello', (req, res) => {
  res.send('Hello8 World!');
});

app.use('/bindly', require('./routes/bindly'));


// Start the server
// app.listen(port, () => {
//   console.log(`Listening app listening at ${port}`);
// });


module.exports.handler=serverless(app)