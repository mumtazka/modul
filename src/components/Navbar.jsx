import { NavLink } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="border-b border-white/[0.07] bg-[#0a0a12]/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-xl select-none">📦</span>
                    <span className="font-bold text-[#e4e4ef] tracking-tight">modulnas</span>
                </div>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ` +
                            (isActive
                                ? 'bg-brand-500/15 text-brand-400'
                                : 'text-[#8888a4] hover:text-[#e4e4ef] hover:bg-white/[0.05]')
                        }
                    >
                        Files
                    </NavLink>
                    <NavLink
                        to="/upload"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ` +
                            (isActive
                                ? 'bg-brand-500/15 text-brand-400'
                                : 'text-[#8888a4] hover:text-[#e4e4ef] hover:bg-white/[0.05]')
                        }
                    >
                        Upload
                    </NavLink>
                </div>
            </div>
        </nav>
    )
}
