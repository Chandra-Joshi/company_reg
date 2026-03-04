import dotenv from 'dotenv';
dotenv.config();

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'null',
];

const parseOrigins = (origins) =>
  origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const resolveClientOrigins = () => {
  const { ALLOWED_ORIGINS } = process.env;
  if (!ALLOWED_ORIGINS || !ALLOWED_ORIGINS.trim()) {
    return defaultOrigins;
  }
  return parseOrigins(ALLOWED_ORIGINS);
};

const config = {
  port: Number(process.env.PORT) || 5000,
  clientOrigins: resolveClientOrigins(),
};

export default config;
