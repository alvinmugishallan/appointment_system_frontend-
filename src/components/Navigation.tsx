import React from 'react';
import { Calendar, Users, DollarSign, BarChart3, Database, Clock, Plus, RotateCcw } from 'lucide-react';
import { useDatabase } from '../database/dbStore';

export type ActiveTab = 'appointments' | 'schedule' | 'patients' | 'billing' | 'reports' | 'database';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBookModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenBookModal,
}) => {
  const { resetToDefault } = useDatabase();

  const handleReset = () => {
    if (window.confirm('Reset the database to initial MySQL seed data? Any new entries will be reverted.')) {
      resetToDefault();
    }
  };

  const navLinks = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'schedule', label: 'Doctor Schedule', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'billing', label: 'Payments & Billing', icon: DollarSign },
    { id: 'reports', label: 'Revenue Reports', icon: BarChart3 },
    { id: 'database', label: 'SQL Explorer', icon: Database },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark (Single element) */}
          <button
            onClick={() => setActiveTab('appointments')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              +
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                MetroCare Health
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 font-normal ml-2">
                Hospital System
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (single line, unboxed, hover underline/color) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleReset}
              title="Reset Database to initial SQL seeds"
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset SQL</span>
            </button>
            <button
              onClick={onOpenBookModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 text-xs no-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
