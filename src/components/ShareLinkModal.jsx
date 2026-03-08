import { useEffect, useRef } from 'react'
import CurlBlock from './CurlBlock'

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

export default function ShareLinkModal({ file, onClose }) {
    const overlayRef = useRef()
    const origin = window.location.origin

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    if (!file) return null

    const downloadUrl = `${origin}/api/files?file=${encodeURIComponent(file.name)}`
    const curlCmd = `curl -o "${file.name}" "${downloadUrl}"`

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
            <div className="card w-full max-w-lg border-brand-500/30 shadow-2xl shadow-brand-500/10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{fileIcon(file.name)}</span>
                        <div>
                            <p className="font-semibold text-sm text-[#e4e4ef] truncate max-w-[280px]">{file.name}</p>
                            <p className="text-xs text-[#55556a]">
                                {formatSize(file.size)} · {formatDate(file.uploadedAt)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#55556a] hover:text-[#e4e4ef] transition-colors text-xl leading-none ml-4"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="label">Direct Download URL</p>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={downloadUrl}
                                className="input text-xs flex-1 cursor-text"
                            />
                            <a
                                href={downloadUrl}
                                download={file.name}
                                className="btn btn-primary text-xs px-3"
                            >
                                ↓ Download
                            </a>
                        </div>
                    </div>

                    <div>
                        <p className="label">Download via curl</p>
                        <CurlBlock code={curlCmd} />
                    </div>
                </div>
            </div>
        </div>
    )
}
