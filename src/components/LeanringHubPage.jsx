/** Article Component
 * Renders the article based on the ID passed in the URL
 */

import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Share2, Bookmark, Calendar } from 'lucide-react';

// Sample articles data (replace with actual data fetching in production)
const articles = [
    {
        id: 1,
        category: "Budgeting",
        title: "Master the 50/30/20 Rule",
        description: "A simple method to split your income into needs, wants, and savings—with tips to adapt it for irregular income.",
        readTime: "4 min",
    },
    {
        id: 2,
        category: "Interest",
        title: "Simple vs Compound Interest (With Examples)",
        description: "Understand how interest is calculated on loans and savings, and why compounding accelerates growth over time.",
        readTime: "5 min",
    },
    {
        id: 3,
        category: "Savings",
        title: "Build an Emergency Fund Without Stress",
        description: "How to pick a realistic target, automate contributions, and choose the right account to keep your money accessible.",
        readTime: "4 min",
    },
    {
        id: 4,
        category: "Financial Planning",
        title: "Your First Financial Plan: A Step‑By‑Step Checklist",
        description: "Set clear goals, assess your income and risks, and create a simple action plan you can actually stick to.",
        readTime: "6 min",
    },
    {
        id: 5,
        category: "Security",
        title: "Stay Safe from Phishing & Banking Scams",
        description: "Spot common red flags, lock down your accounts with 2FA, and handle suspicious messages the right way.",
        readTime: "4 min",
    },
    {
        id: 6,
        category: "Other",
        title: "Financial Literacy: The Essential Starter Kit",
        description: "Key terms, must-know concepts, and a learning path to boost your confidence with money.",
        readTime: "3 min",
    },
    {
        id: 7,
        category: "Budgeting",
        title: "Zero‑Based Budgeting Made Easy",
        description: "Give every pound a job, plug leaks, and prioritise what matters—perfect for students and first‑time budgeters.",
        readTime: "5 min",
    },
    {
        id: 8,
        category: "Savings",
        title: "Savings Buckets: Short‑, Mid‑, and Long‑Term Goals",
        description: "Set up separate pots for travel, emergencies, and investments so you always know what’s funded—and what’s next.",
        readTime: "4 min",
    }
];

const ArticleView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find Article by ID
    const article = articles.find((article) => article.id === parseInt(id));

    if (!article) {
        return (
            <div className="min-h-screen bg-background-tertiary flex items-center justify-center p-6">
                <div className="bg-background-secondary p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
                    <Link to="/learning-hub" className="text-accent-main font-bold hover:underline">
                        Return to Learning Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation & Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors">
                        <ChevronLeft size={14} /> Return to Learning Hub
                    </button>
                    <div className="flex gap-4">
                        <button className="p-2 text-white/60 hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 text-white/60 hover:text-white transition-colors">
                            <Bookmark size={20} />
                        </button>
                    </div>
                </div>

                {/* Article Content */}
                <article className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    {/* Header Image */}
                    <div className="h-64 bg-white/5 flex items-center justify-center border-b border-white/5 overflow-hidden">
                        <div className="text-white/10 font-black text-6xl uppercase tracking-tighter select-none">
                            {article.category}
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-accent-main bg-accent-main/10 px-3 py-1 rounded">
                                    {article.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock size={14} />
                                    <span>
                                        {article.date || "2026"}
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
                            <p className="text-lg font-medium text-white/90 italic border-l-4 border-accent-main pl-6">
                                {article.description}
                            </p>
                            <div className="whitespace-pre-line text-base">
                                {article.content}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-12 border-t border-gray-700 mt-12 flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent-main rounded-full flex items-center justify-center font-bold text-white">
                                AU
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Author Name</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </main>

    );
};

export default ArticleView;