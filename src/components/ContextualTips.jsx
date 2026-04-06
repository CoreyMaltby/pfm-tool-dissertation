import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

const ContextualTip = ({ title, message, articleId }) => {
    const { showContextualTips } = useSettingsStore();

    if (!showContextualTips) return null;

    return (
        <div className="bg-accent-main/5 border border-accent-main/20 rounded-2xl p-4 mb-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="mt-1 text-accent-main">
                <HelpCircle size={18} />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-white text-xs font-black uppercase tracking-wider">{title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{message}</p>
                <Link
                    to={`/learning-hub/${articleId}`}
                    className="inline-flex items-center gap-1 text-accent-main text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors pt-1"
                >
                    View Guide <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
};

export default ContextualTip;