// import { NextApiResponseServerIo } from "@/types";
// import { NextRequest } from "next/server";
// import { Server as NetServer } from "http";
// import { Server as SocketIOServer } from "socket.io";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// export async function GET(req: NextRequest, res: NextApiResponseServerIo) {
//   if (!res.socket.server.io) {
//     console.log("New Socket.io server...");
//     // @ts-ignore
//     const httpServer: NetServer = res.socket.server as any;
//     const io = new SocketIOServer(httpServer, {
//       path: "/api/socket/io",
//       addTrailingSlash: false,
//     });
//     // @ts-ignore
//     res.socket.server.io = io;
//   }

//   console.log("Socket is initializing");
//   res.socket.server.io.on("connection", (socket) => {
//     console.log("New client connected");
//   });

//   return new Response("Socket is running.", {
//     status: 200,
//   });
// }
