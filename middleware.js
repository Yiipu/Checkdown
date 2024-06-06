import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import { getSession } from "@auth0/nextjs-auth0/edge";
import Negotiator from "negotiator";

const locales = ["en", "zh"];

// Get the preferred locale, similar to the above or using a library
function getLocale(request) {
  let headers = {
    "accept-language": request.headers.get("accept-language"),
  };
  let languages = new Negotiator({ headers }).languages();
  return match(languages, locales, "en");
}

export async function middleware(request) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;

  // Redirect /me to /{userID}
  if (pathname === "/me") {
    const session = await getSession(request);
    const userID = session.user.sub.split("|")[1];
    request.nextUrl.pathname = `/${userID}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
