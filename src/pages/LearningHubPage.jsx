/** Article Component
 * Renders the article based on the ID passed in the URL
 */

import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Minus, Plus, Type, Share2, Bookmark } from 'lucide-react';

import { articles_data } from "../constants/articles";

const ArticleView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fontSize, setFontSize] = React.useState(18);
    const [readProgress, setReadProgress] = React.useState(0);

    // Reading progess
    useEffect(() => {
        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setReadProgress((window.scrollY / scrollHeight) * 100);
            }
        };
        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    // Find Article by ID
    const article = articles_data.find((article) => article.id === parseInt(id));
    // Returns to the hub
    const handleBack = () => navigate(-1);

    if (!article) {
        return (
            <div className="min-h-screen bg-background-tertiary flex items-center justify-center p-6">
                <div className="bg-background-secondary p-8 rounded-3xl text-center border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Article Not Found</h2>
                    <Link to="/learning-hub" className="text-accent-main font-black hover:underline uppercase text-xs">
                        Return to Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-tertiary">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-white/5">
                <div className="h-full bg-accent-main transition-all duration-150" style={{ width: `${readProgress}%` }}></div>
            </div>
            <main className="w-full py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Navigation & Actions */}
                    <div className="flex items-center justify-between">
                        <button onClick={handleBack} className="flex items-center gap-2 text-white/80 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors">
                            <ChevronLeft size={14} /> Back to Hub
                        </button>

                        {/* Accesbility Controls */}
                        <div className="flex items-center gap-2 bg-background-secondary p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setFontSize((size) => Math.max(12, size - 2))}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Decrease font size"
                            >
                                <Minus size={14} />
                            </button>
                            <div className="flex items-center gap-1.5 px-2 text-white font-black text-[10px] uppercase border-x border-white/5">
                                <Type size={12} /> {fontSize}px
                            </div>
                            <button
                                onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Increase font size"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Article Content */}
                    <article className="bg-background-secondary rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="h-48 bg-accent-main/10 flex items-center justify-center border-b border-white/5 overflow-hidden relative">
                            <div className="text-white text-6xl font-black uppercase tracking-tighter opacity-5 select-none">{article.category}</div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background-secondary to-transparent" />
                        </div>

                        <div className="p-8 md:p-16 space-y-10">
                            <header className="space-y-6">
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="text-accent-main bg-accent-main/10 px-3 py-1.5 rounded-lg border border-accent-main/20">
                                        {article.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-white">
                                        <Clock size={14} />
                                        <span>{article.readTime} reading time</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                                    {article.title}
                                </h1>
                                <p className="text-xl font-bold text-white/60 leading-relaxed border-l-4 border-accent-main pl-8 py-2 italic">
                                    {article.description}
                                </p>
                            </header>

                            {/* Article Content */}
                            <div
                                className="text-gray-300 leading-[1.8] space-y-8 whitespace-pre-line font-medium transition-all"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {article.content}
                            </div>

                            {/* Footer */}
                            <footer className="pt-12 border-t border-white/5 mt-16 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-accent-main rounded-2xl flex items-center justify-center font-black text-white">
                                        {getInitials(article.author)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-accent-main uppercase tracking-widest">Author</p>
                                        <p className="text-lg font-black text-white tracking-tight">{article.author}</p>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </article>
                </div >
            </main >
        </div>
    );
};

export default ArticleView;