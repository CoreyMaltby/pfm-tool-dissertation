/** Learninghub Component 
* Provides articles and guides to improve financial literacy
* Gets the articles from the database and displays them in a card format. 
* Users can filter by category and search for specific topics.
*/

import React, { useState, useEffect } from "react";
import { Clock, ChevronRight, Search, Filter, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { articles_data, categories } from "../constants/articles";

const LearningHub = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Page number state
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const filteredArticles = articles_data.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Page Number Logic
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 px-6 md:px-12 animate-in fade-in duration-500">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="space-y-6 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Learning Hub</h1>
                        <p className="text-white text-sm md:text-lg max-w-xl mx-auto font-medium">
                            Bridge the literacy gap and master your financial future with expert-led guides.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-lg mx-auto group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-main transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-background-secondary border border-white/5 rounded-[1.5rem] focus:ring-4 focus:ring-accent-main/10 focus:border-accent-main/40 transition-all text-white outline-none"
                        />
                    </div>
                </header>

                {/* Category Filters */}
                <div className="flex flex-col items-center gap-6 mb-12">
                    <div className="flex items-center gap-2 text-white/80 text-[14px] font-black uppercase tracking-[0.2em]">
                        <Filter size={14} className="text-accent-main" /> Filter by Category
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeCategory === category
                                        ? "bg-white border-white/10 text-text-secondary scale-105"
                                        : "bg-background-secondary border-background-secondary/10 text-white/50 hover:text-white hover:border-white/40 hover:scale-105"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Articles */}
                <div className="bg-background-secondary rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {currentArticles.length > 0 ? (
                            currentArticles.map((article) => (
                                <div key={article.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <div className="p-8 md:p-12 space-y-6">

                                        {/* Metadata Row */}
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-accent-main rounded-xl flex items-center justify-center text-white font-black text-xs">
                                                    {getInitials(article.author)}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-white font-bold text-sm">{article.author}</p>
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{article.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-accent-secondary/5 px-3 py-3 rounded-lg border border-white/5 text-[12px] font-white uppercase tracking-widest text-white">
                                                <Clock size={14} className="text-white" />
                                                <span>{article.readTime} read</span>
                                            </div>
                                        </div>

                                        {/* Content Block */}
                                        <div className="space-y-3">
                                            <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-accent-main transition-colors leading-tight tracking-tight">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl line-clamp-2 font-medium">
                                                {article.description}
                                            </p>
                                        </div>

                                        {/* Action Link */}
                                        <div className="pt-4">
                                            <Link
                                                to={`/learning-hub/${article.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent-main hover:text-white transition-all group/btn"
                                            >
                                                Read Full Article
                                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-32 text-center">
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No matching articles found</p>
                            </div>
                        )}
                    </div>

                    {/* Page numbers */}
                    {totalPages > 1 && (
                        <div className="p-8 border-t border-white/5 bg-black/20 flex items-center justify-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:text-accent-main transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1
                                            ? "bg-accent-main text-white"
                                            : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:text-accent-main transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default LearningHub;