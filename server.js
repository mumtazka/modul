import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Upload directory
const UPLOAD_DIR = path.join(__dirname, 'uploads')
const META_DIR = path.join(UPLOAD_DIR, '.meta')

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
if (!fs.existsSync(META_DIR)) fs.mkdirSync(META_DIR, { recursive: true })

// Token from environment or default for local dev
const UPLOAD_TOKEN = process.env.UPLOAD_TOKEN || 'dev-token-123'

console.log(`\n🔑 Upload token: ${UPLOAD_TOKEN}`)
console.log(`📁 Upload directory: ${UPLOAD_DIR}\n`)

// CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Upload-Token'],
}))

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        // Decode the original filename (multer encodes it)
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, originalName)
    },
})
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Helper: save metadata
function saveMeta(filename, meta) {
    const metaPath = path.join(META_DIR, `${filename}.json`)
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
}

// Helper: read metadata
function readMeta(filename) {
    const metaPath = path.join(META_DIR, `${filename}.json`)
    if (fs.existsSync(metaPath)) {
        try {
            return JSON.parse(fs.readFileSync(metaPath, 'utf8'))
        } catch { return {} }
    }
    return {}
}

// Helper: delete metadata
function deleteMeta(filename) {
    const metaPath = path.join(META_DIR, `${filename}.json`)
    if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath)
    }
}

// ==========================================
// GET /api/files — List all files or download one
// ==========================================
app.get('/api/files', (req, res) => {
    const fileName = req.query.file

    // Download a specific file
    if (fileName) {
        const filePath = path.join(UPLOAD_DIR, fileName)

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            return res.status(404).json({ error: `File '${fileName}' not found.` })
        }

        const meta = readMeta(fileName)
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        res.setHeader('Content-Type', meta.contentType || 'application/octet-stream')
        return res.sendFile(filePath)
    }

    // List all files
    try {
        const entries = fs.readdirSync(UPLOAD_DIR)
        const files = []

        for (const name of entries) {
            // Skip hidden/meta directories
            if (name.startsWith('.')) continue

            const filePath = path.join(UPLOAD_DIR, name)
            const stat = fs.statSync(filePath)
            if (!stat.isFile()) continue

            const meta = readMeta(name)
            const origin = `${req.protocol}://${req.get('host')}`

            files.push({
                name,
                size: stat.size,
                type: meta.contentType || 'unknown',
                uploadedAt: meta.uploadedAt || stat.mtime.toISOString(),
                downloadPath: `/api/files?file=${encodeURIComponent(name)}`,
                downloadUrl: `${origin}/api/files?file=${encodeURIComponent(name)}`,
                curl: `curl -o "${name}" "${origin}/api/files?file=${encodeURIComponent(name)}"`,
            })
        }

        // Sort by upload date (newest first)
        files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

        return res.json({ files, count: files.length })
    } catch (e) {
        return res.status(500).json({ error: 'Failed to list files: ' + e.message })
    }
})

// ==========================================
// POST /api/upload — Upload a file
// ==========================================
app.post('/api/upload', (req, res) => {
    // Check token BEFORE processing the file
    const token = req.headers['x-upload-token']
    if (!token || token !== UPLOAD_TOKEN) {
        return res.status(401).json({
            error: 'Unauthorized. Provide a valid token via X-Upload-Token header.',
        })
    }

    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' })
            }
            return res.status(400).json({ error: 'Upload failed: ' + err.message })
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file provided. Include a 'file' field in your form data." })
        }

        const origin = `${req.protocol}://${req.get('host')}`
        const encodedName = encodeURIComponent(req.file.filename)
        const downloadPath = `/api/files?file=${encodedName}`

        // Save metadata
        saveMeta(req.file.filename, {
            contentType: req.file.mimetype || 'application/octet-stream',
            size: String(req.file.size),
            uploadedAt: new Date().toISOString(),
        })

        return res.json({
            success: true,
            message: `File '${req.file.filename}' uploaded successfully.`,
            file: {
                name: req.file.filename,
                size: req.file.size,
                type: req.file.mimetype,
            },
            download: {
                path: downloadPath,
                url: `${origin}${downloadPath}`,
                curl: `curl -o "${req.file.filename}" "${origin}${downloadPath}"`,
            },
        })
    })
})

// ==========================================
// DELETE /api/files?file=X — Delete a file
// ==========================================
app.delete('/api/files', (req, res) => {
    const token = req.headers['x-upload-token']
    if (!token || token !== UPLOAD_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const fileName = req.query.file
    if (!fileName) {
        return res.status(400).json({ error: 'Specify ?file=filename to delete' })
    }

    const filePath = path.join(UPLOAD_DIR, fileName)
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `File '${fileName}' not found.` })
    }

    try {
        fs.unlinkSync(filePath)
        deleteMeta(fileName)
        return res.json({ success: true, message: `File '${fileName}' deleted.` })
    } catch (e) {
        return res.status(500).json({ error: 'Failed to delete: ' + e.message })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API server running at http://localhost:${PORT}`)
    console.log(`   GET  /api/files          — List all files`)
    console.log(`   GET  /api/files?file=X    — Download file X`)
    console.log(`   POST /api/upload          — Upload a file (needs token)`)
    console.log(`   DELETE /api/files?file=X  — Delete file X (needs token)\n`)
})
