import { NextResponse } from "next/server";
import { listFiles } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const files = await listFiles();
        return NextResponse.json(files);
    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json(
            { error: "Failed to list files" },
            { status: 500 }
        );
    }
}
