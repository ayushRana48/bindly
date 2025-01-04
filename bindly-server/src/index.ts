import express, { Express } from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import bindlyRoutes from './routes/bindly';

const app: Express = express();
const port: number = 3000;

app.use((req, res, next) => {
  console.log(`Received request with content-length: ${req.headers['content-length']} bytes`);
  next();
});

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.text({ limit: '50mb' }));

// Routes
app.get('/hello', (req, res) => {
  res.send('Hello10 World!');
});

app.post('/log', (req, res) => {
  const { logData } = req.body;
  console.log('Received log data:', logData);
  res.status(200).json({ message: 'Log received' });
});

app.post('/paypal-webhook', (req, res) => {
  const event = req.body;

  console.log('Received PayPal Webhook Event:', event);

  if (event.event_type === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED') {
    console.log('Payout succeeded:', event.resource);
  } else if (event.event_type === 'PAYMENT.PAYOUTS-ITEM.FAILED') {
    console.log('Payout failed:', event.resource);
  }

  res.sendStatus(200); // Acknowledge receipt of the webhook
});

app.use('/bindly', bindlyRoutes);

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Listening app listening at ${port}`);
  });
}

export const handler = serverless(app);