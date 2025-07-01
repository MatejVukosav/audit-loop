import React from "react";

interface MetricCardProps {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  status: string;
  gradientColors: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  subtitle,
  value,
  status,
  gradientColors,
}) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-3xl hover:bg-white/98">
    <div className="flex items-center mb-6">
      <div
        className="rounded-2xl w-16 h-16 flex items-center justify-center mr-5 shadow-lg"
        style={{ background: gradientColors }}
      >
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
      </div>
    </div>
    <div className="text-5xl font-bold text-gray-800 mb-3 tracking-tight">
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600 bg-gray-50 rounded-full px-4 py-2 inline-block">
      {status}
    </div>
  </div>
);
