import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const isOrgSelectionRoute = createRouteMatcher(["/org-select(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  //allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  //allow non public routes
  if (!userId) {
    await auth.protect();
  }

  // protected non-public routes
  if (isOrgSelectionRoute(req)) {
    return NextResponse.next();
  }

  // for all protected routes, ensure org is selected
  if (userId && !orgId) {
    const orgSelection = new URL("/org-selection", req.url);
    return NextResponse.redirect(orgSelection);
  }

  return NextResponse.next();
})

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)",
  ],
};