
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Habit, Task, HabitCategory, DayOfWeek, User } from './types';
import HabitCard from './components/HabitCard';
import StatsView from './components/StatsView';
import AuthScreen from './components/AuthScreen';
import { getAICoachAdvice } from './services/geminiService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.HEALTH);
  const [newHabitReminderTime, setNewHabitReminderTime] = useState<string>('');
  const [editReminderTime, setEditReminderTime] = useState<string>('');
  
  const [aiAdvice, setAiAdvice] = useState<string>('Construindo sua base...');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'stats'>('habits');

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('basetracker_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthLoading(false);
  }, []);

  // Persistence - User dependent
  useEffect(() => {
    if (user) {
      const savedHabits = localStorage.getItem(`basetracker_habits_${user.email}`);
      const savedTasks = localStorage.getItem(`basetracker_tasks_${user.email}`);
      setHabits(savedHabits ? JSON.parse(savedHabits) : []);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      localStorage.setItem('basetracker_current_user', JSON.stringify(user));
    } else {
      setHabits([]);
      setTasks([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`basetracker_habits_${user.email}`, JSON.stringify(habits));
      localStorage.setItem(`basetracker_tasks_${user.email}`, JSON.stringify(tasks));
    }
  }, [habits, tasks, user]);

  // Basic Alarm Logic - Check every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
          console.log(`ALERTA: Hora de ${habit.name}!`);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [habits]);

  // AI Coaching
  const refreshCoach = useCallback(async () => {
    if (!user) return;
    setIsAiLoading(true);
    const advice = await getAICoachAdvice(habits, tasks);
    setAiAdvice(advice || "Sua disciplina é sua maior aliada.");
    setIsAiLoading(false);
  }, [habits, tasks, user]);

  useEffect(() => {
    if (user && habits.length > 0) {
      refreshCoach();
    } else if (user) {
      setAiAdvice("Comece sua jornada adicionando seu primeiro hábito! Sua base sólida começa agora.");
    }
  }, [habits.length, user]);

  // Handlers
  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsProfileOpen(false);
    localStorage.removeItem('basetracker_current_user');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, photo: base64String };
        setUser(updatedUser);
        localStorage.setItem('basetracker_current_user', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const alreadyDoneToday = h.completedDates.includes(today);
        let newCompletedDates = [...h.completedDates];
        let newStreak = h.streak;

        if (alreadyDoneToday) {
          newCompletedDates = newCompletedDates.filter(d => d !== today);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          newCompletedDates.push(today);
          newStreak += 1;
        }

        return { ...h, completedDates: newCompletedDates, streak: newStreak, lastCompleted: today };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setEditReminderTime(habit.reminderTime || '');
  };

  const saveReminderTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHabit) {
      setHabits(prev => prev.map(h => 
        h.id === editingHabit.id 
          ? { ...h, reminderTime: editReminderTime || undefined } 
          : h
      ));
      setEditingHabit(null);
      setEditReminderTime('');
    }
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const colors = {
      [HabitCategory.HEALTH]: '#ef4444',
      [HabitCategory.PRODUCTIVITY]: '#3b82f6',
      [HabitCategory.MINDFULNESS]: '#8b5cf6',
      [HabitCategory.FITNESS]: '#10b981',
      [HabitCategory.LEARNING]: '#f59e0b',
      [HabitCategory.SOCIAL]: '#ec4899',
      [HabitCategory.OTHER]: '#64748b'
    };

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName,
      category: newHabitCategory,
      frequency: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      streak: 0,
      color: colors[newHabitCategory],
      createdAt: new Date().toISOString(),
      completedDates: [],
      reminderTime: newHabitReminderTime || undefined
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setNewHabitReminderTime('');
    setIsAddingHabit(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-24 shadow-2xl relative">
      {/* Header */}
      <header className="p-8 pt-12 pb-6 bg-white rounded-b-[40px] shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            {user.photo && (
              <img 
                src={user.photo} 
                alt={user.name} 
                className="w-12 h-12 rounded-2xl border-2 border-indigo-100 shadow-lg cursor-pointer hover:scale-105 transition-transform object-cover"
                onClick={() => setIsProfileOpen(true)}
                title="Abrir perfil"
              />
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{getGreeting()}, {user.name.split(' ')[0]}!</h1>
              <p className="text-slate-400 text-xs font-medium">Pronto para atingir suas metas?</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingHabit(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* AI Coach Snippet */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 relative overflow-hidden group cursor-pointer" onClick={refreshCoach}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Dicas da Base</span>
          </div>
          <p className="text-slate-700 text-sm italic font-medium leading-relaxed">
            {isAiLoading ? "Processando seu progresso..." : `"${aiAdvice}"`}
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-8 mt-6 flex space-x-8">
        <button 
          onClick={() => setActiveTab('habits')}
          className={`pb-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'habits' ? 'text-slate-900 border-indigo-600' : 'text-slate-400 border-transparent'}`}
        >
          Hábitos Diários
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`pb-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'stats' ? 'text-slate-900 border-indigo-600' : 'text-slate-400 border-transparent'}`}
        >
          Análises
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-8 pt-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'habits' ? (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium italic">Sua base está esperando... <br/>Adicione o primeiro hábito!</p>
              </div>
            ) : (
              habits.map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onToggle={toggleHabit} 
                  onDelete={deleteHabit}
                  onEdit={startEditing}
                />
              ))
            )}
          </div>
        ) : (
          <StatsView habits={habits} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 p-4 flex justify-around items-center z-10 shadow-xl rounded-t-3xl">
        <button className="flex flex-col items-center text-indigo-600 transition-transform active:scale-90" onClick={() => setActiveTab('habits')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeTab === 'habits' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold mt-1">Início</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 transition-transform active:scale-90" onClick={() => setActiveTab('stats')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeTab === 'stats' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <span className="text-[10px] font-bold mt-1">Evolução</span>
        </button>
      </nav>

      {/* Modal de Perfil */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Seu Perfil</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-50 shadow-xl"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              <div className="text-center">
                <p className="text-xl font-black text-slate-800">{user.name}</p>
                <p className="text-slate-400 font-medium text-sm">{user.email}</p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-3xl shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  Continuar Evoluindo
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-rose-50 text-rose-600 font-bold py-4 rounded-3xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Alarme */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900 mb-6">Editar Alarme</h2>
            <p className="text-sm text-slate-500 mb-4 font-medium">Hábito: <span className="text-indigo-600">{editingHabit.name}</span></p>
            <form onSubmit={saveReminderTime}>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Novo Horário</label>
                  <input 
                    type="time" 
                    value={editReminderTime}
                    onChange={(e) => setEditReminderTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold text-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setEditingHabit(null)}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Hábito */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Novo Hábito</h2>
              <button onClick={() => setIsAddingHabit(false)} className="text-slate-400 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={addHabit}>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Qual é o hábito?</label>
                  <input 
                    type="text" 
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="ex: Ler 20 páginas"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Alarme</label>
                    <input 
                      type="time" 
                      value={newHabitReminderTime}
                      onChange={(e) => setNewHabitReminderTime(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                     <p className="text-[10px] text-slate-400 font-medium italic mb-2">Opcional: Receba um aviso no horário definido.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Categoria</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(HabitCategory).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewHabitCategory(cat)}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                          newHabitCategory === cat 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
                >
                  Criar Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
