import React, { useEffect, useState, useMemo } from 'react';
import { Flame, Trophy, Crown, Gem, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';

const StreakWidget = ({ userId }) => {
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStreak = async () => {
            const val = await dataService.getSavingsStreak(userId);
            setStreak(val);
            setLoading(false);
        };
        if (userId) loadStreak();
    }, [userId]);

    const tier = useMemo(() => {
        if (streak >= 28) return {
            name: "Diamond",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "group-hover:border-cyan-500/30",
            glow: "bg-cyan-500/10",
            icon: <Gem size={32} />,
            progress: "bg-cyan-400"
        };
        if (streak >= 21) return {
            name: "Gold",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "group-hover:border-yellow-500/30",
            glow: "bg-yellow-500/10",
            icon: <Crown size={32} />,
            progress: "bg-yellow-400"
        };
        if (streak >= 14) return {
            name: "Silver",
            color: "text-slate-300",
            bg: "bg-slate-400/10",
            border: "group-hover:border-slate-400/30",
            glow: "bg-slate-400/10",
            icon: <Trophy size={32} />,
            progress: "bg-slate-300"
        };
        if (streak >= 7) return {
            name: "Bronze",
            color: "text-amber-600",
            bg: "bg-amber-700/10",
            border: "group-hover:border-amber-700/30",
            glow: "bg-amber-700/10",
            icon: <Trophy size={32} />,
            progress: "bg-amber-600"
        };
        return {
            name: "Starter",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "group-hover:border-orange-500/30",
            glow: "bg-orange-500/10",
            icon: <Flame size={32} fill={streak > 0 ? "currentColor" : "none"} />,
            progress: "bg-orange-500"
        };
    }, [streak]);

    if (loading) return (
        <div className="bg-background-secondary rounded-[2.5rem] p-8 border border-white/5 flex items-center justify-center min-h-[160px] animate-pulse">
            <Loader2 className="animate-spin text-accent-main" size={24} />
        </div>
    );

    return (
        <div className={`bg-background-secondary rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center gap-6 relative overflow-hidden group ${tier.border} transition-all duration-700`}>
            <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[100px] rounded-full transition-all duration-1000 ${tier.glow}`} />

            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-inner z-10 ${tier.bg} ${tier.color}`}>
                {tier.icon}
            </div>

            <div className="flex-1 space-y-1.5 z-10 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md transition-colors duration-700 ${tier.bg} ${tier.color}`}>
                        {tier.name} Streak
                    </span>
                </div>

                <h3 className="text-lg font-black text-white leading-tight">
                    {streak > 0 ? `${streak} Day Win Streak` : "Begin Your Journey"}
                </h3>

                <p className="text-gray-400 text-xs font-medium leading-relaxed">
                    {streak > 0
                        ? `You have maintained your spending limit for ${streak} days.`
                        : "Stay under your daily limit to unlock the Bronze milestone."}
                </p>

                {/* Progress Bar */}
                <div className="pt-1 max-w-[180px] mx-auto lg:mx-0">
                    <div className="flex justify-between text-[8px] font-bold uppercase text-gray-500 mb-1">
                        <span>Tier Progress</span>
                        <span>{streak % 7}/7 Days</span>
                    </div>
                    <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-1000 ${tier.progress} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                            style={{ width: `${Math.min(((streak % 7) || (streak > 0 ? 7 : 0)) / 7 * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreakWidget;