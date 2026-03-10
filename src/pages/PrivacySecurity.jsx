// Privacy & Security Information Page

import React from "react";
import { ShieldCheck, Lock, EyeOff, FileText, Smartphone, Database, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacySecurity = () => {
    const navigate = useNavigate();

    // Key features
    const key_features = [
        {
            title: "Local-First Storage",
            description: "By default, your financial data never leaves your device. You have total choice over where the data is stored.",
            icon: Smartphone,
            color: "text-accent-main"
        },
        {
            title: "End-to-End Encryption",
            description: "All data is encrypted locally before any synchronization occurs. Industry-standard protocols are used to ensure your data is unreadable to third parties.",
            icon: Lock,
            color: "text-blue-400"
        },
        {
            title: "Legal Compliance",
            description: "This tool is ethically designed to comply with GDPR and the Data Protection Act 2018, giving you full rights to access and delete your data.",
            icon: ShieldCheck,
            color: "text-purple-400"
        },
        {
            title: "Hybrid-Storage Model",
            description: "Choose between the convenience of cloud sync for multi-device access or local-only storage.",
            icon: Database,
            color: "text-green-400"
        }
    ];

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 md:py-20 px-6">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Back Button and Header */}
                <div className="space-y-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">Privacy & Security</h1>
                        <p className="text-white text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            Your trust is our foundation.
                            <br />We believe in ethical design, total transparency, and giving you absolute control over your personal data.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                {/* Main Information */}
                <div className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                        {key_features.map((section, index) => (
                            <div key={index} className="p-8 md:p-12 space-y-4  transition-colors">
                                <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${section.color}`}>
                                    <section.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight">{section.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {section.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Compliance Section */}
                    <div className="p-8 md:p-12 bg-black/10 border-t border-gray-700 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3 text-accent-main uppercase tracking-widest text-xs font-black">
                                    <FileText size={16} />
                                    <span>Ethical Standards</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white">How we handle your data</h2>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    In accordance with the <strong>Data Protection Act 2018</strong>, only collect necessary information.
                                    We do not sell your data to third parties or utilize intrusive tracking algorithms.
                                </p>
                            </div>
                            <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                <h4 className="text-white font-bold text-sm">Your Data Rights</h4>
                                <ul className="space-y-3 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent-main rounded-full"></div>
                                        Right to Erasure (Permanently delete all data)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent-main rounded-full"></div>
                                        Right to Portability (Export your data)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent-main rounded-full"></div>
                                        Right to Object (Control data sync)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PrivacySecurity;