import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ── Single auth call — the ONLY Supabase API call in middleware ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // All main app routes require login
  const protectedPrefixes = [
    "/home",
    "/tree",
    "/people",
    "/directory",
    "/book",
    "/events",
    "/media",
    "/admin",
    "/fund",
  ];
  const isProtected = protectedPrefixes.some((r) => pathname.startsWith(r));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Read role & status from JWT claims only (no DB fallback) ──
  // The sync_profile_to_jwt DB trigger keeps these in-sync automatically.
  if (user && isProtected) {
    const role = (user.app_metadata?.role as string) ?? "";
    const status = (user.app_metadata?.status as string) ?? "";

    // Pending/rejected users can only see /home
    if (
      (status === "pending" || status === "rejected") &&
      pathname !== "/home"
    ) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // Non-admin users cannot access /admin
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // ── MFA check for /admin — only when user has MFA factors ──
    if (pathname.startsWith("/admin")) {
      const amr = (user.app_metadata?.amr as Array<{ method: string }>) ?? [];
      const hasMfaFactor = amr.some((a) => a.method === "totp");

      if (hasMfaFactor) {
        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalData?.currentLevel === "aal1") {
          const verifyUrl = new URL("/auth/mfa/verify", request.url);
          verifyUrl.searchParams.set("redirect", pathname);
          return NextResponse.redirect(verifyUrl);
        }
      }
    }

    // ── Pass profile data to downstream via headers (avoids re-query) ──
    supabaseResponse.headers.set("x-user-id", user.id);
    supabaseResponse.headers.set("x-user-role", role);
    supabaseResponse.headers.set("x-user-status", status);
    supabaseResponse.headers.set(
      "x-user-name",
      (user.user_metadata?.full_name as string) ?? "",
    );
    supabaseResponse.headers.set(
      "x-user-email",
      user.email ?? "",
    );
  }

  // Redirect logged-in users away from auth pages
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw\\.js|manifest\\.json).*)",
  ],
};
