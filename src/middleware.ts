import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // 존재하는 경로들만 설정
  publicRoutes: [
    "/api/uploadthing",
    "/api/channels",
    "/api/members",
    "/api/servers",
  ],
  debug: false,
  // 필요에 따라 ignoredRoutes도 수정
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
