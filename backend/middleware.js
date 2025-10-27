import { NextResponse } from "next/server";

export function middleware(req) {
    const res = NextResponse.next();
    res.headers.set(
        "Access-Control-Allow-Origin",
        "https://triact-final-6dcf.vercel.app"
    );
    res.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    return res;
}

export const config = {
    matcher: "/api/:path*",
};
