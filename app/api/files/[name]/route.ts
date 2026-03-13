import { NextRequest, NextResponse } from "next/server";
import { getFilePath, fileExists, deleteFileFromStorage } from "@/lib/storage";
import { validateToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
    _request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        const filename = decodeURIComponent(params.name);
        const filePath = getFilePath(filename);

        if (!fileExists(filename)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();

        const mimeTypes: Record<string, string> = {
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx":
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".md": "text/markdown",
            ".txt": "text/plain",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".zip": "application/zip",
            ".exe": "application/octet-stream",
            ".sh": "application/x-sh",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
                "Content-Length": fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json(
            { error: "Failed to serve file" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
    const authError = validateToken(request);
    if (authError) return authError;

    try {
        const filename = decodeURIComponent(params.name);

        if (!fileExists(filename)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const deleted = deleteFileFromStorage(filename);

        if (deleted) {
            return NextResponse.json({
                message: `File "${filename}" deleted successfully`,
            });
        } else {
            return NextResponse.json(
                { error: "Failed to delete file" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
