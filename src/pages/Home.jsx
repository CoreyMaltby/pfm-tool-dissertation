/**
 * Home Component
 * 
 * The landing page for the site. Displays key features and security information.
 *
 * Sections:
 * - Hero: Photo of dashboard, tagline, and a button linking to the dashboard page if the user is signed in, otherwire it links to the sign in page.
 * - Features: Showcases 3 main features.
 * - Security: Privacy and data protection information
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, ShieldCheck, GraduationCap, Zap,
    ArrowRight, Lock, CloudCog, BookOpen, BellRing
} from 'lucide-react';

// UI theme object
const uiTheme = {
    section: "w-full px-6 py-20 flex flex-col items-center",
    heading: "text-3xl md:text-4xl font-black text-text-tertiary",
    card: "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden",
    transition: "transition-all duration-300 ease-in-out"
};

// Features array injected into the Features section
const features = [
    {
        title: "Hybrid Storage",
        description: "Choose between local-only storage or cloud synchronization for multi-device access.",
        icon: ShieldCheck,
        colour: "bg-green-100 text-accent-main",
        image: <CloudCog size={80} className="text-accent-main opacity-20" />
    },
    {
        title: "Financial Literacy",
        description: "Embedded contextual tooltips and guides to help you interpret your data and improve financial understanding..",
        icon: GraduationCap,
        colour: "bg-blue-100 text-blue-600",
        image: <BookOpen size={80} className="text-blue-600 opacity-20" />,
        reverse: true
    },
    {
        title: "Positive Notifications",
        description: "The system uses positive nudges to encourage healthy spending habits instead of triggers that cause guilt.",
        icon: Zap,
        colour: "bg-purple-100 text-purple-600",
        image: <BellRing size={80} className="text-purple-600 opacity-20" />
    }
]

// Renders individual feature on their own row.
const FeatureRow = ({ feature }) => {
    const { title, description, icon: Icon, colour, image, reverse } = feature;
    return (
        <div className={`flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center gap-10 ${uiTheme.transition}`}>
            <div className={`flex-1 w-full aspect-video ${uiTheme.card} flex items-center justify-center bg-gray-50/50`}>
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl opacity-20 bg-current" />
                    {image}
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <div className={`w-12 h-12 ${colour} rounded-xl flex items-center justify-center ${uiTheme.transition} shadow-sm`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-tertiary">{title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
};

const Home = () => {
    const isAuthenticated = false;
    return (
        <main className="flex flex-col w-full bg-background-main">
            {/* HERO SECTION */}
            <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-16 bg-white border-b border-gray-100">
                <div className="max-w-5xl w-full flex flex-col items-center gap-12">
                    <div className="relative w-full max-w-4xl mx-auto group">
                        <div className="relative aspect-video bg-gray-50 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-center overflow-hidden">
                            <img src="/assets/screenshots/dashboard-main.png" alt="Dashboard Preview" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-text-tertiary">
                        The Personal Finance Tool <span className="text-accent-main">designed for you.</span>
                    </h1>
                    <Link to={isAuthenticated ? "/dashboard" : "/login"} className="inline-flex items-center gap-3 px-12 py-6 bg-accent-main text-white font-black rounded-2xl hover:scale-105 transition-all text-xl shadow-lg shadow-accent-main/20">
                        {isAuthenticated ? "View Dashboard" : "Get Started"} <ArrowRight size={28} />
                    </Link>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className={`${uiTheme.section} gap-16 bg-background-main`}>
                <h2 className={`${uiTheme.heading}`}>Why Use This?</h2>
                <div className="max-w-5xl w-full flex flex-col gap-20">
                    {features.map((feature) => (
                        <FeatureRow key={feature.title} feature={feature} />
                    ))}
                </div>
            </section>

            {/* SECURITY SECTION */}
            <section className={`${uiTheme.section} bg-background-secondary text-white overflow-hidden`}>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 w-full items-center">
                    <div className="space-y-6 text-center md:text-left">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Privacy & Security</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Your financial data is sensitive. We prioritize your privacy by offering a local-first architecture, ensuring you own your data.
                        </p>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 transition-all hover:bg-white/10">
                            <div className="w-10 h-10 bg-accent-main/20 rounded-lg flex items-center justify-center shrink-0">
                                <Lock className="text-accent-main" size={20} />
                            </div>
                            <p className="text-xs text-white/80 font-medium">Local-First: Your data stays on your device unless you choose cloud sync.</p>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-64 h-64 bg-accent-main/20 blur-[100px] rounded-full animate-pulse" />
                        <div className="relative aspect-square w-full max-w-[300px] bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                            <ShieldCheck size={120} className="text-accent-main" />
                            <div className="absolute top-10 right-10 p-3 bg-background-secondary border border-white/10 rounded-xl shadow-xl">
                                <Lock size={20} className="text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;