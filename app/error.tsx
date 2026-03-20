"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass-card p-8 sm:p-12 text-center max-w-md w-full animate-fade-in-up">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {error.message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={reset} className="btn-primary">
                        Coba Lagi
                    </button>
                    <a href="/" className="btn-ghost">
                        Beranda
                    </a>
                </div>
            </div>
        </div>
    );
}
