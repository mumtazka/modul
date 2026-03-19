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
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={reset} className="btn-primary">
                        Try Again
                    </button>
                    <a href="/" className="btn-ghost">
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
