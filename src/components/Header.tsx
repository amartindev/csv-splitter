import React from 'react';
import { FileDown } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <FileDown className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">Antonio CSV Splitter</h1>
        </div>
      </div>
    </header>
  );
}