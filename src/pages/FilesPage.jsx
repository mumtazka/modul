import { useState, useEffect } from 'react'
import FileCard from '../components/FileCard'
import ShareLinkModal from '../components/ShareLinkModal'

export default function FilesPage() {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)

    const loadFiles = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/files')
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setFiles(data.files || [])
        } catch (e) {
            setError('Failed to load files: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadFiles() }, [])

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#e4e4ef] mb-1">Files</h1>
                <p className="text-sm text-[#55556a]">Browse and download uploaded files</p>
            </div>

            {/* Search + Refresh bar */}
            <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55556a] text-sm select-none">🔍</span>
                    <input
                        className="input pl-8"
                        placeholder="Search files…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadFiles}
                    disabled={loading}
                    className="btn btn-secondary whitespace-nowrap"
                >
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin" />
                    ) : '↺'}
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in">
                    {error}
                </div>
            )}

            {/* File List */}
            <div className="space-y-2">
                {loading && !files.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#55556a]">
                        <span className="inline-block w-8 h-8 border-2 border-white/10 border-t-brand-400 rounded-full animate-spin mb-4" />
                        <p className="text-sm">Loading files…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#55556a]">
                        <span className="text-5xl mb-4 opacity-40">📭</span>
                        <p className="text-sm">
                            {search ? 'No files match your search.' : 'No files uploaded yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-[#55556a] mb-3">
                            {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                            {search && ` matching "${search}"`}
                        </p>
                        {filtered.map(file => (
                            <FileCard
                                key={file.name}
                                file={file}
                                onShare={setSelectedFile}
                                canDelete={false}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Share Modal */}
            {selectedFile && (
                <ShareLinkModal
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </>
    )
}
