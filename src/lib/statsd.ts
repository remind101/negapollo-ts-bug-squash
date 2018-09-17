// Initializes a statsd client with the proper suffix.
import { StatsD, StatsDConfig } from 'node-statsd';

// If STATSD_ADDR is not set, we will use a mock client.
const addr = process.env.STATSD_ADDR || 'mock:8125';
const [host, strPort] = addr.split(':');
const port = parseInt(strPort, 10);

const config: StatsDConfig = {
  host,
  port,
  cacheDns: true,
  mock: host === 'mock',
  global_tags: [
    `empire.app.name:${process.env.EMPIRE_APPNAME}`,
    `empire.app.process:${process.env.EMPIRE_PROCESS}`,
  ],
};

const client = new StatsD(config);

export default client;
