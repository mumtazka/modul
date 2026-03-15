// GitHub API-backed storage.
// Files are committed directly to the repository's storage/ folder.

const GITHUB_API = "https://api.github.com";

function getConfig() {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const storagePath = process.env.GITHUB_STORAGE_PATH || "storage";

    if (!token || !repo) {
        throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set in environment variables.");
    }
    return { token, repo, branch, storagePath };
}

function githubHeaders(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
    };
}

export interface FileInfo {
    name: string;
    size: number;
    modified: string;
    download_url: string;
    curl_command: string;
    sha: string; // needed for GitHub delete/update
}

export async function listFiles(): Promise<FileInfo[]> {
    const { token, repo, branch, storagePath } = getConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(
        `${GITHUB_API}/repos/${repo}/contents/${storagePath}?ref=${branch}`,
        { headers: githubHeaders(token), cache: "no-store" }
    );

    if (res.status === 404) return []; // folder doesn't exist yet
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    const files: FileInfo[] = items
        .filter((item: { type: string }) => item.type === "file")
        .map((item: { name: string; size: number; sha: string }) => {
            const encodedName = encodeURIComponent(item.name);
            return {
                name: item.name,
                size: item.size,
                modified: new Date().toISOString(), // GitHub doesn't return mtime directly here
                download_url: `/api/files/${encodedName}`,
                curl_command: `curl -L "${siteUrl}/api/files/${encodedName}" -o "${item.name}"`,
                sha: item.sha,
            };
        });

    return files;
}

export async function getFileSha(filename: string): Promise<string | null> {
    const { token, repo, branch, storagePath } = getConfig();
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");

    const res = await fetch(
        `${GITHUB_API}/repos/${repo}/contents/${storagePath}/${encodeURIComponent(safeName)}?ref=${branch}`,
        { headers: githubHeaders(token), cache: "no-store" }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
}

export async function downloadFileContent(filename: string): Promise<Buffer | null> {
    const { token, repo, branch, storagePath } = getConfig();
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");

    const res = await fetch(
        `${GITHUB_API}/repos/${repo}/contents/${storagePath}/${encodeURIComponent(safeName)}?ref=${branch}`,
        { headers: githubHeaders(token), cache: "no-store" }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;

    // GitHub returns base64 encoded content
    return Buffer.from(data.content.replace(/\n/g, ""), "base64");
}

export async function saveFile(filename: string, buffer: Buffer): Promise<FileInfo> {
    const { token, repo, branch, storagePath } = getConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");
    const path = `${storagePath}/${safeName}`;

    // Check if file exists to get SHA (required for updates)
    const existingSha = await getFileSha(safeName);

    const body: Record<string, string> = {
        message: `Upload: ${safeName}`,
        content: buffer.toString("base64"),
        branch,
    };
    if (existingSha) body.sha = existingSha;

    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
        method: "PUT",
        headers: githubHeaders(token),
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub upload failed: ${err.message}`);
    }

    const data = await res.json();
    const encodedName = encodeURIComponent(safeName);

    return {
        name: safeName,
        size: buffer.byteLength,
        modified: new Date().toISOString(),
        download_url: `/api/files/${encodedName}`,
        curl_command: `curl -L "${siteUrl}/api/files/${encodedName}" -o "${safeName}"`,
        sha: data.content?.sha ?? "",
    };
}

export async function deleteFileFromStorage(filename: string): Promise<boolean> {
    const { token, repo, branch, storagePath } = getConfig();
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");
    const path = `${storagePath}/${safeName}`;

    const sha = await getFileSha(safeName);
    if (!sha) return false;

    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
        method: "DELETE",
        headers: githubHeaders(token),
        body: JSON.stringify({
            message: `Delete: ${safeName}`,
            sha,
            branch,
        }),
    });

    return res.ok;
}
