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
        <footer className="w-full bg-background-secondary text-text-main mt-auto border-t-2 border-black">
            <div className="w-full px-6 md:px-12 py-8">
                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">

                    {/* Logo and Tagline */}
                    <div className="flex flex-col gap-2 max-w-sm">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-accent-main rounded-lg flex items-center justify-center border border-white/20">
                                <span className="text-white font-bold text-xs">PFM</span>
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight">Tool</span>
                        </Link>
                        <p className="text-gray-300 text-[11px] md:text-xs leading-relaxed max-w-[200px] md:max-w-none">
                            Master your money, secure your future.
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 md:gap-16">
                        {Object.entries(footerLinks).map(([section, links]) => (
                            <div key={section} className="flex flex-col">
                                <h3 className="font-bold text-white text-[10px] md:text-xs uppercase tracking-[0.15em] mb-4">
                                    {section}
                                </h3>
                                <ul className="flex flex-col gap-3 md:gap-2">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.path}
                                                className={`text-xs md:text-sm transition-colors duration-200 hover:text-accent-main inline-block ${link.highlight
                                                    ? 'text-accent-main font-bold underline underline-offset-4'
                                                    : 'text-gray-200'
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
                <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} PFM Tool. All rights reserved.</p>
                    <div className="flex gap-4 md:gap-6">
                        <Link to="/privacy-security" className="hover:text-white transition-colors">Security</Link>
                        <Link to="/data-handling" className="hover:text-white transition-colors">GDPR</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;