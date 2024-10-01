import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    console.log(cursor, "cursor 지금 뭔가 잘못된가?");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor) {
      // 커서가 있는 경우 (페이지네이션 요청)
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // 초기 요청 (커서 없이 처음 10개만 가져오기)
      messages = await db.message.findMany({
        take: MESSAGES_BATCH, // 처음 요청 시에도 10개씩만 가져오기
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // 다음 커서를 설정
    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[messages.length - 1].id;
    }

    console.log("Messages length:", messages.length);
    console.log("Next cursor:", nextCursor);

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log(error, "[Message_GET]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
