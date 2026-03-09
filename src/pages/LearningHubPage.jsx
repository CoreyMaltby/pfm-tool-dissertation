/** Article Component
 * Renders the article based on the ID passed in the URL
 */

import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Share2, Bookmark } from 'lucide-react';

import { articles_data } from "../constants/articles";

const ArticleView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find Article by ID
    const article = articles_data.find((article) => article.id === parseInt(id));

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
                        <div className="text-white text-6xl uppercase tracking-tighter">
                            {article.category} {/* TODO: Replace with image */}
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
                                {article.initials} {/* TODO: Replace with logic which gets this from authors name */}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{article.author}</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </main>

    );
};

export default ArticleView;