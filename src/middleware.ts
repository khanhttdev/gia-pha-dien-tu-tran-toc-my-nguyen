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

  // Check if user is 'pending' and restrict to homepage only
  if (user && isProtected && pathname !== "/home") {
    // ── Optimized: Read role/status from JWT app_metadata (no extra DB query) ──
    // The sync_profile_to_jwt DB trigger keeps these in-sync automatically.
    // Fallback to DB query only if claims are absent (e.g., legacy sessions).
    let role = user.app_metadata?.role as string | undefined;
    let status = user.app_metadata?.status as string | undefined;

    if (!role || !status) {
      // Fallback: query DB for very old sessions without claims
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? undefined;
      status = profile?.status ?? undefined;
    }

    if ((status === "pending" || status === "rejected") && pathname !== "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // Restrict non-admin from /admin route
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // ── MFA Verification Check ───────────────────────────────────────
    // If accessing admin and user has MFA enrolled but not verified (aal1),
    // redirect to verify page.
    const aal = user.app_metadata?.aal;
    if (
      pathname.startsWith("/admin") &&
      aal === "aal1" &&
      user.identities?.some((id) => id.provider === "email") // Basic check
    ) {
      // NOTE: Better to check listFactors, but that requires async DB call.
      // Supabase sets 'aal1' by default. If we see 'aal1', we should check 
      // if they have factors. Supabase provides 'amr' claim.
      const amr = user.app_metadata?.amr;
      // If amr doesn't contain 'mfa', they might need to verify.
      // But we only want to force if they actually HAVE established MFA.

      // We'll use a safer approach: check if 'mfa' is in the session claims
      // via a client-side check in the Admin layout or here if we have info.
    }
  }

  // A simplified rule for MFA in Middleware:
  // If user is logged in, and has MFA enabled, and is AAL1, and is trying to hit sensitive routes.
  if (user && pathname.startsWith("/admin")) {
    const { data: mfaData } = await supabase.auth.mfa.listFactors();
    const isMFAEnabled = mfaData && mfaData.all.some((f: any) => f.status === 'verified');
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (isMFAEnabled && aalData?.currentLevel === 'aal1') {
      const verifyUrl = new URL("/auth/mfa/verify", request.url);
      verifyUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(verifyUrl);
    }
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
