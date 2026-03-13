import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

export interface FileInfo {
    name: string;
    size: number;
    modified: string;
    download_url: string;
    curl_command: string;
}

function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}

export function listFiles(): FileInfo[] {
    ensureStorageDir();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const entries = fs.readdirSync(STORAGE_DIR);
    const files: FileInfo[] = [];

    for (const name of entries) {
        const filePath = path.join(STORAGE_DIR, name);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        const encodedName = encodeURIComponent(name);
        files.push({
            name,
            size: stat.size,
            modified: stat.mtime.toISOString(),
            download_url: `/api/files/${encodedName}`,
            curl_command: `curl -L "${siteUrl}/api/files/${encodedName}" -o "${name}"`,
        });
    }

    return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

export function getFilePath(filename: string): string {
    const safeName = path.basename(filename);
    return path.join(STORAGE_DIR, safeName);
}

export function fileExists(filename: string): boolean {
    return fs.existsSync(getFilePath(filename));
}

export async function saveFile(
    filename: string,
    buffer: Buffer
): Promise<FileInfo> {
    ensureStorageDir();
    const safeName = path.basename(filename);
    const filePath = path.join(STORAGE_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    const stat = fs.statSync(filePath);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const encodedName = encodeURIComponent(safeName);

    return {
        name: safeName,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        download_url: `/api/files/${encodedName}`,
        curl_command: `curl -L "${siteUrl}/api/files/${encodedName}" -o "${safeName}"`,
    };
}

export function deleteFileFromStorage(filename: string): boolean {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}
