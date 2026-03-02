import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { name: 'Home', path: '/', },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Learning Hub', path: '/learning-hub' },
    { name: 'Support', path: '/support' },
    { name: 'Privacy & Security', path: '/privacy-security' },
    { name: 'Login', path: '/login' },
    { name: 'Sign Up', path: '/signup' },
    { name: 'Profile', path: '/profile' },
];

const Navbar = () => {
    const location = useLocation();

    return (
        <>
            {/* Mobile Navbar */}
            <nav className="fixed bottom-0 left-0 z-50 w-full bg-background-main border-t border-gray-200 md:hidden h-16">
                <div className="grid h-full grid-cols-4 font-medium overflow-x-auto">
                    {navItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`inline-flex flex-col items-center justify-center ${location.pathname === item.path ? 'text-accent-main' : 'text-text-secondary'
                                }`}
                        >
                            <span className="text-[10px] mt-1">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-background-main h-16 items-center px-6">
                <div className="flex items-center">
                    <span className="text-xl font-bold text-accent-main mr-8">PFM Tool</span>
                </div>
                <ul className="flex items-center space-x-1 font-medium">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className={`px-3 py-2 rounded-lg hover:bg-white transition-colors ${location.pathname === item.path ? 'bg-white text-accent-main shadow-sm' : 'text-text-secondary'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
