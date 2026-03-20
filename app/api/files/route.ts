import { NextResponse } from "next/server";
import { listFiles } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const files = await listFiles();
        return NextResponse.json(files);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error listing files:", message);
        return NextResponse.json(
            { error: "Failed to list files", detail: message },
            { status: 500 }
        );
    }
}
