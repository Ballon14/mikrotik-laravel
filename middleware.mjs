import { auth } from "@/lib/auth.mjs"

export { auth as middleware }

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
}
