import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass-card p-8 sm:p-12 text-center max-w-md w-full animate-fade-in-up">
                <div
                    className="text-6xl mb-4"
                    style={{ animation: "float 3s ease-in-out infinite" }}
                >
                    🔍
                </div>
                <h2 className="text-xl font-semibold mb-2">Halaman Tidak Ditemukan</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Halaman yang Anda cari tidak ada atau telah dipindahkan.
                </p>
                <Link href="/" className="btn-primary inline-block">
                    ← Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
