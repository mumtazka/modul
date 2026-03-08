import { useState } from 'react'

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(ta)
        ta.select()
        try {
            const ok = document.execCommand('copy')
            document.body.removeChild(ta)
            ok ? resolve() : reject()
        } catch {
            document.body.removeChild(ta)
            reject()
        }
    })
}

export default function CurlBlock({ code, label }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await copyToClipboard(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch { }
    }

    return (
        <div className="relative bg-[#12121e] border border-white/[0.07] rounded-lg overflow-hidden">
            {label && (
                <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#55556a]">
                    {label}
                </div>
            )}
            <pre className="px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-[#8888a4] whitespace-pre-wrap break-all pr-16">
                {code}
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-semibold rounded-md 
                   bg-white/[0.06] border border-white/[0.08] text-[#8888a4]
                   hover:text-[#e4e4ef] hover:border-white/[0.15] transition-all duration-150"
            >
                {copied ? '✓ Copied' : 'Copy'}
            </button>
        </div>
    )
}
