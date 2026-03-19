import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/auth";
import { saveFile } from "@/lib/storage";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const authError = validateToken(request);
    if (authError) return authError;

    try {
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Request too large. Maximum file size is ${MAX_FILE_SIZE_LABEL}` },
                { status: 413 }
            );
        }

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

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_LABEL}` },
                { status: 413 }
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
