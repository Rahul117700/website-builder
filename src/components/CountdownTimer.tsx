'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string;
    theme?: 'light' | 'dark';
}

export default function CountdownTimer({ targetDate, theme = 'light' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${theme === 'light' ? 'bg-white/90 text-gray-900 border border-gray-100' : 'bg-gray-800 text-white border border-gray-700'} shadow-sm min-w-[60px]`}>
            <span className="text-xl font-bold tabular-nums leading-none mb-1">
                {value.toString().padStart(2, '0')}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );

    if (!targetDate) return null;

    return (
        <div className="flex items-center gap-2">
            <TimeBox value={timeLeft.days} label="Days" />
            <span className="text-2xl font-bold text-gray-300 -mt-4">:</span>
            <TimeBox value={timeLeft.hours} label="Hrs" />
            <span className="text-2xl font-bold text-gray-300 -mt-4">:</span>
            <TimeBox value={timeLeft.minutes} label="Mins" />
            <span className="text-2xl font-bold text-gray-300 -mt-4">:</span>
            <TimeBox value={timeLeft.seconds} label="Secs" />
        </div>
    );
}
