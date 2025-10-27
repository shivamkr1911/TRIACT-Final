import { NextResponse } from "next/server";

export function middleware(req) {
    const origin = req.headers.get("origin");

    // Only allow your frontend
    const allowedOrigins = [
        "https://triact-final-6dcf.vercel.app",
        "http://localhost:5173", // for local testing
    ];

    // If it's an OPTIONS preflight request — handle it right here
    if (req.method === "OPTIONS") {
        const res = new NextResponse(null, { status: 200 });
        res.headers.set(
            "Access-Control-Allow-Origin",
            allowedOrigins.includes(origin) ? origin : "*"
        );
        res.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        res.headers.set("Access-Control-Max-Age", "86400");
        return res;
    }

    // For normal requests (GET, POST, etc.)
    const res = NextResponse.next();
    res.headers.set(
        "Access-Control-Allow-Origin",
        allowedOrigins.includes(origin) ? origin : "*"
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

// Apply only to API routes
export const config = {
    matcher: "/api/:path*",
};
