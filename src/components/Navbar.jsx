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
            <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 md:hidden h-16">
                <div className="grid h-full grid-cols-5 font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`inline-flex flex-col items-center justify-center hover:bg-gray-50 ${location.pathname === item.path ? 'text-green-600' : 'text-gray-700'
                                }`}
                        >
                            <span className="text-[10px] mt-1">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Desktop Navbar */}
            <aside className="fixed top-0 left-0 z-40 w-64 h-screen hidden md:block border-r border-gray-200 bg-gray-50">
                <div className="h-full px-3 py-4 overflow-y-auto">
                    <div className="flex items-center ps-2.5 mb-10">
                        <span className="self-center text-xl font-bold text-green-600">PFM Tool</span>
                    </div>
                    <ul className="space-y-2 font-medium">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-2 rounded-lg hover:bg-white hover:shadow-sm ${location.pathname === item.path ? 'bg-white text-green-600 shadow-sm' : 'text-gray-900'
                                        }`}
                                >
                                    <span className="ms-3">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
