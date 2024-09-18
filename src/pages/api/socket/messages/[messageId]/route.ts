import { NextResponse } from "next/server";
import { currentProfilePages } from "../../../../../lib/current-profile-pages";
import { db } from "../../../../../lib/db";
import { MemberRole } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseServerIo } from "@/types";

export async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse, // 변경
  { params }: { params: { messageId: string } }
) {
  try {
    const profile = await currentProfilePages(req); // req를 NextApiRequest로 사용
    const url = req.url ?? ""; // req.url이 undefined일 경우 빈 문자열로 처리
    const { searchParams } = new URL(url);

    const serverId = searchParams?.get("serverId");
    const channelId = searchParams?.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let message = await db.message.findFirst({
      where: {
        id: params.messageId,
        channelId: channelId,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    message = await db.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        fileUrl: null,
        content: "This Message has been deleted",
        deleted: true,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.log(error, "에러 발생 [MessageId]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextApiRequest, // 변경
  res: NextApiResponseServerIo, // 변경
  { params }: { params: { messageId: string } }
) {
  try {
    const profile = await currentProfilePages(req);
    const url = req.url ?? ""; // req.url이 undefined일 경우 빈 문자열로 처리
    const { searchParams } = new URL(url);
    // const { content } = await req.json();
    const { content } = req.body;

    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content Missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let message = await db.message.findFirst({
      where: {
        id: params.messageId,
        channelId: channelId,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isMessageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    message = await db.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        content,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const updateKey = `chat:${channelId}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);

    return NextResponse.json(message);
  } catch (error) {
    console.log(error, "에러 발생 [MessageId]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
