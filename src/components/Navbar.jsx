import { NavLink } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="border-b border-white/[0.07] bg-[#0a0a12]/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">

                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2 group">
                    <span className="text-xl select-none group-hover:scale-110 transition-transform duration-150">📦</span>
                    <span className="font-bold text-[#e4e4ef] tracking-tight">modulnas</span>
                </NavLink>

                {/* Nav Buttons */}
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ` +
                            (isActive
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                : 'text-[#8888a4] hover:text-[#e4e4ef] hover:bg-white/[0.07]')
                        }
                    >
                        <span className="text-[15px]">📁</span>
                        Files
                    </NavLink>
                    <NavLink
                        to="/upload"
                        className={({ isActive }) =>
                            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ` +
                            (isActive
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                : 'text-[#8888a4] hover:text-[#e4e4ef] hover:bg-white/[0.07]')
                        }
                    >
                        <span className="text-[15px]">⬆️</span>
                        Upload
                    </NavLink>
                </div>

            </div>
        </nav>
    )
}
