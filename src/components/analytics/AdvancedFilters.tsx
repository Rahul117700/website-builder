'use client';

import { useState, useRef, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: Filter[]) => void;
}

const FILTER_FIELDS = [
  { value: 'channel', label: 'Channel Name' },
  { value: 'product', label: 'Product Name' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'visitors', label: 'Visitors' },
  { value: 'conversionRate', label: 'Conversion Rate' },
  { value: 'country', label: 'Country' },
  { value: 'device', label: 'Device Type' },
];

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'between', label: 'Between' },
  ],
};

export default function AdvancedFilters({ onApplyFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([
    { id: '1', field: 'channel', operator: 'contains', value: '' },
  ]);
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

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: Date.now().toString(), field: 'channel', operator: 'contains', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof Filter, value: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const handleApply = () => {
    const validFilters = filters.filter((f) => f.value.trim() !== '');
    onApplyFilters(validFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters([{ id: '1', field: 'channel', operator: 'contains', value: '' }]);
    onApplyFilters([]);
    setIsOpen(false);
  };

  const activeFilterCount = filters.filter((f) => f.value.trim() !== '').length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs bg-white"
      >
        <FunnelIcon className="h-4 w-4 text-gray-600" />
        <span className="text-gray-900 font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-gray-900 text-white rounded-full text-[10px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[500px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    >
                      {FILTER_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    >
                      {(['revenue', 'visitors', 'conversionRate'].includes(filter.field)
                        ? OPERATORS.number
                        : OPERATORS.text
                      ).map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    placeholder="Enter value..."
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400"
                  />
                </div>

                {filters.length > 1 && (
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addFilter}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-700 font-medium mb-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Filter</span>
          </button>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded hover:bg-black transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

