import { app } from './app.js';
import { config } from './config.js';
import { logger } from './observability/logger.js';

app.listen(config.port, () => {
  logger.info('API iniciada', {
    port: config.port,
    environment: config.nodeEnv,
  });
});
