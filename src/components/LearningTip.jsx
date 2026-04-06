import React, { useMemo } from 'react';
import { Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { articles_data } from '../constants/articles';

const LearningTip = () => {
    const dailyTip = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % articles_data.length;
        return articles_data[index];
    }, []);

    return (
        <div className="bg-background-secondary rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:border-accent-main/20 transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-main/5 blur-[100px] rounded-full group-hover:bg-accent-main/10 transition-colors" />

            <div className="flex-shrink-0 w-16 h-16 bg-accent-main/10 rounded-2xl flex items-center justify-center text-accent-main shadow-inner">
                <Lightbulb size={32} />
            </div>

            <div className="flex-1 space-y-2 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-main bg-accent-main/10 px-3 py-1 rounded-md">
                        Daily Insight: {dailyTip.category}
                    </span>
                </div>
                <h3 className="text-xl font-black text-white">{dailyTip.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-2xl">
                    {dailyTip.description}
                </p>
            </div>

            <div className="flex-shrink-0 z-10">
                <Link
                    to={`/learning-hub/${dailyTip.id}`}
                    className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/5 hover:border-white/20 group"
                >
                    Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default LearningTip;