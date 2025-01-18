// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/compare-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address1, address2 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: data.match ? "Addresses Match!" : "Addresses Don't Match",
        description: data.reasoning,
        variant: data.match ? "default" : "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to compare addresses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Address Comparison Tool
      </h1>

      <form onSubmit={handleCompare} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="address1" className="block text-sm font-medium mb-1">
              Address 1
            </label>
            <input
              id="address1"
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter first address"
              required
            />
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium mb-1">
              Address 2
            </label>
            <input
              id="address2"
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter second address"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${loading 
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Comparing...' : 'Compare Addresses'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Match:</span>
              <span className={result.match ? 'text-green-600' : 'text-red-600'}>
                {result.match ? 'Yes' : 'No'}
              </span>
            </div>

            <div>
              <span className="font-medium">Confidence:</span>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="font-medium">Reasoning:</span>
              <p className="mt-1 text-gray-700">{result.reasoning}</p>
            </div>

            {result.metrics && (
              <div>
                <span className="font-medium">Detailed Metrics:</span>
                <div className="mt-2 space-y-2">
                  {Object.entries(result.metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="ml-2 flex-1">
                        <div className="bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}