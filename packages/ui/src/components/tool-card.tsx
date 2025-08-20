'use client';

import React from 'react';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'emerald';
  onClick?: () => void;
}

const colorMap = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  red: 'bg-red-600',
  indigo: 'bg-indigo-600',
  emerald: 'bg-emerald-600',
};

export function ToolCard({
  color,
  description,
  icon,
  onClick,
  title,
}: ToolCardProps) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-10 h-10 ${colorMap[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
