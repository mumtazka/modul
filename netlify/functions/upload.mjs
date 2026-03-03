import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-Upload-Token",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== "POST") {
        return Response.json(
            { error: "Method not allowed. Use POST." },
            { status: 405, headers }
        );
    }

    // Parse form data
    let formData;
    try {
        formData = await req.formData();
    } catch (e) {
        return Response.json(
            { error: "Invalid request. Send multipart/form-data with a 'file' field." },
            { status: 400, headers }
        );
    }

    // Auth check: header or form field
    const expectedToken = process.env.UPLOAD_TOKEN;
    if (!expectedToken) {
        return Response.json(
            { error: "Upload is not configured. Set UPLOAD_TOKEN in Netlify environment variables." },
            { status: 503, headers }
        );
    }

    const token =
        req.headers.get("x-upload-token") ||
        formData.get("token");

    if (!token || token !== expectedToken) {
        return Response.json(
            { error: "Unauthorized. Provide a valid token via X-Upload-Token header or 'token' form field." },
            { status: 401, headers }
        );
    }

    // Get uploaded file
    const file = formData.get("file");
    if (!file || typeof file === "string") {
        return Response.json(
            { error: "No file provided. Include a 'file' field in your form data." },
            { status: 400, headers }
        );
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return Response.json(
            { error: `File too large. Maximum size is 10MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
            { status: 413, headers }
        );
    }

    // Store in Netlify Blobs
    try {
        const store = getStore("uploads");
        const buffer = await file.arrayBuffer();

        await store.set(file.name, buffer, {
            metadata: {
                contentType: file.type || "application/octet-stream",
                size: String(file.size),
                uploadedAt: new Date().toISOString(),
            },
        });

        return Response.json(
            {
                success: true,
                message: `File '${file.name}' uploaded successfully.`,
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                },
                download: {
                    url: `https://modulnas.netlify.app/api/files?file=${encodeURIComponent(file.name)}`,
                    curl: `curl -o "${file.name}" "https://modulnas.netlify.app/api/files?file=${encodeURIComponent(file.name)}"`,
                },
            },
            { status: 200, headers }
        );
    } catch (e) {
        return Response.json(
            { error: "Failed to store file: " + e.message },
            { status: 500, headers }
        );
    }
};

export const config = {
    path: "/api/upload",
};
