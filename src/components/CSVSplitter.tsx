import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, ArrowRight } from 'lucide-react';
import { processLargeCSV } from '../utils/csvUtils';

export function CSVSplitter() {
  const [rowsPerFile, setRowsPerFile] = useState<number>(1000);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadFile = (content: string, index: number) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.csv', '')}_part${index + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setStatus('File selected. Click continue to process.');
  };

  const handleContinue = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('Processing CSV file...');
    setProgress(0);

    try {
      const result = await processLargeCSV(
        file,
        rowsPerFile,
        (progress) => {
          setProgress(Math.min(99, progress));
          setStatus(`Processing: ${Math.round(progress)}%`);
        },
        (content, index) => {
          downloadFile(content, index);
          setStatus(`Downloading part ${index + 1}...`);
        }
      );

      setStatus(`Successfully split into ${result.totalFiles} files!`);
      setProgress(100);

      // Reset after completion
      setTimeout(() => {
        setIsProcessing(false);
        setFileName('');
        setStatus('');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
    } catch (err) {
      setError('Error processing the CSV file. Please try again.');
      setStatus('');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div>
          <label 
            htmlFor="rowsPerFile" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rows per file
          </label>
          <input
            type="number"
            id="rowsPerFile"
            min="1"
            value={rowsPerFile}
            onChange={(e) => setRowsPerFile(Math.max(1, parseInt(e.target.value) || 1))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              disabled={isProcessing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              <Upload className="h-5 w-5" />
              Select CSV File
            </button>

            {fileName && !isProcessing && (
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {fileName && (
            <p className="text-sm text-gray-600 text-center">
              Selected file: {fileName}
            </p>
          )}

          {(status || progress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 p-3 rounded-md">
                <div className="relative">
                  {isProcessing && (
                    <div className="absolute inset-0 border-2 border-indigo-600 border-r-transparent rounded-full animate-spin" />
                  )}
                  <div className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium">{status}</p>
              </div>
              
              {progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Enter the desired number of rows per output file</li>
            <li>Select your CSV file using the button above</li>
            <li>Click the Continue button to process your file</li>
            <li>The application will process the file in chunks and download each part</li>
            <li>Each output file will include the header row from the original CSV</li>
          </ol>
        </div>
      </div>
    </div>
  );
}