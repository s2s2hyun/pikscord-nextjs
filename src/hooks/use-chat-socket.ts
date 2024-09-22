import { useSocket } from "@/components/provider/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("useChatSocket 효과 실행, socket 상태:", !!socket);

    if (!socket) {
      console.log("소켓 연결이 없습니다.");
      return;
    }

    console.log("소켓 연결 상태:", socket.connected);

    const handleNewMessage = (message: MessageWithMemberWithProfile) => {
      console.log("새 메시지 수신:", message);
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          console.log("기존 데이터 없음, 새 데이터 생성");
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        console.log("업데이트된 쿼리 데이터:", newData);
        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    const handleUpdateMessage = (message: MessageWithMemberWithProfile) => {
      console.log("메시지 업데이트 수신:", message);
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          console.log("업데이트할 데이터 없음");
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: MessageWithMemberWithProfile) =>
            item.id === message.id ? message : item
          ),
        }));

        console.log("메시지 업데이트 후 데이터:", newData);
        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    socket.on(addKey, handleNewMessage);
    socket.on(updateKey, handleUpdateMessage);

    return () => {
      console.log("소켓 이벤트 리스너 제거");
      socket.off(addKey, handleNewMessage);
      socket.off(updateKey, handleUpdateMessage);
    };
  }, [queryClient, addKey, updateKey, queryKey, socket]);
};
