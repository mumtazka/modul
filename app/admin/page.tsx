"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatFileSize } from "@/lib/utils";

interface FileItem {
    name: string;
    size: number;
    modified: string;
    download_url: string;
    curl_command: string;
}

export default function AdminPage() {
    const [token, setToken] = useState("");
    const [tokenInput, setTokenInput] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("admin_token");
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/files");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setFiles(data);
        } catch {
            showToast("Failed to load files", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFiles();
        }
    }, [isAuthenticated, fetchFiles]);

    const handleSaveToken = () => {
        if (!tokenInput.trim()) return;
        localStorage.setItem("admin_token", tokenInput.trim());
        setToken(tokenInput.trim());
        setIsAuthenticated(true);
        setTokenInput("");
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setToken("");
        setIsAuthenticated(false);
        setFiles([]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            showToast(`"${selectedFile.name}" uploaded successfully!`, "success");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchFiles();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Upload failed",
                "error"
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${filename}"?\nThis action cannot be undone.`
            )
        )
            return;

        try {
            const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Delete failed");
            }

            showToast(`"${filename}" deleted`, "success");
            fetchFiles();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Delete failed",
                "error"
            );
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const getFileColor = (name: string): string => {
        const ext = name.split(".").pop()?.toLowerCase() || "";
        const colors: Record<string, string> = {
            pdf: "bg-red-500/20 text-red-400",
            doc: "bg-blue-500/20 text-blue-400",
            docx: "bg-blue-500/20 text-blue-400",
            md: "bg-emerald-500/20 text-emerald-400",
            txt: "bg-gray-500/20 text-gray-400",
            png: "bg-purple-500/20 text-purple-400",
            jpg: "bg-purple-500/20 text-purple-400",
            jpeg: "bg-purple-500/20 text-purple-400",
            zip: "bg-yellow-500/20 text-yellow-400",
            exe: "bg-orange-500/20 text-orange-400",
        };
        return colors[ext] || "bg-indigo-500/20 text-indigo-400";
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[rgba(99,102,241,0.1)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <div>
                        <a href="/" className="inline-block">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                🔐 Admin Panel
                            </h1>
                        </a>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Upload and manage files
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/" className="btn-ghost text-xs">
                            ← Back
                        </a>
                        {isAuthenticated && (
                            <button onClick={handleLogout} className="btn-danger text-xs">
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Auth Section */}
                {!isAuthenticated && (
                    <div className="max-w-md mx-auto animate-fade-in-up">
                        <div className="glass-card p-8">
                            <div className="text-center mb-6">
                                <div
                                    className="text-5xl mb-3"
                                    style={{ animation: "float 3s ease-in-out infinite" }}
                                >
                                    🔑
                                </div>
                                <h2 className="text-lg font-semibold">Enter Admin Token</h2>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    Enter your token to access the admin panel
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveToken()}
                                    placeholder="Your admin token..."
                                    className="input-field flex-1"
                                />
                                <button onClick={handleSaveToken} className="btn-primary">
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Authenticated Content */}
                {isAuthenticated && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Upload Area */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                📤 Upload File
                            </h2>

                            <div
                                className={`drop-zone p-8 text-center ${dragOver ? "drag-over" : ""}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                                <div
                                    className="text-4xl mb-3"
                                    style={{ animation: "float 3s ease-in-out infinite" }}
                                >
                                    {selectedFile ? "📄" : "☁️"}
                                </div>
                                {selectedFile ? (
                                    <div>
                                        <p className="font-medium text-[var(--accent)]">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium">
                                            Drop a file here or click to browse
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            Any file type accepted
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedFile && (
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <span className="spinner" /> Uploading...
                                            </>
                                        ) : (
                                            "⬆ Upload"
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* File List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    📁 Files
                                    <span className="text-sm font-normal text-[var(--text-secondary)]">
                                        ({files.length})
                                    </span>
                                </h2>
                                <button
                                    onClick={fetchFiles}
                                    className="btn-ghost text-xs flex items-center gap-1"
                                    disabled={loading}
                                >
                                    🔄 Refresh
                                </button>
                            </div>

                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="glass-card p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="skeleton w-9 h-9 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="skeleton h-4 w-48" />
                                                    <div className="skeleton h-3 w-24" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && files.length === 0 && (
                                <div className="glass-card p-12 text-center">
                                    <div className="text-5xl mb-3">📭</div>
                                    <p className="text-[var(--text-secondary)]">
                                        No files yet. Upload something or place files in the storage
                                        folder!
                                    </p>
                                </div>
                            )}

                            {!loading && files.length > 0 && (
                                <div className="space-y-3">
                                    {files.map((file, index) => (
                                        <div
                                            key={file.name}
                                            className="glass-card p-4 animate-fade-in-up"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`file-icon ${getFileColor(file.name)}`}
                                                >
                                                    {file.name
                                                        .split(".")
                                                        .pop()
                                                        ?.toUpperCase()
                                                        .slice(0, 4)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                                                        <span>{formatFileSize(file.size)}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {new Date(file.modified).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <a
                                                        href={file.download_url}
                                                        download={file.name}
                                                        className="btn-ghost text-xs"
                                                    >
                                                        ⬇
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(file.name)}
                                                        className="btn-danger text-xs"
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>{toast.message}</div>
            )}
        </div>
    );
}
