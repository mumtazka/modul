import { NextRequest, NextResponse } from "next/server";
import { downloadFileContent, deleteFileFromStorage } from "@/lib/storage";
import { validateToken } from "@/lib/auth";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".exe": "application/octet-stream",
    ".sh": "application/x-sh",
    ".json": "application/json",
};

export async function GET(
    _request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        const filename = decodeURIComponent(params.name);
        const fileBuffer = await downloadFileContent(filename);

        if (!fileBuffer) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const ext = path.extname(filename).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const contentDisposition = `attachment; filename="${filename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": contentDisposition,
                "Content-Length": fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
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
        const deleted = await deleteFileFromStorage(filename);

        if (deleted) {
            return NextResponse.json({ message: `File "${filename}" deleted successfully` });
        } else {
            return NextResponse.json({ error: "File not found or could not be deleted" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
