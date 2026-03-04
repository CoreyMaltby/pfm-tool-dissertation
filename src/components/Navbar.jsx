/* Global Navbar Component
 * Handles desktop and mobile navigation.
 * Links are highlighted when selected.
 * Mobile view collapses into a hamburger menu.
 */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, User, LogIn } from 'lucide-react';

// Navigation items for the navbar
const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Learning Hub', path: '/learning-hub' },
    { name: 'Support', path: '/support' },
    { name: 'Privacy & Security', path: '/privacy-security' },
];

const Navbar = () => {
    const [isMenuOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-16">
            <div className="px-4 h-full flex items-center justify-between">

                {/* Site Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent-main rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">PFM</span>
                    </div>
                    <span className="font-bold text-xl text-accent-main hidden sm:block">Tool</span>
                </Link>

                {/* Desktop Navbar */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-accent-main' : 'text-text-secondary hover:text-accent-main'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 ml-4 border-l pl-8 border-gray-200">
                        <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-accent-main">Login</Link>
                        <Link to="/profile" className="p-2 bg-gray-100 rounded-full text-text-secondary hover:bg-accent-main hover:text-white transition-all">
                            <User size={18} />
                        </Link>
                    </div>
                </div>

                {/* Mobile Navbar Controls */}
                <div className="flex md:hidden items-center gap-3">
                    <Link to="/login" className="p-2 text-text-secondary">
                        <LogIn size={20} />
                    </Link>
                    <Link to="/profile" className="p-2 text-text-secondary">
                        <User size={20} />
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isMenuOpen)}
                        className="p-2 text-accent-main bg-gray-50 rounded-md"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navbar Dropdown list */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl md:hidden animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-4 gap-2">
                        {navItems.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`p-3 rounded-lg text-base font-medium ${location.pathname === link.path ? 'bg-accent-main text-white' : 'text-text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;