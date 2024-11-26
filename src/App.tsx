import React, { useState } from 'react';
import { Upload, FileDown, AlertCircle } from 'lucide-react';
import { CSVSplitter } from './components/CSVSplitter';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <CSVSplitter />
        </div>
      </main>
    </div>
  );
}

export default App;