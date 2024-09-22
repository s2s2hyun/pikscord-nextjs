import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";

export const dynamic = "force-dynamic";

interface CustomGlobal extends Global {
  io?: SocketIOServer;
}

declare const global: CustomGlobal;

export async function GET(req: NextRequest) {
  if (!global.io) {
    console.log("Initializing Socket.IO server...");

    global.io = new SocketIOServer({
      path: "/api/socket/io",
      cors: {
        origin: "*", // CORS 설정
      },
    });

    global.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    console.log("Socket.IO server initialized");
  } else {
    console.log("Socket.IO server already running");
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export const POST = GET;
