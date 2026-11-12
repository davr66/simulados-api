import express from 'express';
import { config } from './config.js';

const app = express();

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`API executando na porta ${config.port}.`);
});
