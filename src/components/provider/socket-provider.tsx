"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIo, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      const socketInstance = ClientIo(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        {
          path: "/api/socket/io",
        }
      );

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      // 연결 에러 핸들링
      socketInstance.on("connect_error", (err) => {
        console.error(
          "Socket connection error:",
          err.message,
          err,
          "<<<<<++++++에러가 뭐야 "
        );
      });

      // 다른 에러 처리 (ex: authorization error)
      socketInstance.on("error", (err) => {
        console.error("Socket error:", err);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } catch (error) {
      console.error("Error setting up socket instance:", error);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
