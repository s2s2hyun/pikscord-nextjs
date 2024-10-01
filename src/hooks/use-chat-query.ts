import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/provider/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();

  // 페이지네이션 처리 함수
  const fetchMessages = async ({ pageParam = undefined }) => {
    console.log("Current pageParam:", pageParam);
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    // console.log("Request URL:", url); // 요청 URL 로그 확인
    const res = await fetch(url);
    const data = await res.json();
    // console.log("Response data:", data); // 응답 데이터 로그 확인
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => {
        console.log("Last page data:", lastPage);
        if (lastPage?.nextCursor) {
          console.log("Next cursor found:", lastPage.nextCursor);
          return lastPage.nextCursor; // 서버에서 반환된 nextCursor 사용
        }
        console.log("No more pages available");
        return undefined; // 마지막 페이지일 경우 undefined 반환
      },
      initialPageParam: undefined,
      refetchInterval: isConnected ? false : 1000,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
