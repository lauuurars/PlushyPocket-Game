import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import { createServer } from 'http';
//import { Server } from 'socket.io';
import { GameRouter } from './src/game/game.router';
import { UserRouter } from './src/user/user.router';
import { AuthRouter } from './src/auth/auth.router';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/game', GameRouter);
app.use('/api/user', UserRouter);
app.use('/api/auth', AuthRouter);

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`PlushyPocket server running :P ${PORT}`);
});