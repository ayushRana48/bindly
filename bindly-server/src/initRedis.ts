import Redis from 'ioredis';



const redis = new Redis({
  host: 'bindlycache-pbpp0m.serverless.use1.cache.amazonaws.com',
  port: 6379,
  tls: {}, // Must be empty object for in-transit encryption
});

  

export { redis };