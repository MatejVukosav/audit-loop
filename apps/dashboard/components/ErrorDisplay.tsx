import React from "react";

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <div className="bg-red-500/95 backdrop-blur-sm text-white p-6 rounded-2xl mb-8 border border-red-400/30 shadow-xl">
    <div className="flex items-center">
      <span className="text-2xl mr-3">⚠️</span>
      <div>
        <h3 className="text-lg font-semibold mb-1">Error</h3>
        <p className="text-red-100">{error}</p>
      </div>
    </div>
  </div>
);
