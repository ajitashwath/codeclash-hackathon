import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface CounterProps {
  label: string;
  decrementTitle: string;
  initialValue?: number;
}

export function Counter({ label, decrementTitle, initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
      <div className="flex items-center gap-4">
        <button
          title={decrementTitle}
          onClick={() => setCount(prev => prev - 1)}
          className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
          aria-label="Decrease"
        >
          <Minus className="w-5 h-5 text-red-600" />
        </button>
        <span className="text-3xl font-bold min-w-[3ch] text-center">{count}</span>
        <button
          onClick={() => setCount(prev => prev + 1)}
          className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
          aria-label="Increase"
        >
          <Plus className="w-5 h-5 text-green-600" />
        </button>
      </div>
    </div>
  );
}