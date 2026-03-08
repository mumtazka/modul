import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import FilesPage from './pages/FilesPage'
import UploadPage from './pages/UploadPage'

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#0a0a12]">
                <Navbar />
                <main className="max-w-3xl mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<FilesPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}
