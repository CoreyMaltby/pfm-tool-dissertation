/** Dashboard Sidebar Component
 *  Handles links to each dashboard page
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PiggyBank, BarChart3, Wallet, ArrowLeftRight, Bell } from 'lucide-react';

const sidebarLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Savings', path: '/dashboard/savings', icon: PiggyBank },
    { name: 'Insights', path: '/dashboard/insights', icon: BarChart3 },
    { name: 'Budgets', path: '/dashboard/budgets', icon: Wallet },
    { name: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
];

const DashboardSidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-background-secondary min-h-[calc(100vh-4rem)] border-r border-white/5 p-6 space-y-8 shrink-0 hidden md:block">
            <div className="space-y-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-3 mb-4">
                    Financial Hub
                </h2>
                <nav className="space-y-2">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${isActive
                                    ? "bg-accent-main text-white  translate-x-1"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-white" : "text-gray-500 group-hover:text-white"} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default DashboardSidebar;