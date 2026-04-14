// Dashboard Notifications Page

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import dataService from "../services/dataService";
import { Settings, CheckCheck, Trash2, Zap, ShieldCheck, Wallet, Info, Loader2, BellRing } from 'lucide-react';

const DashboardNotifications = ({ session }) => {
    const userId = session?.user?.id;
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [prefs, setPrefs] = useState({ budget: true, nudge: true, security: true, email: true, push: false });

    useEffect(() => {
        if (userId) loadData();
    }, [userId]);

    const loadData = async () => {
        setIsLoading(true);
        const [notes, profile] = await Promise.all([
            dataService.fetchNotifications(userId),
            dataService.fetchProfile(userId)
        ]);
        setNotifications(notes);
        if (profile?.notification_preferences) setPrefs(profile.notification_preferences);
        setIsLoading(false);
    };

    const handleMarkAllRead = async () => {
        await dataService.markAllRead(userId);
        loadData();
    };

    const handleDelete = async (id) => {
        await dataService.deleteNotification(id, userId);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const togglePref = async (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        await dataService.updateNotificationPrefs(userId, newPrefs);
    };

    const getNotificationStyles = (type) => {
        switch (type?.toLowerCase()) {
            case 'nudge': return { icon: Zap, color: 'text-accent-main', title: 'Financial Nudge' };
            case 'budget': return { icon: Wallet, color: 'text-yellow-500', title: 'Budget Alert' };
            case 'security': return { icon: ShieldCheck, color: 'text-blue-400', title: 'Security Update' };
            case 'system': return { icon: Info, color: 'text-purple-400', title: 'System Update' };
            default: return { icon: Info, color: 'text-gray-400', title: 'Notification' };
        }
    };


    return (
        <div className="flex flex-col md:flex-row bg-background-tertiary min-h-screen">
            <DashboardSidebar session={session} />

            <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex justify-between items-end">
                    <h1 className="text-4xl font-black text-white tracking-tight">Notifications</h1>
                    {notifications.length > 0 && (
                        <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    )}
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Notification Feed */}
                    <section className="xl:col-span-2 bg-background-secondary rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden">
                        {isLoading ? (
                            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-500" /></div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {notifications.map((note) => {
                                    const { icon: Icon, color, title } = getNotificationStyles(note.type);
                                    return (
                                        <div key={note.id} className={`p-6 flex gap-6 hover:bg-white/[0.02] transition-colors relative group ${!note.is_read ? 'bg-accent-main/5' : ''}`}>
                                            {!note.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-main"></div>}
                                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 ${color}`}><Icon size={24} /></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between">
                                                    <h3 className={`font-bold text-sm ${!note.is_read ? 'text-white' : 'text-gray-400'}`}>{title}</h3>
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {new Date(note.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">{note.message}</p>
                                            </div>
                                            <button onClick={() => handleDelete(note.id)} className="opacity-50 group-hover:opacity-100 p-2 text-white hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-32 text-center space-y-4 opacity-30">
                                <BellRing size={48} className="mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Inbox Clear</p>
                            </div>
                        )}
                    </section>

                    {/* Preferences Sidebar */}
                    <section className="bg-background-secondary rounded-[2rem] shadow-2xl border border-white/5 p-8 space-y-8 sticky top-24">
                        <h2 className="text-lg font-bold text-white uppercase tracking-tighter flex items-center gap-2"><Settings className="text-accent-main" size={20} /> Preferences</h2>
                        <div className="space-y-6">
                            {/* Individual Toggles */}
                            {[{ id: 'budget', label: 'Budget Alerts', icon: Wallet }, { id: 'nudge', label: 'Positive Nudges', icon: Zap }, { id: 'security', label: 'Security Alerts', icon: ShieldCheck }].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-300">{item.label}</span>
                                    </div>
                                    <button onClick={() => togglePref(item.id)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${prefs[item.id] ? 'bg-accent-main' : 'bg-gray-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${prefs[item.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardNotifications;