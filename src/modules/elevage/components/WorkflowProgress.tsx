
import React from 'react';
import { Lot, WorkflowStep } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkflowProgressProps {
  lot: Lot;
  steps: WorkflowStep[];
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ lot, steps }) => {
  const currentStepIndex = steps.findIndex(step => step.id === lot.status);
  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-text">Progression</h3>
        <span className="text-2xl font-bold text-brand-green">{progress}%</span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-green rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
