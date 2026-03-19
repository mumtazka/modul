import { NextRequest, NextResponse } from "next/server";
import { isTokenValid } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/validate
 * Validates the admin token before granting access to the admin panel.
 * Prevents the "save any string and hope it works" pattern.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = body?.token;

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { valid: false, error: "Token is required" },
                { status: 400 }
            );
        }

        if (isTokenValid(token)) {
            return NextResponse.json({ valid: true });
        }

        return NextResponse.json(
            { valid: false, error: "Invalid token" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { valid: false, error: "Invalid request" },
            { status: 400 }
        );
    }
}
