import { useState, useEffect, useRef, useCallback } from 'react'
import { useToken } from '../hooks/useToken'
import FileCard from '../components/FileCard'
import CurlBlock from '../components/CurlBlock'
import ShareLinkModal from '../components/ShareLinkModal'

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

// Status banner
function StatusMsg({ msg, type, onClose }) {
    if (!msg) return null
    const styles = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
    }
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm mb-5 animate-in ${styles[type]}`}>
            <span>{msg}</span>
            <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
    )
}

// Queue row during upload
function QueueRow({ item }) {
    const statusColors = {
        uploading: 'text-brand-400',
        done: 'text-green-400',
        error: 'text-red-400',
    }
    return (
        <div className="relative flex items-center gap-3 px-4 py-3 bg-[#12121e] border border-white/[0.07] rounded-xl overflow-hidden">
            {/* Progress fill */}
            <div
                className="absolute inset-y-0 left-0 bg-brand-500/10 transition-all duration-300"
                style={{ width: item.progress + '%' }}
            />
            <span className="relative text-2xl flex-shrink-0">{fileIcon(item.name)}</span>
            <div className="relative flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e4e4ef] truncate">{item.name}</p>
                <p className="text-xs text-[#55556a]">{formatSize(item.size)}</p>
            </div>
            <span className={`relative text-xs font-semibold flex-shrink-0 ${statusColors[item.status]}`}>
                {item.status === 'uploading' && (
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                        {item.progress}%
                    </span>
                )}
                {item.status === 'done' && '✓ Done'}
                {item.status === 'error' && '✗ Failed'}
            </span>
        </div>
    )
}

export default function UploadPage() {
    const [token, setToken] = useToken()
    const [tokenInput, setTokenInput] = useState(token)
    const [showToken, setShowToken] = useState(false)
    const [status, setStatus] = useState({ msg: '', type: '' })
    const [queue, setQueue] = useState([])
    const [files, setFiles] = useState([])
    const [loadingFiles, setLoadingFiles] = useState(true)
    const [dragOver, setDragOver] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef()
    const origin = window.location.origin

    const showStatus = useCallback((msg, type = 'info') => {
        setStatus({ msg, type })
    }, [])

    const loadFiles = useCallback(async () => {
        setLoadingFiles(true)
        try {
            const res = await fetch('/api/files')
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setFiles(data.files || [])
        } catch (e) {
            showStatus('Could not load files: ' + e.message, 'error')
        } finally {
            setLoadingFiles(false)
        }
    }, [showStatus])

    useEffect(() => { loadFiles() }, [loadFiles])

    const saveToken = () => {
        if (!tokenInput.trim()) {
            showStatus('Please enter a token.', 'error')
            return
        }
        setToken(tokenInput.trim())
        showStatus('Token saved!', 'success')
    }

    const uploadFiles = async (fileList) => {
        if (!token) {
            showStatus('Enter and save your API token first.', 'error')
            return
        }
        for (const file of fileList) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
            const row = { id, name: file.name, size: file.size, status: 'uploading', progress: 0 }
            setQueue(q => [...q, row])

            try {
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest()
                    xhr.open('POST', '/api/upload')
                    xhr.setRequestHeader('X-Upload-Token', token)

                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const pct = Math.round((e.loaded / e.total) * 100)
                            setQueue(q => q.map(r => r.id === id ? { ...r, progress: pct } : r))
                        }
                    })

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            setQueue(q => q.map(r => r.id === id ? { ...r, status: 'done', progress: 100 } : r))
                            resolve()
                        } else {
                            let msg = `Upload failed (${xhr.status})`
                            try { msg = JSON.parse(xhr.responseText).error || msg } catch { }
                            setQueue(q => q.map(r => r.id === id ? { ...r, status: 'error' } : r))
                            reject(new Error(msg))
                        }
                    }
                    xhr.onerror = () => {
                        setQueue(q => q.map(r => r.id === id ? { ...r, status: 'error' } : r))
                        reject(new Error('Network error'))
                    }

                    const fd = new FormData()
                    fd.append('file', file)
                    xhr.send(fd)
                })

                showStatus(`"${file.name}" uploaded successfully!`, 'success')
                loadFiles()
            } catch (e) {
                showStatus(e.message, 'error')
            }
        }
    }

    const deleteFile = async (name) => {
        try {
            const res = await fetch(`/api/files?file=${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: { 'X-Upload-Token': token },
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || `HTTP ${res.status}`)
            }
            showStatus(`"${name}" deleted.`, 'success')
            loadFiles()
        } catch (e) {
            showStatus('Delete failed: ' + e.message, 'error')
        }
    }

    const curlUpload = `curl -H "X-Upload-Token: ${token || 'YOUR_TOKEN'}" \\
  -F "file=@yourfile.pdf" \\
  ${origin}/api/upload`

    const curlManage = `# List all files
curl ${origin}/api/files

# Download a specific file
curl -o "filename.pdf" "${origin}/api/files?file=filename.pdf"

# Delete a file (requires token)
curl -X DELETE \\
  -H "X-Upload-Token: ${token || 'YOUR_TOKEN'}" \\
  "${origin}/api/files?file=filename.pdf"`

    return (
        <>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#e4e4ef] mb-1">Upload</h1>
                <p className="text-sm text-[#55556a]">Upload files — any type, up to 10 MB each</p>
            </div>

            <StatusMsg msg={status.msg} type={status.type} onClose={() => setStatus({ msg: '', type: '' })} />

            {/* Token Card */}
            <div className="card mb-5">
                <p className="label">🔑 API Token</p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type={showToken ? 'text' : 'password'}
                            className="input pr-10"
                            placeholder="Enter your upload token…"
                            value={tokenInput}
                            onChange={e => setTokenInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveToken()}
                        />
                        <button
                            onClick={() => setShowToken(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e4e4ef] transition-colors text-sm"
                            tabIndex={-1}
                        >
                            {showToken ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <button onClick={saveToken} className="btn btn-primary">Save</button>
                    {token && (
                        <button
                            onClick={() => { setToken(''); setTokenInput(''); showStatus('Token cleared.', 'info') }}
                            className="btn btn-secondary"
                        >
                            Clear
                        </button>
                    )}
                </div>
                {token && (
                    <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <span>✓</span> Token saved — ready to upload
                    </p>
                )}
            </div>

            {/* Curl Guide */}
            <div className="card mb-5">
                <p className="label">💻 Upload via curl</p>
                <CurlBlock code={curlUpload} />
                <div className="mt-3">
                    <CurlBlock code={curlManage} label="Manage files via curl" />
                </div>
            </div>

            {/* Drop Zone */}
            <div className="card mb-5">
                <p className="label">📁 Upload via Browser</p>
                <div
                    className={`relative border-2 border-dashed rounded-xl py-12 text-center cursor-pointer transition-all duration-200
            ${dragOver
                            ? 'border-brand-500 bg-brand-500/5'
                            : 'border-white/[0.12] hover:border-brand-500/50 hover:bg-brand-500/[0.03]'
                        }`}
                    onDragEnter={e => { e.preventDefault(); setDragOver(true) }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                        e.preventDefault()
                        setDragOver(false)
                        if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={e => { if (e.target.files.length) { uploadFiles(e.target.files); e.target.value = '' } }}
                    />
                    <div className="text-4xl mb-3 select-none">☁️</div>
                    <p className="text-sm text-[#8888a4]">
                        Drop files here or <span className="text-brand-400 font-semibold">click to browse</span>
                    </p>
                    <p className="text-xs text-[#55556a] mt-1.5">Any file type · Max 10 MB per file</p>
                </div>

                {/* Upload Queue */}
                {queue.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="label mb-0">Upload Queue</p>
                            <button
                                onClick={() => setQueue([])}
                                className="text-xs text-[#55556a] hover:text-[#e4e4ef] transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        {queue.map(item => <QueueRow key={item.id} item={item} />)}
                    </div>
                )}
            </div>

            {/* Uploaded Files */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <p className="label mb-0">📦 Your Files</p>
                    <button
                        onClick={loadFiles}
                        disabled={loadingFiles}
                        className="btn btn-secondary text-xs px-3 py-1.5"
                    >
                        {loadingFiles
                            ? <span className="w-3 h-3 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin" />
                            : '↺'
                        }
                        Refresh
                    </button>
                </div>

                <div className="space-y-2">
                    {loadingFiles && !files.length ? (
                        <div className="flex justify-center py-10 text-[#55556a]">
                            <span className="w-6 h-6 border-2 border-white/10 border-t-brand-400 rounded-full animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-10 text-[#55556a]">
                            <div className="text-4xl mb-3 opacity-40">📭</div>
                            <p className="text-sm">No files uploaded yet.</p>
                        </div>
                    ) : (
                        files.map(file => (
                            <FileCard
                                key={file.name}
                                file={file}
                                onShare={setSelectedFile}
                                onDelete={deleteFile}
                                canDelete={!!token}
                            />
                        ))
                    )}
                </div>
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
