"use client";

import { useState, useEffect, useCallback } from "react";
import { formatFileSize } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { FileItem, getFileColor, getFileExt } from "@/lib/constants";

export default function HomePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[rgba(99,102,241,0.1)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              📁 indexofmunas
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Jelajahi dan unduh file yang dibagikan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn-ghost flex items-center justify-center !p-2 rounded-full w-9 h-9"
              title="Ubah tema"
              aria-label="Ubah tema"
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
            <a
              href="/admin"
              className="btn-primary flex items-center gap-2 !py-2 !px-4 sm:!px-5 rounded-full text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Unggah File</span>
              <span className="sm:hidden">Unggah</span>
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        {!loading && !error && (
          <div className="mb-6 flex items-center gap-4 animate-fade-in-up">
            <div className="glass-card px-4 py-2 text-sm">
              <span className="text-[var(--text-secondary)]">Total file: </span>
              <span className="font-semibold text-[var(--accent)]">{files.length}</span>
            </div>
            <div className="glass-card px-4 py-2 text-sm">
              <span className="text-[var(--text-secondary)]">Total ukuran: </span>
              <span className="font-semibold text-[var(--accent)]">
                {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass-card overflow-hidden divide-y divide-[var(--border-color)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 even:bg-[rgba(0,0,0,0.02)] dark:even:bg-[rgba(255,255,255,0.02)]">
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
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && files.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <div className="text-6xl mb-4" style={{ animation: "float 3s ease-in-out infinite" }}>
              📭
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada file</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              File akan muncul di sini setelah diunggah.
            </p>
          </div>
        )}

        {/* File list */}
        {!loading && !error && files.length > 0 && (
          <div className="glass-card overflow-hidden divide-y divide-[var(--border-color)]">
            {files.map((file, index) => (
              <div
                key={file.name}
                className="p-4 sm:p-5 hover:bg-[var(--glass)] even:bg-[rgba(0,0,0,0.02)] dark:even:bg-[rgba(255,255,255,0.02)] transition-colors animate-fade-in-up"
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
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 group">
                      <input
                        type="text"
                        readOnly
                        value={file.curl_command}
                        className="text-[11px] font-mono bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded px-2 py-1 w-32 md:w-56 outline-none focus:border-[var(--accent)] transition-colors cursor-text"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        title="Perintah cURL"
                      />
                      <button
                        onClick={() => copyToClipboard(file.curl_command, index)}
                        className={`btn-ghost !px-2 !py-1 ${copiedIndex === index ? "!border-[var(--success)] !text-[var(--success)]" : ""}`}
                        title="Salin perintah cURL"
                        aria-label={`Salin cURL untuk ${file.name}`}
                      >
                        {copiedIndex === index ? "✓" : "📋"}
                      </button>
                    </div>
                    {/* mobile copy button */}
                    <button
                      onClick={() => copyToClipboard(file.curl_command, index)}
                      className={`sm:hidden btn-ghost relative !py-1 !px-2 text-[11px] ${copiedIndex === index ? "!border-[var(--success)] !text-[var(--success)]" : ""}`}
                      title="Salin cURL"
                      aria-label={`Salin perintah cURL untuk ${file.name}`}
                    >
                      {copiedIndex === index ? "✓ Tersalin" : "📋 Salin cURL"}
                    </button>
                    <a
                      href={file.download_url}
                      download={file.name}
                      className="btn-primary !py-1 !px-3 sm:!px-4 text-[11px] sm:text-xs inline-flex items-center gap-1"
                    >
                      ⬇ <span className="hidden sm:inline">Unduh</span>
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
          indexofmunas — Berbagi file pribadi
        </div>
      </footer>
    </div>
  );
}
