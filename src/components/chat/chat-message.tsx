"use client";

// import { format, parseISO } from "date-fns";
import { Member, Message, Profile } from "@prisma/client";
import { format, parseISO, isValid } from "date-fns";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2 } from "lucide-react";
import { Fragment, useRef, ElementRef, useEffect } from "react";
import { ChatItem } from "./chat-item";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

const formatDate = (date: Date | string) => {
  try {
    let dateObject: Date;
    if (typeof date === "string") {
      dateObject = parseISO(date);
    } else if (date instanceof Date) {
      dateObject = date;
    } else {
      throw new Error("Invalid date format");
    }

    if (!isValid(dateObject)) {
      throw new Error("Invalid date");
    }

    return format(dateObject, DATE_FORMAT);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessage = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:message`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  useChatSocket({
    queryKey,
    addKey,
    updateKey,
  });

  // if (status === "loading") {
  //   return (
  //     <div className="flex flex-col flex-1 justify-center items-center">
  //       <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
  //       <p className="text-xs text-zinc-500 dark:text-zinc-400 ">
  //         Loading messages....{" "}
  //       </p>
  //     </div>
  //   );
  // }

  console.log(hasNextPage, isFetchingNextPage);

  // console.log(data, "data!@?!?!?!");

  // 메시지가 추가되면 자동으로 스크롤을 아래로 이동
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]); // 데이터가 변경될 때마다 실행

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 ">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto ">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              className="h-6 w-[100pxㄴ] text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
              onClick={() => fetchNextPage()} // fetchNextPage 함수 호출 추가
            >
              이전 메시지
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessageWithMemberWithProfile) => (
              // <div key={message.id}>{message.content}</div>
              <ChatItem
                currentMember={member}
                key={message.id}
                id={message.id}
                content={message.content}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                timestamp={formatDate(message.createdAt)}
                member={message.member}
                isUpdated={message.updateAt !== message.createdAt}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
