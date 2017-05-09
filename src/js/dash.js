import SocketIO from 'socket.io-client';
import * as DashRouter from './dash/router';

let io = SocketIO.connect();

DashRouter.Init();
