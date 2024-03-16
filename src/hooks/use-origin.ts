import { useEffect, useState } from "react";

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  if (!mounted) {
    return "";
  }

  return origin;
};

// 서버 사이드 렌더링(SSR) 호환성: typeof window !== "undefined" 검사를 통해 "window" 객체의 존재 여부를 확인합니다.
// 이는 서버사이드 렌더링 환경에서 'window'객체가 없을 때 발생할 수 있는 오류를 방지, 이 훅은 클라이언트 사이드에서만 'window.location.origin'을 사용하고 ,ssr환경에서는 빈문자열을 반환
// 결국은 훅을 사용하므로서,원본 URL을 얻을수 있습니다.
// 여기서 "원본"이란 스키마(예: http 또는 https), 호스트(도메인 이름), 그리고 포트 번호를 포함한 기본 URL을 의미합니다.
