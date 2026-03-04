import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const linkClass = (path) =>
        `text-sm font-medium pb-1 ${location.pathname === path
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-800'
        }`;

    return (
        <nav className="bg-gradient-to-r from-blue-100 to-blue-300 ">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/" className="text-base font-semibold text-gray-800">
                        IncorpTool
                    </Link>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className={linkClass('/')}>
                            Form
                        </Link>
                        <Link to="/admin" className={linkClass('/admin')}>
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
