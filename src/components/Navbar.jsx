import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Navbar = ({ session }) => {
    const [isMenuOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Learning Hub", path: "/learning-hub" },
        { name: "Support", path: "/support" },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        navigate("/");
    };

    return (
        <nav className="fixed top-0 left-0 z-50 w-full bg-background-secondary border-b border-white/10 shadow-lg h-16">
            <div className="px-4 h-full flex items-center justify-between">

                {/* Site Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-accent-main rounded-md flex items-center justify-center transition-transform group-hover:scale-110">
                        <span className="text-white font-bold text-xs">PFM</span>
                    </div>
                    <span className="font-black text-xl text-white hidden sm:block">Tool</span>
                </Link>

                {/* Desktop Navbar */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-semibold transition-all ${
                                location.pathname === link.path 
                                ? 'text-accent-main' 
                                : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 ml-4 border-l pl-8 border-white/10">
                        {session ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center gap-2 text-sm font-bold transition-all ${
                                        location.pathname.startsWith('/dashboard') 
                                        ? 'text-accent-main' 
                                        : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>
                                <Link to="/profile" className="p-2 bg-white/5 rounded-full text-gray-300 hover:bg-accent-main hover:text-white transition-all border border-white/10">
                                    <User size={18} />
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Login</Link>
                                <Link 
                                    to="/signup" 
                                    className="px-5 py-2 bg-accent-main text-white text-sm font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-accent-main/20"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navbar Controls */}
                <div className="flex md:hidden items-center gap-2">
                    {session ? (
                        <Link to="/dashboard" className="p-2 text-gray-300 hover:text-white">
                            <LayoutDashboard size={20} />
                        </Link>
                    ) : (
                        <Link to="/login" className="p-2 text-gray-300 hover:text-white">
                            <LogIn size={20} />
                        </Link>
                    )}
                    
                    <Link to="/profile" className="p-2 text-gray-300 hover:text-white">
                        <User size={20} />
                    </Link>

                    <button
                        onClick={() => setIsOpen(!isMenuOpen)}
                        className="ml-2 p-2 text-white bg-white/5 rounded-lg border border-white/10"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navbar Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-background-secondary border-b border-white/10 shadow-2xl md:hidden animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-4 gap-2">
                        {navItems.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`p-4 rounded-xl text-base font-bold transition-all ${
                                    location.pathname === link.path 
                                    ? 'bg-accent-main text-white shadow-lg shadow-accent-main/20' 
                                    : 'text-gray-300 hover:bg-white/5'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="my-2 border-t border-white/10" />

                        {session ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsOpen(false)}
                                    className="p-4 flex items-center gap-3 rounded-xl text-gray-300 hover:bg-white/5 font-bold"
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="p-4 flex items-center gap-3 rounded-xl text-red-400 hover:bg-red-400/10 text-left font-bold"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 p-2">
                                <Link 
                                    to="/login" 
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 rounded-xl text-gray-300 hover:bg-white/5 font-bold text-center border border-white/10"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 rounded-xl bg-accent-main text-white text-center font-black shadow-lg shadow-accent-main/20"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;