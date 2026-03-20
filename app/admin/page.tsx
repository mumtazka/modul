"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatFileSize } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { FileItem, getFileColor, getFileExt, MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/lib/constants";

export default function AdminPage() {
    const [token, setToken] = useState("");
    const [tokenInput, setTokenInput] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
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
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const savedToken = localStorage.getItem("admin_token");
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const showToast = useCallback((message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

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
    }, [showToast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFiles();
        }
    }, [isAuthenticated, fetchFiles]);

    const handleSaveToken = async () => {
        const trimmed = tokenInput.trim();
        if (!trimmed) return;

        setLoginLoading(true);
        setLoginError(null);

        try {
            const res = await fetch("/api/auth/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: trimmed }),
            });

            const data = await res.json();

            if (data.valid) {
                localStorage.setItem("admin_token", trimmed);
                setToken(trimmed);
                setIsAuthenticated(true);
                setTokenInput("");
            } else {
                setLoginError(data.error || "Invalid token");
            }
        } catch {
            setLoginError("Failed to validate token. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setToken("");
        setIsAuthenticated(false);
        setFiles([]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            showToast(
                `File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_LABEL}.`,
                "error"
            );
            return;
        }

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

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[rgba(99,102,241,0.1)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <div>
                        <a href="/" className="inline-block">
                            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                                🔐 Admin Panel
                            </h1>
                        </a>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Upload and manage files
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="btn-ghost flex items-center justify-center !p-2 rounded-full w-9 h-9"
                            title="Toggle theme"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <a href="/" className="btn-ghost !py-2 !px-4 flex items-center gap-2 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Files</span>
                        </a>
                        {isAuthenticated && (
                            <button onClick={handleLogout} className="btn-danger !py-2 !px-4 flex items-center gap-2 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
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
                            {loginError && (
                                <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[var(--danger)] text-sm text-center">
                                    {loginError}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveToken()}
                                    placeholder="Your admin token..."
                                    className="input-field flex-1"
                                    disabled={loginLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    onClick={handleSaveToken}
                                    className="btn-primary flex items-center gap-2"
                                    disabled={loginLoading || !tokenInput.trim()}
                                >
                                    {loginLoading ? (
                                        <>
                                            <span className="spinner" /> Verifying...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
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
                                <span className="text-xs font-normal text-[var(--text-secondary)]">
                                    (max {MAX_FILE_SIZE_LABEL})
                                </span>
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
                                            {selectedFile.size > MAX_FILE_SIZE && (
                                                <span className="text-[var(--danger)] ml-2">
                                                    ⚠️ Exceeds {MAX_FILE_SIZE_LABEL} limit
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium">
                                            Drop a file here or click to browse
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            Any file type accepted (max {MAX_FILE_SIZE_LABEL})
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
                                        disabled={uploading || selectedFile.size > MAX_FILE_SIZE}
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
                                <div className="glass-card overflow-hidden divide-y divide-[var(--border-color)]">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-5 even:bg-[rgba(0,0,0,0.02)] dark:even:bg-[rgba(255,255,255,0.02)]">
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
                                <div className="glass-card overflow-hidden divide-y divide-[var(--border-color)]">
                                    {files.map((file, index) => (
                                        <div
                                            key={file.name}
                                            className="p-4 hover:bg-[var(--glass)] transition-colors animate-fade-in-up even:bg-[rgba(0,0,0,0.02)] dark:even:bg-[rgba(255,255,255,0.02)]"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`file-icon ${getFileColor(file.name)}`}
                                                >
                                                    {getFileExt(file.name)}
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
                                                        aria-label={`Download ${file.name}`}
                                                    >
                                                        ⬇
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(file.name)}
                                                        className="btn-danger text-xs"
                                                        aria-label={`Delete ${file.name}`}
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
                <div className={`toast toast-${toast.type}`} role="alert">
                    {toast.message}
                </div>
            )}
        </div>
    );
}
