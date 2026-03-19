// Shared types and constants used across the app

export interface FileItem {
    name: string;
    size: number;
    modified: string;
    download_url: string;
    curl_command: string;
}

/** Max upload size in bytes (50 MB — GitHub Contents API limit is 100 MB) */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Human-readable max upload size */
export const MAX_FILE_SIZE_LABEL = "50 MB";

const FILE_COLORS: Record<string, string> = {
    pdf: "bg-red-500/20 text-red-400",
    doc: "bg-blue-500/20 text-blue-400",
    docx: "bg-blue-500/20 text-blue-400",
    md: "bg-emerald-500/20 text-emerald-400",
    txt: "bg-gray-500/20 text-gray-400",
    png: "bg-purple-500/20 text-purple-400",
    jpg: "bg-purple-500/20 text-purple-400",
    jpeg: "bg-purple-500/20 text-purple-400",
    gif: "bg-purple-500/20 text-purple-400",
    webp: "bg-purple-500/20 text-purple-400",
    zip: "bg-yellow-500/20 text-yellow-400",
    rar: "bg-yellow-500/20 text-yellow-400",
    "7z": "bg-yellow-500/20 text-yellow-400",
    exe: "bg-orange-500/20 text-orange-400",
    sh: "bg-green-500/20 text-green-400",
    json: "bg-teal-500/20 text-teal-400",
    csv: "bg-teal-500/20 text-teal-400",
    mp4: "bg-pink-500/20 text-pink-400",
    mp3: "bg-pink-500/20 text-pink-400",
};

const DEFAULT_FILE_COLOR = "bg-indigo-500/20 text-indigo-400";

export function getFileColor(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return FILE_COLORS[ext] || DEFAULT_FILE_COLOR;
}

export function getFileExt(name: string): string {
    return name.split(".").pop()?.toUpperCase().slice(0, 4) || "FILE";
}
