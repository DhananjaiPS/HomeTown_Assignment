import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false // Connect manually when needed
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
