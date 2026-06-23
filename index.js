import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is still in use. Run: npm run dev`);
    console.error('(It will auto-clear the port.) Or press Ctrl+C in the old server terminal.\n');
    process.exit(1);
  }
  throw err;
});
