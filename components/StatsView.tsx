
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { Habit } from '../types';

interface StatsViewProps {
  habits: Habit[];
}

const StatsView: React.FC<StatsViewProps> = ({ habits }) => {
  const data = habits.map(h => ({
    name: h.name.length > 10 ? h.name.substring(0, 10) + '...' : h.name,
    completions: h.completedDates.length,
    color: h.color
  }));

  if (habits.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-500 text-center font-medium">Adicione hábitos para ver suas métricas de desempenho!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Consistência de Hábitos
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={10} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              fontSize={10} 
              axisLine={false} 
              tickLine={false} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}
              itemStyle={{ fontWeight: '600', color: '#6366f1' }}
            />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="#6366f1" 
              strokeWidth={4}
              dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: '#4f46e5', strokeWidth: 0 }}
              name="Conclusões Totais"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Maior Sequência</p>
          <p className="text-2xl font-black text-emerald-700">
            {Math.max(...habits.map(h => h.streak), 0)} <span className="text-sm font-bold opacity-70">dias</span>
          </p>
        </div>
        <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Hábitos Ativos</p>
          <p className="text-2xl font-black text-indigo-700">{habits.length}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
