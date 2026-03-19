import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Validates the Bearer token from the Authorization header.
 * Uses timing-safe comparison to prevent timing attacks.
 * Returns null if the token is valid, or an error response otherwise.
 */
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
        console.error("CRITICAL: ADMIN_TOKEN environment variable is not set");
        return NextResponse.json(
            { error: "Server misconfiguration" },
            { status: 500 }
        );
    }

    // Timing-safe comparison to prevent timing attacks
    try {
        const tokenBuf = Buffer.from(token);
        const adminBuf = Buffer.from(adminToken);

        if (tokenBuf.length !== adminBuf.length || !timingSafeEqual(tokenBuf, adminBuf)) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return null; // Token is valid
}

/**
 * Lightweight check that only verifies the token matches, returns boolean.
 * Used for token validation endpoints.
 */
export function isTokenValid(token: string): boolean {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) return false;

    try {
        const tokenBuf = Buffer.from(token);
        const adminBuf = Buffer.from(adminToken);
        return tokenBuf.length === adminBuf.length && timingSafeEqual(tokenBuf, adminBuf);
    } catch {
        return false;
    }
}
