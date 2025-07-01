import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
      {title}
    </h1>
    <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed">
      {subtitle}
    </p>
  </div>
);
