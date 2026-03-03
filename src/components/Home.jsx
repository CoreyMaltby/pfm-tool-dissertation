import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, GraduationCap, Zap, ArrowRight, Lock } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col w-full bg-background-main">

            {/* Welcome section */}
            <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-16 bg-white border-b border-gray-100">
                <div className="max-w-5xl w-full flex flex-col items-center gap-12">

                    {/* Sized the preview by adding max-w-4xl and mx-auto */}
                    <div className="relative w-full max-w-4xl mx-auto group">
                        <div className="relative aspect-video bg-gray-50 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-center overflow-hidden">
                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                <LayoutDashboard size={80} className="opacity-20" />
                                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">
                                    [Dashboard Preview Placeholder]
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-4xl">
                        <h1 className="text-2xl md:text-4xl font-black text-text-tertiary leading-tight">
                            The Personal Finance Management tool <span className="text-accent-main"> <br></br>designed for you.</span>
                        </h1>
                    </div>

                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-3 px-12 py-6 bg-accent-main text-white font-black rounded-2xl shadow-lg shadow-accent-main/30 hover:scale-105 transition-transform text-xl">
                            View Dashboard <ArrowRight size={28} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why use this section */}
            <section className="w-full px-6 py-20 bg-background-main flex flex-col items-center gap-16">
                <h2 className="text-3xl md:text-4xl font-black text-text-tertiary">Why Use This?</h2>

                <div className="max-w-5xl w-full flex flex-col gap-20">
                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 w-full aspect-video bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
                            <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">[Hybrid Storage Preview]</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="w-10 h-10 bg-green-100 text-accent-main rounded-lg flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-text-tertiary">Hybrid Storage</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                Choose between local-only storage or cloud synchronization for multi-device access.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-10">
                        <div className="flex-1 w-full aspect-video bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
                            <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">[Illustration: Learning Hub]</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <GraduationCap size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-text-tertiary">Financial Literacy</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                Embedded contextual tooltips and guides to help you interpret your data and improve financial understanding.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 w-full aspect-video bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
                            <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">[Illustration: Nudges]</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-text-tertiary">Positive Notifications</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                The system uses positive nudges to encourage healthy spending habits instead of triggers that cause guilt.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy & Security Section*/}
            <section className="w-full px-6 py-20 bg-background-secondary text-white">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black">Privacy & Security</h2>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                            Built for privacy & security. The tool is ethically designed to comply with GDPR and the Data Protection Act 2018.
                        </p>
                        <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-4">
                            <Lock className="text-accent-main mt-1 shrink-0" size={24} />
                            <div>
                                <span className="block font-bold text-white text-sm mb-1">Local-First Storage</span>
                                <p className="text-xs text-white">All data is primarily stored locally on your device and only uploaded to the cloud if you choose to do so.</p>
                            </div>
                        </div>
                    </div>

                    <div className="aspect-square bg-white/5 rounded-xl border-8 border-white/5 flex items-center justify-center">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">[Security Illustration]</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;