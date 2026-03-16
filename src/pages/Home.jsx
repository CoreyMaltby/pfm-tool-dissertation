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
import { LayoutDashboard, ShieldCheck, GraduationCap, Zap, ArrowRight, Lock } from 'lucide-react';

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
        placeholder: "[Hybrid Storage Preview]" //TODO: Replace with actual preview image or component
    },
    {
        title: "Financial Literacy",
        description: "Embedded contextual tooltips and guides to help you interpret your data and improve financial understanding..",
        icon: GraduationCap,
        colour: "bg-blue-100 text-blue-600",
        placeholder: "[Financial Literacy Preview]", //TODO: Replace with actual preview image or component
        reverse: true
    },
    {
        title: "Positive Notifications",
        description: "The system uses positive nudges to encourage healthy spending habits instead of triggers that cause guilt.",
        icon: Zap,
        colour: "bg-purple-100 text-purple-600",
        placeholder: "[Positive Notifications Preview]" //TODO: Replace with actual preview image or component
    }
]

// Renders individual feature on their own row.
const FeatureRow = ({ feature }) => {
    const { title, description, icon: Icon, colour, placeholder, reverse } = feature;
    return (
        <div className={`flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center gap-10 ${uiTheme.transition}`}>
            <div className={`flex-1 w-full aspect-video ${uiTheme.card} flex items-center justify-center`}>
                <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">{placeholder}</span>
            </div>
            <div className="flex-1 space-y-3">
                <div className={`w-10 h-10 ${colour} rounded-lg flex items-center justify-center ${uiTheme.transition}`}>
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
    // TODO: Replace with actual authentication state from context or global state management
    const isAuthenticated = false; // Placeholder for authentication state
    return (
        <main className="flex flex-col w-full bg-background-main">
            {/* HERO SECTION: Welcome & Dashboard Preview
            Displays a preview of the dashboard, site tagline and a link to the dashboard*/}
            <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-16 bg-white border-b border-gray-100">
                <div className="max-w-5xl w-full flex flex-col items-center gap-12">
                    <div className="relative w-full max-w-4xl mx-auto group">
                        <div className="relative aspect-video bg-gray-50 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-center">
                            <LayoutDashboard size={80} className="opacity-20 text-gray-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-text-tertiary">
                        The Personal Finance Tool <span className="text-accent-main">designed for you.</span>
                    </h1>
                    <Link to={isAuthenticated ? "/dashboard" : "/login"} className="inline-flex items-center gap-3 px-12 py-6 bg-accent-main text-white font-black rounded-2xl hover:scale-105 transition-all text-xl">
                        {isAuthenticated ? "View Dashboard" : "Get Started"} <ArrowRight size={28} />
                    </Link>
                </div>
            </section>

            {/* FEATURES SECTION: Key Features of the site
            Renders all the features from the features array as individual FeatureRow components. 
            Each feature has an icon, title, description and an image.*/}
            <section className={`${uiTheme.section} gap-16 bg-background-main`}>
                <h2 className={`${uiTheme.heading}`}>Why Use This?</h2>
                <div className="max-w-5xl w-full flex flex-col gap-20">
                    {/* Displays each feature as a FeatureRow component */}
                    {features.map((feature) => (
                        <FeatureRow key={feature.title} feature={feature} />
                    ))}
                </div>
            </section>

            {/* SECURITY SECTION: Security & Privacy Information
            Displays information GDPR, Data Protection Act and the local-first storage */}
            <section className={`${uiTheme.section} bg-background-secondary text-white`}>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-white">Privacy & Security</h2>
                        {/* Data security highlight card with icon and description */}
                        <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex gap-4">
                            <Lock className="text-accent-main shrink-0" size={24} />
                            <p className="text-xs text-white">Local-First: Your data stays on your device unless you choose cloud sync.</p>
                        </div>
                    </div>
                    {/* Image of security features */}
                    <div className="aspect-square bg-white/5 rounded-xl border-8 border-white/5 flex items-center justify-center">
                    {/* TODO: Replace with actual security image or component */}
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">[Security Image]</span> 
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;