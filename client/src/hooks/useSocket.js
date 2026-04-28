import { useEffect, useState } from 'react';
import { getSocket } from '../sockets/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = getSocket();
    s.connect();
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return socket;
};
