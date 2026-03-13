import { NextRequest, NextResponse } from "next/server";

export function validateToken(request: NextRequest): NextResponse | null {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Missing Authorization header" },
            { status: 401 }
        );
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return NextResponse.json(
            { error: "Invalid Authorization format. Use: Bearer <token>" },
            { status: 401 }
        );
    }

    const token = parts[1];
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
        return NextResponse.json(
            { error: "Server misconfigured: ADMIN_TOKEN not set" },
            { status: 500 }
        );
    }

    if (token !== adminToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return null; // Token is valid
}
