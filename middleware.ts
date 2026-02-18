import { withAuth } from "next-auth/middleware"

export default withAuth

export const config = { matcher: ["/admin/dashboard/:path*", "/admin/scan/:path*"] }
