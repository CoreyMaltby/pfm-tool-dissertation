import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { articles_data } from '../constants/articles';

const ContextualTip = ({ category }) => {
    const { showContextualTips } = useSettingsStore();

    const [article] = useState(() => {
        const targetCategories = Array.isArray(category) ? category : [category];
        const filtered = articles_data.filter(a => targetCategories.includes(a.category));

        if (filtered.length === 0) return null;
        return filtered[Math.floor(Math.random() * filtered.length)];
    });

    if (!showContextualTips) return null;

    return (
        <div className="group relative bg-background-secondary border border-white/5 rounded-2xl p-5 shadow-xl overflow-hidden transition-all hover:border-accent-main/30 flex flex-col md:flex-row items-center gap-6">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-main shadow-[2px_0_10px_rgba(34,197,94,0.2)]" />

            <div className="flex-shrink-0 w-12 h-12 bg-accent-main/10 rounded-xl flex items-center justify-center text-accent-main shadow-inner">
                <Sparkles size={18} />
            </div>

            <div className="flex-1 min-w-0 space-y-1 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-accent-main bg-accent-main/5 px-2 py-0.5 rounded">
                        Smart Insight: {article.category}
                    </span>
                </div>
                <h4 className="text-base font-black text-white tracking-tight">{article.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed max-w-2xl font-medium line-clamp-2 md:line-clamp-none">
                    {article.description}
                </p>
            </div>

            <div className="flex-shrink-0 z-10">
                <Link
                    to={`/learning-hub/${article.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all border border-white/5 hover:border-accent-main hover:text-black group"
                >
                    Read More <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default ContextualTip;