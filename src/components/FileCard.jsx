import { useState } from 'react'

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function fileIcon(name) {
    const ext = name?.split('.').pop().toLowerCase()
    const map = {
        pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑',
        png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
        mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬',
        mp3: '🎵', wav: '🎵', flac: '🎵',
        zip: '📦', rar: '📦', tar: '📦', gz: '📦', '7z': '📦',
        exe: '⚙️', msi: '⚙️', deb: '🐧', rpm: '🐧',
        html: '🌐', css: '🎨', js: '⚡', jsx: '⚡', ts: '⚡', tsx: '⚡',
        json: '📋', py: '🐍', sh: '🔧', md: '📘', txt: '📄', csv: '📊',
    }
    return map[ext] || '📎'
}

function formatDate(iso) {
    if (!iso || iso === 'unknown') return ''
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

export default function FileCard({ file, onShare, onDelete, canDelete }) {
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Delete "${file.name}"?`)) return
        setDeleting(true)
        await onDelete(file.name)
        setDeleting(false)
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[#12121e] border border-white/[0.07]
                    rounded-xl transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.05] group">
            {/* Icon */}
            <span className="text-2xl flex-shrink-0 select-none">{fileIcon(file.name)}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e4e4ef] truncate">{file.name}</p>
                <p className="text-xs text-[#55556a] mt-0.5">
                    {formatSize(file.size)}
                    {file.uploadedAt && file.uploadedAt !== 'unknown' && (
                        <> · {formatDate(file.uploadedAt)}</>
                    )}
                    {file.type && file.type !== 'unknown' && (
                        <> · <span className="font-mono">{file.type}</span></>
                    )}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onShare(file)}
                    className="opacity-0 group-hover:opacity-100 btn btn-secondary text-xs px-2.5 py-1.5 transition-opacity duration-150"
                    title="Share / Copy link"
                >
                    🔗 Share
                </button>
                <a
                    href={file.downloadUrl || `/api/files?file=${encodeURIComponent(file.name)}`}
                    download={file.name}
                    className="btn btn-primary text-xs px-3 py-1.5"
                    title="Download"
                >
                    ↓
                </a>
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn btn-danger"
                        title="Delete"
                    >
                        {deleting ? '…' : '🗑'}
                    </button>
                )}
            </div>
        </div>
    )
}
