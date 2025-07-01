import React from "react";

export const LoadingState: React.FC = () => (
  <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-16 text-center shadow-2xl border border-white/30">
    <div className="text-6xl mb-6 animate-pulse">⏳</div>
    <h3 className="text-2xl font-semibold text-gray-700 mb-3">
      Loading metrics...
    </h3>
    <p className="text-lg text-gray-500 font-medium">
      Fetching real-time data from your workspace
    </p>
  </div>
);
