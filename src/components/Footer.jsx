import { Link } from "react-router-dom";

const footerLinks = {
    Product: [
        { name: 'Dashboard Overview', path: '/dashboard' },
        { name: 'Smart Budgets', path: '/dashboard/budgets' },
        { name: 'Transaction Tracking', path: '/dashboard/transactions' },
        { name: 'Goal Setting', path: '/dashboard/goals' },
        { name: 'Security', path: '/privacy-security' },
    ],
    Resources: [
        { name: 'Learning Hub', path: '/learning-hub' },
        { name: 'Cost of Living Tips', path: '/learning-hub/cost-of-living' },
        { name: 'Interest Guides', path: '/learning-hub/interest-guides' },
        { name: 'Support Center', path: '/support' },
    ],
    Information: [
        { name: 'About the Project', path: '/about' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Security Standards', path: '/privacy-security' },
        { name: 'Data Handling', path: '/data-handling' },
    ],
};

const Footer = () => {
    return (
        <footer className="w-full bg-background-secondary text-text-main mt-auto border-t border-gray-700">
            <div className="w-full px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between gap-12 text-sm">

                    {/* Logo and Tagline */}
                    <div className="flex flex-col gap-3 max-w-sm">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-accent-main rounded-xl flex items-center justify-center border border-white/20">
                                <span className="text-white font-bold text-sm">PFM</span>
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">PFM Tool</span>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Master your money, secure your future.
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                        {Object.entries(footerLinks).map(([section, links]) => (
                            <div key={section}>
                                <h3 className="font-bold text-white text-xs uppercase tracking-[0.15em] mb-4">
                                    {section}
                                </h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.path}
                                                className={`text-sm transition-colors duration-200 hover:text-accent-main ${link.highlight
                                                    ? 'text-accent-main font-bold underline underline-offset-4'
                                                    : 'text-gray-300'
                                                    }`}
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar*/}
                <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} PFM Tool. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy-security" className="hover:text-white transition-colors">Security Standards</Link>
                        <Link to="/data-handling" className="hover:text-white transition-colors">GDPR Compliance</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;