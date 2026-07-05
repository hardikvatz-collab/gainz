export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/workout/:path*", "/fuel/:path*"],
};
