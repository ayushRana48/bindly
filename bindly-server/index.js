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
  res.send('Hello10 World!');
});


app.post('/log', (req, res) => {
  const {logData} = req.body;
  console.log('Received log data:', logData);
  res.status(200).json({ message: 'Log received' });
});

app.post('/paypal-webhook', (req, res) => {
  const event = req.body;

  console.log('Received PayPal Webhook Event:', event);

  if (event.event_type === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED') {
    // Handle success case
    console.log('Payout succeeded:', event.resource);
  } else if (event.event_type === 'PAYMENT.PAYOUTS-ITEM.FAILED') {
    // Handle failure case
    console.log('Payout failed:', event.resource);
  }

  res.sendStatus(200); // Acknowledge receipt of the webhook
});




app.use('/bindly', require('./routes/bindly'));


// Start the server
app.listen(port, () => {
  console.log(`Listening app listening at ${port}`);
});


module.exports.handler=serverless(app)