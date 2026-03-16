// Dashboard Notifications Page

import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Settings, CheckCheck, Trash2, Zap, ShieldCheck, Wallet, Clock, BellRing, Info, Smartphone, Mail } from 'lucide-react';

const DashboardNotifications = () => {
    // Maps database type to UI Visuals
    const getNotificationStyles = (type) => {
        switch (type?.toLowerCase()) {
            case 'nudge':
                return { icon: Zap, color: 'text-accent-main', title: 'Financial Nudge' };
            case 'budget':
                return { icon: Wallet, color: 'text-yellow-500', title: 'Budget Alert' };
            case 'security':
                return { icon: ShieldCheck, color: 'text-blue-400', title: 'Security Update' };
            default:
                return { icon: Info, color: 'text-gray-400', title: 'System Notification' };
        }
    };

    // Sample data
    const [notifications, setNotifications] = useState([
        {
            id: "uuid-1",
            type: 'nudge',
            message: "You've spent 15% less on Dining Out this week. Great work!",
            read: false,
            created_at: '2h ago'
        },
        {
            id: "uuid-2",
            type: 'budget',
            message: "You have reached 80% of your groceries budget for March.",
            read: true,
            created_at: '1d ago'
        },
        {
            id: "uuid-3",
            type: 'security',
            message: "New login detected from a Chrome browser on Windows.",
            read: true,
            created_at: '3d ago'
        }
    ]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="space-y-1">
                    <p className="text-white/70 text-xs font-black uppercase tracking-widest">Master Feed</p>
                    <h1 className="text-4xl font-black text-white leading-tight">Notifications</h1>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                    {/* Notification Feed */}
                    <section className="xl:col-span-2 bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 bg-black/10 border-b border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">History: Past 30 Days</span>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-accent-main hover:text-white transition-colors flex items-center gap-2">
                                <CheckCheck size={16} /> Mark all as read
                            </button>
                        </div>

                        <div className="divide-y divide-gray-700">
                            {notifications.length > 0 ? (
                                notifications.map((note) => {
                                    const { icon: Icon, color, title } = getNotificationStyles(note.type);
                                    return (
                                        <div key={note.id} className={`p-6 flex gap-6 hover:bg-white/[0.02] transition-colors relative group ${!note.read ? 'bg-accent-main/5' : ''}`}>
                                            {!note.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-main"></div>}

                                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                                                <Icon size={24} />
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`font-bold text-sm ${!note.read ? 'text-white' : 'text-gray-400'}`}>{title}</h3>
                                                    <span className="text-[10px] text-gray-500 font-medium">{note.created_at}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{note.message}</p>
                                            </div>

                                            <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-400 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <BellRing size={48} className="mx-auto text-gray-700" />
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Your inbox is empty</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Preferences Sidebar */}
                    <section className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 p-8 space-y-8 sticky top-24">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-6">
                            <Settings className="text-accent-main" size={20} />
                            <h2 className="text-lg font-bold text-white uppercase tracking-tighter">Preferences</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Individual Toggles */}
                            {[
                                { label: 'Budget Alerts', icon: Wallet },
                                { label: 'Positive Nudges', icon: Zap },
                                { label: 'Security Alerts', icon: ShieldCheck }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className="text-gray-500 group-hover:text-accent-main transition-colors" />
                                        <span className="text-xs font-bold text-gray-300">{item.label}</span>
                                    </div>
                                    <button className="relative inline-flex h-5 w-9 rounded-full bg-accent-main border-2 border-transparent transition-colors">
                                        <span className="translate-x-4 inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm" />
                                    </button>
                                </div>
                            ))}

                            <hr className="border-gray-700" />

                            {/* Delivery Methods */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Delivery Methods</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-white font-medium">
                                            <Mail size={14} className="text-gray-400" /> Email
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-accent-main shadow-[0_0_8px_rgba(88,180,128,0.5)]"></div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-white font-medium">
                                            <Smartphone size={14} className="text-gray-400" /> Push
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-accent-main shadow-[0_0_8px_rgba(88,180,128,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Action */}
                        <button className="w-full py-4 bg-accent-main text-white font-black rounded-xl shadow-lg shadow-accent-main/20 hover:scale-[1.02] active:scale-95 transition-all text-xs">
                            Update Settings
                        </button>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default DashboardNotifications;