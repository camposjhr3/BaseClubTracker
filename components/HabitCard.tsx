
import React from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md group">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => onToggle(habit.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isCompletedToday 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-2 border-dashed border-slate-200'
          }`}
        >
          {isCompletedToday ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-[10px] font-black tracking-tighter">FEITO</span>
          )}
        </button>
        <div>
          <h3 className="font-semibold text-slate-800 leading-tight">{habit.name}</h3>
          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
            <span className={`px-2 py-0.5 text-[10px] rounded-full text-white font-bold`} style={{ backgroundColor: habit.color }}>
              {habit.category}
            </span>
            <span className="text-[10px] text-slate-400 font-bold flex items-center">
              🔥 {habit.streak} dias
            </span>
            {habit.reminderTime && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {habit.reminderTime}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => onEdit(habit)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-500 transition-all p-2"
          title="Editar Alarme"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-2"
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
