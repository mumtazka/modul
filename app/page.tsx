"use client";

import { useState, useEffect, useCallback } from "react";
import { formatFileSize } from "@/lib/utils";

interface FileItem {
  name: string;
  size: number;
  modified: string;
  download_url: string;
  curl_command: string;
}

function getFileColor(name: string): string {
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
    gif: "bg-purple-500/20 text-purple-400",
    zip: "bg-yellow-500/20 text-yellow-400",
    exe: "bg-orange-500/20 text-orange-400",
    sh: "bg-green-500/20 text-green-400",
  };
  return colors[ext] || "bg-indigo-500/20 text-indigo-400";
}

function getFileExt(name: string): string {
  return name.split(".").pop()?.toUpperCase().slice(0, 4) || "FILE";
}

export default function HomePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[rgba(99,102,241,0.1)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              📁 FileVault
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Browse and download shared files
            </p>
          </div>
          <a
            href="/admin"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-200 opacity-60 hover:opacity-100"
          >
            Admin →
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        {!loading && !error && (
          <div className="mb-6 flex items-center gap-4 animate-fade-in-up">
            <div className="glass-card px-4 py-2 text-sm">
              <span className="text-[var(--text-secondary)]">Total files: </span>
              <span className="font-semibold text-[var(--accent)]">{files.length}</span>
            </div>
            <div className="glass-card px-4 py-2 text-sm">
              <span className="text-[var(--text-secondary)]">Total size: </span>
              <span className="font-semibold text-[var(--accent)]">
                {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-48" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-[var(--danger)] font-medium">{error}</p>
            <button onClick={fetchFiles} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && files.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <div className="text-6xl mb-4" style={{ animation: "float 3s ease-in-out infinite" }}>
              📭
            </div>
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              Files will appear here once uploaded or placed in the storage folder.
            </p>
          </div>
        )}

        {/* File list */}
        {!loading && !error && files.length > 0 && (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={file.name}
                className="glass-card p-4 sm:p-5 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* File icon */}
                  <div className={`file-icon ${getFileColor(file.name)}`}>
                    {getFileExt(file.name)}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>
                        {new Date(file.modified).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(file.curl_command, index)}
                      className={`btn-ghost relative ${copiedIndex === index ? "!border-[var(--success)] !text-[var(--success)]" : ""}`}
                      title="Copy curl command"
                    >
                      {copiedIndex === index ? "✓ Copied" : "📋 curl"}
                    </button>
                    <a
                      href={file.download_url}
                      download
                      className="btn-primary !py-[6px] !px-3 sm:!px-4 text-xs sm:text-sm inline-flex items-center gap-1"
                    >
                      ⬇ <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(99,102,241,0.1)] mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[var(--text-secondary)]">
          FileVault — Personal file sharing
        </div>
      </footer>
    </div>
  );
}
