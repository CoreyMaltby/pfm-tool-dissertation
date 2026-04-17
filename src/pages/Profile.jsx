/** Profile Settings Component
 * Tabs on the left side which select different categories of settings
 */
import React, { useEffect, useState } from "react"
import {
    User, Lock, Bell, Trash2, Cloud, Save, Key,
    LayoutDashboard, Loader2, AlertTriangle, ShieldCheck
} from "lucide-react"
import { dataService } from "../services/dataService";
import { useSettingsStore } from "../store/useSettingsStore";
import { supabase } from "../lib/supabaseClient";

const uiTheme = {
    transition: "transition-all duration-300 ease-in-out",
    input: "w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-main/20 transition-all text-sm shadow-sm text-black",
    primaryAction: "inline-flex items-center gap-2 px-8 py-4 bg-accent-main text-black font-black rounded-xl shadow-md hover:scale-105 transition-transform text-xs uppercase tracking-widest",
};

const Toggle = ({ enabled, onChange, label, description, disabled = false }) => (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
        <div className="space-y-0.5 pr-4 text-left">
            <span className="text-white font-bold text-sm capitalize">{label}</span>
            {description && <p className="text-[10px] text-gray-500 font-bold uppercase">{description}</p>}
        </div>
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-accent-main' : 'bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const AccountTab = ({ userId }) => {
    const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await dataService.fetchProfile(userId);
            if (data) setProfile({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                email: data.email || ""
            });
            setLoading(false);
        };
        if (userId) load();
    }, [userId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dataService.updateProfile(userId, {
                first_name: profile.firstName,
                last_name: profile.lastName
            });
            alert("Account Information Updated");
        } catch (err) { alert(err.message); } finally { setSaving(false); }
    };

    const handleDeleteData = async () => {
        if (!window.confirm("Permanently delete all financial records? This cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await dataService.deleteAllUserData(userId);
            alert("All financial data has been cleared.");
            window.location.reload();
        } catch (err) {
            alert("Delete failed: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("WARNING: This will permanently delete your account and all associated data. This action is irreversible. Continue?")) return;

        setIsDeleting(true);
        try {
            await dataService.deleteAllUserData(userId);
            await dataService.deleteAccount(userId);

            alert("Account successfully deleted.");
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (err) {
            alert("Account deletion failed: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-24 h-24 bg-accent-main rounded-full flex items-center justify-center font-black text-black text-4xl shadow-2xl uppercase">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Personal Identity</h3>
                    <p className="text-gray-400 text-sm font-medium">{profile.email}</p>
                </div>
            </div>

            <form className="space-y-6 w-full max-w-xl mx-auto" onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">First Name</label>
                        <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className={uiTheme.input} />
                    </div>
                    <div className="space-y-1.5 text-left">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">Last Name</label>
                        <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className={uiTheme.input} />
                    </div>
                </div>
                <button type="submit" disabled={saving} className={`${uiTheme.primaryAction} w-full justify-center`}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
            </form>

            <div className="pt-12 border-t border-white/5 space-y-6 w-full max-w-xl">
                <div className="flex items-center gap-2 text-red-500 justify-center">
                    <AlertTriangle size={18} />
                    <h4 className="text-sm font-black uppercase tracking-widest">Danger Zone</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleDeleteData}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        <Trash2 size={16} /> Wipe All Data
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                    >
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const SecurityTab = ({ userId }) => {
    const [isCloudStorage, setIsCloudStorage] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            const mode = await dataService.getStorageMode(userId);
            setIsCloudStorage(mode === 'cloud');
            setLoading(false);
        };
        if (userId) check();
    }, [userId]);

    const handleMigration = async () => {
        const target = isCloudStorage ? "cloud" : "local";
        if (!window.confirm(`Initiate migration to ${target} storage?`)) {
            setIsCloudStorage(target !== "cloud");
            return;
        }
        setIsMigrating(true);
        try {
            if (target === 'cloud') await dataService.migrateLocalToCloud(userId);
            else await dataService.migrateCloudToLocal(userId);
            alert("Migration Success");
        } catch (err) { alert(err.message); setIsCloudStorage(target !== "cloud"); }
        finally { setIsMigrating(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center text-center">
            <div className="space-y-6 w-full max-w-xl">
                <div className="flex flex-col items-center gap-3">
                    <Cloud className="text-accent-main" size={32} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Hybrid-Storage Engine</h3>
                </div>
                <div className={`p-6 bg-white/5 rounded-[2rem] border ${isMigrating ? 'border-accent-main animate-pulse' : 'border-white/10'} space-y-6`}>
                    <Toggle
                        label={isCloudStorage ? "Cloud Storage Enabled" : "Local Storage Only"}
                        description={isCloudStorage ? "Data is synced across your devices." : "Data is restricted to this device vault."}
                        enabled={isCloudStorage}
                        onChange={setIsCloudStorage}
                        disabled={isMigrating}
                    />
                    <button onClick={handleMigration} disabled={isMigrating} className="w-full py-4 bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                        {isMigrating ? "Synchronizing Vault..." : "Confirm & Apply Sync"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationsTab = ({ userId }) => {
    const [prefs, setPrefs] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await dataService.fetchProfile(userId);
            if (data?.notification_preferences) setPrefs(data.notification_preferences);
        };
        if (userId) load();
    }, [userId]);

    const handleToggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await dataService.updateProfile(userId, { notification_preferences: prefs });
            alert("Notification Settings Saved");
        } catch (err) { alert(err.message); } finally { setSaving(false); }
    };

    if (!prefs) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-white">Alert Preferences</h3>
            <div className="space-y-4 max-w-xl">
                {Object.keys(prefs).map((key) => (
                    <Toggle
                        key={key}
                        label={`${key} Alerts`}
                        description={`Receive updates regarding ${key} changes.`}
                        enabled={prefs[key]}
                        onChange={() => handleToggle(key)}
                    />
                ))}
                <button onClick={handleSave} disabled={saving} className={uiTheme.primaryAction}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Update Preferences"}
                </button>
            </div>
        </div>
    );
};

const DashboardTab = ({ userId }) => {
    const { setTips, setSafeToSpend, showContextualTips, showSafeToSpend } = useSettingsStore();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await dataService.fetchProfile(userId);
            if (data?.ui_preferences) {
                setTips(data.ui_preferences.showContextualTips);
                setSafeToSpend(data.ui_preferences.showSafeToSpend);
            }
            setLoading(false);
        };
        if (userId) load();
    }, [userId, setTips, setSafeToSpend]);

    const updatePref = async (key, newVal) => {
        setSyncing(true);

        if (key === 'showContextualTips') setTips(newVal);
        if (key === 'showSafeToSpend') setSafeToSpend(newVal);

        try {
            const current = await dataService.fetchProfile(userId);
            const updated = {
                ...(current?.ui_preferences || {}),
                [key]: newVal
            };
            await dataService.updateProfile(userId, { ui_preferences: updated });
        } catch (err) {
            alert("Persistence error: " + err.message);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-main" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center text-center">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Dashboard Layout</h3>
                {syncing && <div className="flex items-center gap-2 text-[10px] font-black text-accent-main uppercase tracking-widest animate-pulse"><Loader2 className="animate-spin" size={12} /> Syncing...</div>}
            </div>

            <div className="space-y-4 max-w-xl">
                <Toggle
                    label="Contextual Learning Tips"
                    description="Show relevant tips across the dashboard pages."
                    enabled={showContextualTips}
                    onChange={(val) => updatePref('showContextualTips', val)}
                    disabled={syncing}
                />
                <Toggle
                    label="Daily Spending Allowance"
                    description="Show calculated Safe-to-Spend widget on overview."
                    enabled={showSafeToSpend}
                    onChange={(val) => updatePref('showSafeToSpend', val)}
                    disabled={syncing}
                />
            </div>
        </div>
    );
};

// Main
const ProfileSettings = ({ session }) => {
    const [activeTab, setActiveTab] = useState("Account");
    const userId = session?.user?.id;

    const tabs = [
        { name: "Account", icon: User },
        { name: "Security & Sync", icon: Lock },
        { name: "Notifications", icon: Bell },
        { name: "Dashboard", icon: LayoutDashboard },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case "Account": return <AccountTab userId={userId} />;
            case "Security & Sync": return <SecurityTab userId={userId} />;
            case "Notifications": return <NotificationsTab userId={userId} />;
            case "Dashboard": return <DashboardTab userId={userId} />;
            default: return null;
        }
    };

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-10 px-4 sm:py-12 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-10">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">Settings</h1>
                </header>

                <div className="bg-background-secondary rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col min-h-[600px]">
                    <nav className="w-full bg-black/20 border-b border-white/5 p-4 sm:p-6">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`
                                        flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 
                                        px-4 py-4 sm:px-6 sm:py-5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all
                                        ${activeTab === tab.name
                                            ? "bg-accent-main text-black shadow-xl shadow-accent-main/10 scale-[1.02]"
                                            : "text-gray-500 hover:bg-white/5 hover:text-white"
                                        }
                                    `}
                                >
                                    <tab.icon size={18} className={activeTab === tab.name ? "text-black" : "text-gray-500"} />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
                        {renderTab()}
                    </div>
                </div>
            </div >
        </main >
    );
};

export default ProfileSettings;