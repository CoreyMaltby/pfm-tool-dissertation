/** Profile Settings Component
 * Tabs on the left side which select different categories of settings
 */

import React, { useEffect, useState } from "react"
import { User, Lock, Bell, Trash2, Cloud, Save, Key, LayoutDashboard, Loader2, AlertTriangle, Sparkles } from "lucide-react"
import { dataService } from "../services/dataService";
import { useSettingsStore } from "../store/useSettingsStore";
import { supabase } from "../lib/supabaseClient";

const uiTheme = {
    transition: "transition-all duration-300 ease-in-out",
    input: "w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-main/20 focus:border-accent-main transition-all text-sm shadow-sm",
    primaryAction: "inline-flex items-center gap-2 px-8 py-4 bg-accent-main text-white font-black rounded-xl shadow-md shadow-accent-main/30 hover:scale-105 transition-transform text-sm disabled:opacity-50",
};

// Sub-components
const AccountTab = ({ userId }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await dataService.fetchProfile(userId);
            if (profile) {
                setFirstName(profile.first_name || "");
                setLastName(profile.last_name || "");
                setEmail(profile.email || "");
            }
        };
        if (userId) loadProfile();
    }, [userId]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dataService.updateProfile(userId, {
                first_name: firstName,
                last_name: lastName
            });
            alert("Profile updated successfully.");
        } catch (err) {
            alert("Update failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteData = async () => {
        if (!window.confirm("Permanently delete all financial records? This cannot be undone.")) return;
        setLoading(true);
        try {
            await dataService.deleteAllUserData(userId);
            alert("All financial data has been cleared.");
            window.location.reload();
        } catch (err) {
            alert("Delete failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-accent-main rounded-full flex items-center justify-center font-black text-white text-3xl shadow-2xl uppercase">
                    {firstName.charAt(0)}{lastName.charAt(0) || "U"}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Your Profile</h3>
                    <p className="text-gray-400 text-sm">{email}</p>
                </div>
            </div>

            <form className="space-y-6 max-w-xl" onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-[10px] font-black uppercase tracking-widest ml-1">First Name</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={uiTheme.input} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-[10px] font-black uppercase tracking-widest ml-1">Last Name</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={uiTheme.input} />
                    </div>
                </div>
                <div className="space-y-1.5 opacity-50">
                    <label className="text-gray-300 text-[10px] font-black uppercase tracking-widest ml-1">Email Address (Read Only)</label>
                    <input type="email" value={email} disabled className={uiTheme.input} />
                </div>
                <button type="submit" disabled={loading} className={uiTheme.primaryAction}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
            </form>

            <div className="pt-12 border-t border-gray-700 space-y-6">
                <h4 className="text-lg font-bold text-red-400 uppercase tracking-tighter">Danger Zone</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleDeleteData} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 text-red-400 border border-red-800/50 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-sm">
                        <Trash2 size={18} /> Wipe Financial Data
                    </button>
                    <button onClick={() => dataService.deleteAccount(userId)} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-900/20">
                        <Trash2 size={18} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const SecurityTab = ({ userId }) => {
    const [isCloudStorage, setIsCloudStorage] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const checkStorage = async () => {
            try {
                const mode = await dataService.getStorageMode(userId);
                setIsCloudStorage(mode === 'cloud');
            } catch (error) {
                console.error("Error fetching storage mode: ", error);
            }
        };
        if (userId) checkStorage();
    }, [userId]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("Passwords do not match.");
        if (newPassword.length < 6) return alert("Password must be at least 6 characters.");

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            alert("Password successfully updated.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStorageConfirm = async () => {
        const targetMode = isCloudStorage ? "cloud" : "local";
        if (!window.confirm(`Switch to ${targetMode} storage? Data will be moved and deleted from the previous source.`)) {
            setIsCloudStorage(targetMode !== "cloud");
            return;
        }
        setIsMigrating(true);
        try {
            if (targetMode === 'cloud') {
                await dataService.migrateLocalToCloud(userId);
            } else {
                await dataService.migrateCloudToLocal(userId);
            }
            alert(`Migration complete: stored in ${targetMode}.`);
        } catch (error) {
            alert(`Migration failed: ${error.message}`);
            setIsCloudStorage(targetMode !== "cloud");
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-bold text-white">Change Password</h3>
                <form className="space-y-6 max-w-lg mt-6" onSubmit={handlePasswordUpdate}>
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-[10px] font-black uppercase tracking-widest ml-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={uiTheme.input} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-[10px] font-black uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={uiTheme.input} required />
                    </div>
                    <button type="submit" disabled={loading} className={`${uiTheme.primaryAction} mt-4`}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <><Key size={18} /> Update Password</>}
                    </button>
                </form>
            </div>

            <div className="pt-12 border-t border-gray-700 space-y-6">
                <div className="flex items-center gap-3">
                    <Cloud className="text-accent-main" size={24} />
                    <h3 className="text-xl font-bold text-white">Privacy & Data Preference</h3>
                </div>
                <div className={`p-6 bg-white/5 rounded-[2rem] border ${isMigrating ? 'border-accent-main animate-pulse' : 'border-white/10'} max-w-lg space-y-6 transition-all`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-white font-semibold">{isCloudStorage ? "Cloud Storage" : "Local Storage"}</span>
                            <p className="text-xs text-gray-400">{isCloudStorage ? "Active on all devices." : "Strictly on this device."}</p>
                        </div>
                        <button onClick={() => setIsCloudStorage(!isCloudStorage)} disabled={isMigrating} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${isCloudStorage ? 'bg-accent-main' : 'bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isCloudStorage ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button onClick={handleStorageConfirm} disabled={isMigrating} className="w-full py-3.5 bg-white/10 text-white text-[11px] font-black uppercase rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                        {isMigrating ? "Processing Migration..." : "Confirm & Migrate Data"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationsTab = ({ userId }) => {
    const [prefs, setPrefs] = useState({ push: false, email: true, nudge: true, budget: true, security: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadPrefs = async () => {
            const profile = await dataService.fetchProfile(userId);
            if (profile?.notification_preferences) setPrefs(profile.notification_preferences);
            setLoading(false);
        };
        if (userId) loadPrefs();
    }, [userId]);

    const handleToggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await dataService.updateProfile(userId, { notification_preferences: prefs });
            alert("Notification settings updated.");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
            <div className="space-y-4 max-w-xl">
                {Object.keys(prefs).map((key) => (
                    <div key={key} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-white font-semibold capitalize">{key} Alerts</span>
                        <button onClick={() => handleToggle(key)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${prefs[key] ? 'bg-accent-main' : 'bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                ))}
                <button onClick={handleSave} disabled={saving} className={uiTheme.primaryAction}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Preferences"}
                </button>
            </div>
        </div>
    );
};

const DashboardTab = ({ userId }) => {
    const { toggleTips, showContextualTips } = useSettingsStore();
    const [uiPrefs, setUiPrefs] = useState({ showSafeToSpend: true, showSavingsGoals: true, showContextualTips: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadUiPrefs = async () => {
            const profile = await dataService.fetchProfile(userId);
            if (profile?.ui_preferences) setUiPrefs(profile.ui_preferences);
            setLoading(false);
        };
        if (userId) loadUiPrefs();
    }, [userId]);

    const handleToggle = (key) => setUiPrefs(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await dataService.updateProfile(userId, { ui_preferences: uiPrefs });
            // Sync Zustand store
            if (uiPrefs.showContextualTips !== showContextualTips) toggleTips();
            alert("Dashboard layout updated.");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-10"> {/* TYPO FIXED: clasName -> className */}
            <h3 className="text-xl font-bold text-white">Dashboard Configuration</h3>
            <div className="space-y-4 max-w-xl">
                {['showSafeToSpend', 'showSavingsGoals', 'showContextualTips'].map((key) => (
                    <div key={key} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-white font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <button onClick={() => handleToggle(key)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${uiPrefs[key] ? 'bg-accent-main' : 'bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${uiPrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                ))}
                <button onClick={handleSave} disabled={saving} className={uiTheme.primaryAction}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Update Dashboard"}
                </button>
            </div>
        </div>
    );
};

// Tab categories selection rendered in the sidebar
const tab_data = [
    { name: "Account", icon: User },
    { name: "Security & Privacy", icon: Lock },
    { name: "Notifications", icon: Bell },
    { name: "Dashboard", icon: LayoutDashboard },
];

// Main Component
const ProfileSettings = ({ session }) => {
    const [activeTab, setActiveTab] = useState("Account");
    const userId = session?.user?.id;

    const renderTab = () => {
        switch (activeTab) {
            case "Account": return <AccountTab userId={userId} />;
            case "Security & Privacy": return <SecurityTab userId={userId} />;
            case "Notifications": return <NotificationsTab userId={userId} />;
            case "Dashboard": return <DashboardTab userId={userId} />;
            default: return null;
        }
    };

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 px-6">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="text-center">
                    <h1 className="text-4xl font-black text-white">Profile Settings</h1>
                </header>
                <div className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 flex flex-col md:flex-row min-h-[600px] overflow-hidden">
                    <div className="w-full md:w-72 border-r border-gray-700 p-4 space-y-2 bg-black/10">
                        {tab_data.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.name ? "bg-accent-main text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                <tab.icon size={20} />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 p-8 md:p-12">
                        {renderTab()}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfileSettings;