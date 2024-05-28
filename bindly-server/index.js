const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON bodies

// Routes
app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.use('/bindly', require('./routes/bindly'));


// Start the server
app.listen(port, () => {
  console.log(`Listening app listening at ${port}`);
});


// module.exports.handler=serverless(app)