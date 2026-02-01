'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface PulseCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: number;
    icon: React.ElementType;
    color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan';
    loading?: boolean;
}

export const PulseCard = ({ title, value, subValue, trend, icon: Icon, color = 'indigo', loading }: PulseCardProps) => {
    const colors = {
        indigo: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5 glow-indigo-500',
        emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 glow-emerald-500',
        rose: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20 shadow-rose-500/5 glow-rose-500',
        amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20 shadow-amber-500/5 glow-amber-500',
        cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5 glow-cyan-500',
    };

    const selectedColor = colors[color];

    return (
        <div className={`relative group overflow-hidden bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-slate-700`}>
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} blur-[60px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 animate-pulse`}></div>

            <div className="relative flex items-start justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${selectedColor.split(' ')[2]} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</span>
                    </div>

                    <div className="space-y-1">
                        {loading ? (
                            <div className="h-10 w-32 bg-slate-900 animate-pulse rounded-lg"></div>
                        ) : (
                            <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
                        )}
                        {subValue && <p className="text-xs font-bold text-slate-500 tracking-wide">{subValue}</p>}
                    </div>

                    {!loading && trend !== undefined && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${trend >= 0 ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-rose-400 bg-rose-500/5 border-rose-500/10'
                            }`}>
                            {trend >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                            {Math.abs(trend)}% GROWTH
                        </div>
                    )}
                </div>

                {/* Decorative Element */}
                <div className="flex flex-col gap-1 items-end opacity-20 group-hover:opacity-40 transition-opacity">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 rounded-full bg-indigo-500`} style={{ width: `${i * 8}px` }}></div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .glow-indigo-500 { box-shadow: 0 0 20px -5px rgba(99, 102, 241, 0.1); }
        .glow-emerald-500 { box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.1); }
        .glow-rose-500 { box-shadow: 0 0 20px -5px rgba(244, 63, 94, 0.1); }
        .glow-amber-500 { box-shadow: 0 0 20px -5px rgba(245, 158, 11, 0.1); }
        .glow-cyan-500 { box-shadow: 0 0 20px -5px rgba(6, 182, 212, 0.1); }
      `}</style>
        </div>
    );
};

export const GlassContainer = ({ children, title, subtitle, className = '', headerAction }: { children: React.ReactNode; title?: string; subtitle?: string; className?: string; headerAction?: React.ReactNode }) => (
    <div className={`relative bg-slate-950/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group ${className}`}>
        {/* Header Shine */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

        {(title || headerAction) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    {title && <h3 className="text-2xl font-black text-white tracking-tight underline decoration-indigo-500/30 decoration-4 underline-offset-8">{title}</h3>}
                    {subtitle && <p className="text-xs font-bold text-slate-500 mt-3 tracking-widest uppercase">{subtitle}</p>}
                </div>
                {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
            </div>
        )}

        <div className="relative z-10">{children}</div>

        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
    </div>
);

export const NeonBadge = ({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) => {
    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        slate: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    };

    const selectedStyle = colorMap[color] || colorMap.indigo;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-[0.15em] uppercase border ${selectedStyle} shadow-lg`}>
            {children}
        </span>
    );
};

export const CommandButton = ({ children, onClick, variant = 'primary', icon: Icon, loading, className = '' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: React.ElementType; loading?: boolean; className?: string }) => {
    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500/50 shadow-indigo-600/20 ring-1 ring-indigo-400/30',
        secondary: 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-slate-700/50 shadow-black/20 ring-1 ring-white/5',
        danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 shadow-red-500/10 ring-1 ring-red-400/20',
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`group relative flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />}
                    <span>{children}</span>
                </>
            )}

            {/* Glow Effect on Hover */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 blur group-hover:opacity-30 transition-opacity pointer-events-none bg-current`}></div>
        </button>
    );
};

export const TerminalText = ({ children, color = 'emerald' }: { children: React.ReactNode; color?: string }) => {
    const colorMap: Record<string, string> = {
        indigo: 'text-indigo-400 bg-indigo-400/5 border-indigo-400/20',
        emerald: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20',
        rose: 'text-rose-400 bg-rose-400/5 border-rose-400/20',
        amber: 'text-amber-400 bg-amber-400/5 border-amber-400/20',
        cyan: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/20',
        slate: 'text-slate-400 bg-slate-400/5 border-slate-400/20',
    };

    const selectedStyle = colorMap[color] || colorMap.emerald;

    return (
        <span className={`font-mono px-1.5 py-0.5 rounded border ${selectedStyle} shadow-lg`}>
            {children}
        </span>
    );
};
