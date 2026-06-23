import dotenv from 'dotenv';
import killPort from 'kill-port';

dotenv.config();

const port = Number(process.env.PORT) || 5000;

try {
  await killPort(port);
  console.log(`Port ${port} cleared — starting server...`);
} catch {
  console.log(`Port ${port} is free — starting server...`);
}
