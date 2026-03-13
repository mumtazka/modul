import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/auth";
import { saveFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const authError = validateToken(request);
    if (authError) return authError;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided. Use field name 'file'" },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: "Empty file" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileInfo = await saveFile(file.name, buffer);

        return NextResponse.json(
            {
                message: `File "${fileInfo.name}" uploaded successfully`,
                file: fileInfo,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
