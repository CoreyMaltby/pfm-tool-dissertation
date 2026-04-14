/** Dashboard Sidebar Component
 *  Handles links to each dashboard page
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PiggyBank, BarChart3, Wallet, ArrowLeftRight, Bell, CreditCard, Menu, X } from 'lucide-react';
import dataService from "../services/dataService";

const sidebarLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Savings', path: '/dashboard/savings', icon: PiggyBank },
    { name: 'Insights', path: '/dashboard/insights', icon: BarChart3 },
    { name: 'Budgets', path: '/dashboard/budgets', icon: Wallet },
    { name: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { name: 'Accounts', path: '/dashboard/accounts', icon: CreditCard }
];

const DashboardSidebar = ({ session }) => {
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false)
    const userId = session?.user?.id;

    useEffect(() => {
        if (userId) {
            fetchUnreadCount();
        }
        setIsOpen(false);
    }, [userId, location.pathname]);

    const fetchUnreadCount = async () => {
        try {
            const notifications = await dataService.fetchNotifications(userId);
            const unread = notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-accent-main text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                /* Mobile Styles */
                fixed top-16 bottom-0 left-0 z-40 w-64 bg-background-secondary border-r border-white/5 
                p-6 pt-10 space-y-8 shrink-0 
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}

                /* Desktop Styles */
                md:relative md:translate-x-0 md:top-0 md:block md:min-h-[calc(100vh-4rem)]
            `}>
                <div className="space-y-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-3 mb-4">
                        Financial Hub
                    </h2>
                    <nav className="space-y-2">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            const isNotifications = link.name === 'Notifications';

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${isActive
                                        ? "bg-accent-main text-white translate-x-1"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? "text-white" : "text-gray-500 group-hover:text-white"} />
                                        {link.name}
                                    </div>

                                    {/* Unread Nofitications */}
                                    {isNotifications && unreadCount > 0 && (
                                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[12px] font-black leading-none transition-colors ${isActive
                                            ? "bg-white text-accent-main"
                                            : "bg-accent-main text-white"
                                            }`}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;