'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  compareEnabled?: boolean;
  onCompareChange?: (enabled: boolean) => void;
  compareRange?: DateRange;
  onCompareRangeChange?: (range: DateRange) => void;
}

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1, offset: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: 'month' as const },
  { label: 'Last month', days: 'lastMonth' as const },
  { label: 'This year', days: 'year' as const },
];

export default function DateRangePicker({
  value,
  onChange,
  compareEnabled = false,
  onCompareChange,
  compareRange,
  onCompareRangeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(value);
  const [tempCompareRange, setTempCompareRange] = useState(compareRange);
  const [showCompare, setShowCompare] = useState(compareEnabled);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPresetRange = (days: number | 'month' | 'lastMonth' | 'year', offset: number = 0): DateRange => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    if (offset > 0) {
      end.setDate(end.getDate() - offset);
    }

    const start = new Date(end);
    
    if (days === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (days === 'lastMonth') {
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0); // Last day of previous month
    } else if (days === 'year') {
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (days === 0) {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(end.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);
      if (offset > 0) {
        start.setDate(start.getDate() - offset);
        end.setDate(end.getDate() - offset);
      }
    }

    return { startDate: start, endDate: end };
  };

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    const range = getPresetRange(preset.days, preset.offset);
    setTempRange(range);
    
    if (showCompare) {
      const daysDiff = Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const compareEnd = new Date(range.startDate);
      compareEnd.setDate(compareEnd.getDate() - 1);
      const compareStart = new Date(compareEnd);
      compareStart.setDate(compareStart.getDate() - daysDiff);
      setTempCompareRange({ startDate: compareStart, endDate: compareEnd });
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    if (showCompare && tempCompareRange && onCompareRangeChange) {
      onCompareRangeChange(tempCompareRange);
    }
    if (onCompareChange) {
      onCompareChange(showCompare);
    }
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    const format = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    return `${format(range.startDate)} - ${format(range.endDate)}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs bg-white"
      >
        <CalendarIcon className="h-4 w-4 text-gray-600" />
        <span className="text-gray-900 font-medium">{formatDateRange(value)}</span>
        {compareEnabled && (
          <span className="text-gray-500 text-[10px]">vs {formatDateRange(compareRange!)}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[600px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 p-4">
          <div className="flex gap-4">
            {/* Presets */}
            <div className="w-40 border-r border-gray-200 pr-4">
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Date Range</h4>
              <div className="space-y-1">
                {PRESET_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-2 py-1.5 text-[10px] text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date inputs and comparison */}
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Custom Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={tempRange.startDate.toISOString().split('T')[0]}
                      onChange={(e) => setTempRange({ ...tempRange, startDate: new Date(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={tempRange.endDate.toISOString().split('T')[0]}
                      onChange={(e) => setTempRange({ ...tempRange, endDate: new Date(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Compare checkbox */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompare}
                    onChange={(e) => setShowCompare(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-xs text-gray-700 font-medium">Compare to previous period</span>
                </label>
              </div>

              {/* Compare range inputs */}
              {showCompare && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-xs font-medium text-blue-900 mb-2">Comparison Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-blue-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={tempCompareRange?.startDate.toISOString().split('T')[0] || ''}
                        onChange={(e) => setTempCompareRange({ 
                          ...tempCompareRange!, 
                          startDate: new Date(e.target.value) 
                        })}
                        className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-blue-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={tempCompareRange?.endDate.toISOString().split('T')[0] || ''}
                        onChange={(e) => setTempCompareRange({ 
                          ...tempCompareRange!, 
                          endDate: new Date(e.target.value) 
                        })}
                        className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded hover:bg-black transition-colors font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

