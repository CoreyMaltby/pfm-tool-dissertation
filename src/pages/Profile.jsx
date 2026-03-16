/** Profile Settings Component
 * Tabs on the left side which select different categories of settings
 */

import React, { useState } from "react"
import { User, Lock, Bell, Trash2, Cloud, Save, Key, LayoutDashboard } from "lucide-react"

const uiTheme = {
    transition: "transition-all duration-300 ease-in-out",
    input: "w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-main/20 focus:border-accent-main transition-all text-sm shadow-sm",
    primaryAction: "inline-flex items-center gap-2 px-8 py-4 bg-accent-main text-white font-black rounded-xl shadow-md shadow-accent-main/30 hover:scale-105 transition-transform text-sm",
};

// Sub-components for category settings

const AccountTab = () => {
    const [firstName, setfirstName] = useState("");
    const [secondName, setsecondName] = useState("");
    const [email, setEmail] = useState("");

    // Profile update popup
    const handleSaveProfile = (e) => {
        e.preventDefault();
        const confirmed = window.confirm("Are you sure you want to update your profile information?");
        if (confirmed) {
            // TODO: Database logic
            console.log("Profile updated:", { firstName, secondName, email });
            alert("Profile successfully updated.");
        }
    };

    // Data delete popup
    const handleDeleteData = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all your finacial data? This action cannot be undone."
        );
        if (confirmed) {
            // TODO: Database logic
            alert("All financial data has bene deleted.")
        }
    };

    // Account Deletion popup
    const handleDeleteAccount = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all your acount? This will permanently remove your profile and all accociated data."
        );
        if (confirmed) {
            // TODO: Database logic
            alert("Your account has been deleted.")
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-accent-main rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg shadow-accent-main/20">
                    US
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white leading-tight">Your Profile</h3>
                    <p className="text-gray-400 text-sm">Configure your profile settings and personal information.</p>
                </div>
            </div>

            {/* Profile Form */}
            <form className="space-y-6 max-w-xl" onSubmit={handleSaveProfile}>
                <div className="space-y-1.5">
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" value={firstName} onChange={(e) => setfirstName(e.target.value)} className={uiTheme.input} required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="secondName">Second Name</label>
                    <input type="text" id="secondName" value={secondName} onChange={(e) => setsecondName(e.target.value)} className={uiTheme.input} required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="email">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={uiTheme.input} required />
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <button type="submit" className={uiTheme.primaryAction}>
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </form>

            {/* Account Management Actions*/}
            <div className="pt-12 border-t border-gray-700 space-y-6">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-red-400 uppercase tracking-tighter">Danger Zone</h4>
                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                        Please be aware that these changes are irreversible.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleDeleteData}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 text-red-400 border border-red-800/50 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-sm flex-1">
                        <Trash2 size={18} /> Delete All Data
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm flex-1 shadow-lg shadow-red-900/20">
                        <Trash2 size={18} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
};

const SecurityTab = () => {
    const [isCloudStorage, setIsCloudStorage] = useState(true);
    // Password update confirmation popup
    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to update your password? You will be required to log in again with your new credentials.")) {
            alert("Password successfully updated.");
        }
    };

    // Storage confirmation popup
    const handleStorageConfirm = () => {
        const mode = isCloudStorage ? "Cloud" : "Local";
        const message = isCloudStorage
            ? "Switch to Cloud Storage? Your data will be encrypted and synced across your devices."
            : "Switch to Local Storage? Your data will be removed from the cloud and stored only on this device.";

        const confirmed = window.confirm(message);

        if (confirmed) {
            // TODO: Database logic
            alert(`Storage mode successfully set to ${mode}. This will take a few minutes to update.`);
        }
    };

    return (
        <div className="space-y-10">
            {/* Change Password Section */}
            <div>
                <h3 className="text-xl font-bold text-white">Change Password</h3>
                <form className="space-y-6 max-w-lg mt-6" onSubmit={handlePasswordUpdate}>
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="current">Current Password</label>
                        <input type="password" id="current" className={uiTheme.input} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest" htmlFor="new">New Password</label>
                        <input type="password" id="new" className={uiTheme.input} />
                    </div>

                    <button type="submit" className={`${uiTheme.primaryAction} mt-4`}>
                        <Key size={18} /> Update Password
                    </button>
                </form>
            </div>

            {/* Privacy & Data Preference Section */}
            <div className="pt-12 border-t border-gray-700 space-y-6">
                <div className="flex items-center gap-3">
                    <Cloud className="text-accent-main mt-0.5 shrink-0" size={24} />
                    <h3 className="text-xl font-bold text-white leading-tight">Privacy & Data Preference</h3>
                </div>

                <div className="max-w-3xl space-y-6 text-sm text-gray-300">
                    <p className="leading-relaxed">
                        This tool utilizes a <strong className="text-white font-semibold">Hybrid-Storage Model</strong> that allows you to choose between your financial data being stored locally on your device or via our secure cloud storage for multi-device access. All data is encrypted regardless of the chosen method.
                    </p>

                    {/* Local or Cloud Toggle Container */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 max-w-lg space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <span className="text-white font-semibold">
                                    {isCloudStorage ? "Cloud Storage Active" : "Local Storage Active"}
                                </span>
                                <p className="text-xs text-gray-400">
                                    {isCloudStorage
                                        ? "Data is synced securely across your devices."
                                        : "Data remains strictly on this current device."}
                                </p>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                type="button"
                                onClick={() => setIsCloudStorage(!isCloudStorage)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-main/20 ${isCloudStorage ? 'bg-accent-main' : 'bg-gray-700'}`}
                                role="switch"
                                aria-checked={isCloudStorage}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${isCloudStorage ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Confirm Button for Storage Mode */}
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={handleStorageConfirm}
                                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10"
                            >
                                Confirm Storage Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationsTab = () => {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [inSiteAlerts, setinSiteAlerts] = useState(true);

    // Confirmation popup
    const handleNotificationsConfirm = () => {
        const confirmed = window.confirm("Are you sure you want to update your notification preferences?");

        if (confirmed) {
            // TODO: Database Logic
            console.log("Notification preferences saved:", { emailAlerts, inSiteAlerts });
            alert("Notification settings updated successfully.");
        }
    };

    return (
        <div className="space-y-10">
            {/* Notification Preferences Section */}
            <div>
                <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                <p className="text-gray-400 text-sm mt-1 mb-6 max-w-2xl">
                    Toggle between email and in-site alerts to keep yourself informed on budget thresholds, goal progress, and more.
                </p>

                <div className="space-y-4 max-w-xl">
                    {/* Email Alerts Toggle */}
                    <div className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="space-y-0.5">
                            <span className="text-white font-semibold">Email Alerts</span>
                            <p className="text-xs text-gray-400">Receive periodic budget summaries.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEmailAlerts(!emailAlerts)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${emailAlerts ? 'bg-accent-main' : 'bg-gray-700'}`}
                            role="switch"
                            aria-checked={emailAlerts}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* In-Site Alerts Toggle */}
                    <div className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="space-y-0.5">
                            <span className="text-white font-semibold">In-Site Alerts</span>
                            <p className="text-xs text-gray-400">Receive real-time positive nudges and budget notifications within the dashboard.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setinSiteAlerts(!inSiteAlerts)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${inSiteAlerts ? 'bg-accent-main' : 'bg-gray-700'}`}
                            role="switch"
                            aria-checked={inSiteAlerts}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${inSiteAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={handleNotificationsConfirm}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10"
                        >
                            Confirm Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardTab = () => {
    const [showSafeToSpend, setShowSafeToSpend] = useState(true);
    const [showSavingsGoals, setShowSavingsGoals] = useState(true);

    // Dashboard preferences save popup
    const handleDashboardSave = () => {
        if (window.confirm("Save dashboard display preferences?")) {
            alert("Dashboard layout updated.");
        }
    };

    return (
        <div clasName="space-y-10">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white">Dashboard Display</h3>
                <p className="text-gray-400 text-sm mt-1 mb-6 max-w-2xl">
                    Customise which widgets are visible on your dashboard overview.
                </p>

                {/* Dsipaly Toggles */}
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="space-y-0.5">
                            <span className="text-white font-semibold">Show Safe-to-Spend</span>
                            <p className="text-xs text-gray-400">Display your daily spending allowance.</p>
                        </div>
                        <button onClick={() => setShowSafeToSpend(!showSafeToSpend)} className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${showSafeToSpend ? 'bg-accent-main' : 'bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showSafeToSpend ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="space-y-0.5">
                            <span className="text-white font-semibold">Show Savings Goals</span>
                            <p className="text-xs text-gray-400">Display progress bars for targets.</p>
                        </div>
                        <button onClick={() => setShowSavingsGoals(!showSavingsGoals)} className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${showSavingsGoals ? 'bg-accent-main' : 'bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showSavingsGoals ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Save */}
                    <div className="pt-4 border-t border-white/5">
                        <button onClick={handleDashboardSave} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">
                            Save Dashboard View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

// Tab categories selection rendered in the sidebar
const tab_data = [
    { name: "Account", icon: User, component: AccountTab },
    { name: "Security & Privacy", icon: Lock, component: SecurityTab },
    { name: "Notifications", icon: Bell, component: NotificationsTab },
    { name: "Dashboard", icon: LayoutDashboard, component: DashboardTab },
];

// Main Component
const ProfileSettings = () => {
    // State to manage active category
    const [activeTab, setActiveTab] = useState(tab_data[0].name);

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 md:py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">Profile Settings</h1>
                    <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Customise your account and privacy preferences to master your financial autonomy.
                    </p>
                </header>

                {/* Settings Container */}
                <div className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-700 p-4 space-y-2 bg-black/10">
                        {tab_data.map((tab) => {
                            const { name, icon: Icon } = tab;
                            const isActive = activeTab === name;
                            return (
                                <button
                                    key={name}
                                    onClick={() => setActiveTab(name)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? "bg-accent-main text-white translate-x-1"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                                    <span>{name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Category Settings */}
                    <div className={`flex-1 p-8 md:p-12 ${uiTheme.transition}`}>
                        {tab_data.map((tab) => (
                            activeTab === tab.name && (
                                <div key={tab.name}>
                                    <tab.component />
                                </div>
                            )
                        ))}
                    </div>

                </div>
            </div>
        </main>
    );
};

export default ProfileSettings;