interface Config {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  baseUrl: string;
}

const development: Config = {
  port: Number(process.env.PORT) || 3003,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  baseUrl: process.env.BASE_URL || 'http://localhost:3003',
};

const production: Config = {
  port: Number(process.env.PORT) || 3003,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  baseUrl: process.env.BASE_URL || 'https://imf-production-5750.up.railway.app/',
};

const config: Config = process.env.NODE_ENV === 'production' ? production : development;

export default config;
