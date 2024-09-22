import { Server as ServerIo } from "socket.io";
import { NextApiResponse } from "next";
import { Socket } from "net";

let io: ServerIo | undefined = undefined;

// 커스텀 타입 정의: Next.js의 res.socket 객체가 확장된 형태임을 명시
interface CustomNextApiResponse extends NextApiResponse {
  socket: Socket & {
    server: any; // server에 대한 타입을 any로 지정하여 타입스크립트 오류 방지
  };
}

export const initializeSocket = (res: CustomNextApiResponse): ServerIo => {
  if (!res.socket) {
    throw new Error("res.socket이 정의되지 않았습니다.");
  }

  if (!res.socket.server) {
    throw new Error("res.socket.server가 정의되지 않았습니다.");
  }

  if (!io) {
    console.log("Socket.IO 서버를 초기화합니다.");

    const httpServer = res.socket.server;

    io = new ServerIo(httpServer, {
      path: "/api/socket/io",
      cors: {
        origin: "*",
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("클라이언트가 연결되었습니다.", socket.id);

      socket.on("disconnect", () => {
        console.log("클라이언트가 연결을 종료했습니다.", socket.id);
      });
    });
  } else {
    console.log("Socket.IO 서버가 이미 실행 중입니다.");
  }

  return io;
};
