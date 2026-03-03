import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">IncorpTool</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === '/'
                                    ? 'bg-white/20 text-white shadow-inner'
                                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            Incorporation Form
                        </Link>
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === '/admin'
                                    ? 'bg-white/20 text-white shadow-inner'
                                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            Admin Panel
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
