/** Learninghub Component 
* Provides articles and guides to improve financial literacy
* Gets the articles from the database and displays them in a card format. 
* Users can filter by category and search for specific topics.
*/

import React, { useState } from "react";
import { Clock, ChevronRight, Search } from 'lucide-react';
import { Link } from "react-router-dom";

import { articles_data, categories } from "../constants/articles";



const LearningHub = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = articles_data.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="w-full bg-background-tertiary min-h-screen py-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-text-tertiary">Learning Hub</h1>
                    <p className="text-text-tertiary/90 text-sm md:text-base max-w-xl mx-auto">
                        Bridge the literacy gap and master your understandings with these guides.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto pt-4">
                        <Search className="absolute left-4 top-[calc(50%+8px)] -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl focus:ring-2 focus:ring-background-secondary/20 transition-all text-sm shadow-sm"
                        />
                    </div>
                </header>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${activeCategory === category
                                ? "bg-background-secondary border-background-secondary text-white shadow-md"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Articles */}
                <div className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    <div className="divide-y divide-gray-700">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                                <div key={article.id} className="p-6 md:p-8 hover:bg-white/5 transition-colors group">
                                    <div className="space-y-4">

                                        {/*Title, Author Category, and Read Time */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-accent-main transition-colors">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                                <div className="w-7 h-7 bg-accent-main rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
                                                    {article.initials} // TODO: Replace with logic which gets this from authors name
                                                </div>
                                                <span className="text-gray-300 normal-case tracking-normal text-xs font-semibold">
                                                    {article.author}
                                                </span>
                                                <span className="text-accent-main bg-accent-main/10 px-2 py-0.5 rounded">
                                                    {article.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Clock size={12} />
                                                    <span>{article.readTime} read</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/*Description */}
                                        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                                            {article.description}
                                        </p>

                                        {/* Article Link */}
                                        <div className="pt-2">
                                            <Link to={`/learning-hub/${article.id}`} className="flex items-center gap-1 text-xs font-black uppercase-tighter text-accent-main hover:text-white transition-colors">
                                                Read Full Article <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center text-gray-400">
                                No articles found. Try adjusting your filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LearningHub;