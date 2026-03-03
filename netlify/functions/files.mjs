import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-Upload-Token",
        "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    };

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
    }

    const store = getStore("uploads");
    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");

    // DELETE a file
    if (req.method === "DELETE") {
        const expectedToken = process.env.UPLOAD_TOKEN;
        const token = req.headers.get("x-upload-token");

        if (!token || token !== expectedToken) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401, headers }
            );
        }

        if (!fileName) {
            return Response.json(
                { error: "Specify ?file=filename to delete" },
                { status: 400, headers }
            );
        }

        try {
            await store.delete(fileName);
            return Response.json(
                { success: true, message: `File '${fileName}' deleted.` },
                { status: 200, headers }
            );
        } catch (e) {
            return Response.json(
                { error: "Failed to delete: " + e.message },
                { status: 500, headers }
            );
        }
    }

    // GET - download specific file
    if (fileName) {
        try {
            const blob = await store.get(fileName, { type: "arrayBuffer" });
            if (!blob) {
                return Response.json(
                    { error: `File '${fileName}' not found.` },
                    { status: 404, headers }
                );
            }

            let meta = {};
            try {
                const result = await store.getMetadata(fileName);
                meta = result.metadata || {};
            } catch (_) { }

            return new Response(blob, {
                status: 200,
                headers: {
                    ...headers,
                    "Content-Type": meta.contentType || "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                    "Content-Length": meta.size || String(blob.byteLength),
                },
            });
        } catch (e) {
            return Response.json(
                { error: "Failed to retrieve file: " + e.message },
                { status: 500, headers }
            );
        }
    }

    // GET - list all files
    try {
        const { blobs } = await store.list();
        const files = [];

        for (const blob of blobs) {
            let meta = {};
            try {
                const result = await store.getMetadata(blob.key);
                meta = result.metadata || {};
            } catch (_) { }

            files.push({
                name: blob.key,
                size: meta.size ? parseInt(meta.size) : 0,
                type: meta.contentType || "unknown",
                uploadedAt: meta.uploadedAt || "unknown",
                downloadUrl: `https://modulnas.netlify.app/api/files?file=${encodeURIComponent(blob.key)}`,
                curl: `curl -o "${blob.key}" "https://modulnas.netlify.app/api/files?file=${encodeURIComponent(blob.key)}"`,
            });
        }

        return Response.json({ files, count: files.length }, { status: 200, headers });
    } catch (e) {
        return Response.json(
            { error: "Failed to list files: " + e.message },
            { status: 500, headers }
        );
    }
};

export const config = {
    path: "/api/files",
};
