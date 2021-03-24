import React, { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { host } from "../actions/consts/host";
const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ user, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io(host, { query: { socketId: user._id } });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
