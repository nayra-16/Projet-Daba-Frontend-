
import React from 'react';
import { Lot, WorkflowStep } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkflowTimelineProps {
  lot: Lot;
  steps: WorkflowStep[];
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ lot, steps }) => {
  const currentStepIndex = steps.findIndex(step => step.id === lot.status);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">Suivi du workflow</h3>
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white transition-all',
                  isCompleted ? 'bg-brand-green' :
                  isCurrent ? step.color :
                  'bg-gray-200'
                )}>
                  {isCompleted ? <CheckCircle size={20} /> : <span>{step.icon}</span>}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-0.5 h-10 mt-2',
                    isCompleted ? 'bg-brand-green' : 'bg-gray-200'
                  )} />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-bold',
                    isCompleted ? 'text-brand-green' :
                    isCurrent ? 'text-brand-text' :
                    'text-gray-400'
                  )}>{step.label}</span>
                  {isCurrent && <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">En cours</span>}
                  {isCompleted && <span className="text-xs text-gray-500">Terminé</span>}
                </div>
                <p className={cn('text-sm mt-1', isFuture ? 'text-gray-400' : 'text-gray-600')}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
