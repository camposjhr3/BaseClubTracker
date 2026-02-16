
export type DayOfWeek = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';

export enum HabitCategory {
  HEALTH = 'Saúde',
  PRODUCTIVITY = 'Produtividade',
  MINDFULNESS = 'Mente',
  FITNESS = 'Fitness',
  LEARNING = 'Estudos',
  SOCIAL = 'Social',
  OTHER = 'Outros'
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: string[];
  streak: number;
  lastCompleted?: string; // ISO Date
  color: string;
  createdAt: string;
  completedDates: string[]; // Lista de YYYY-MM-DD
  reminderTime?: string; // Formato HH:mm
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface AppState {
  habits: Habit[];
  tasks: Task[];
  user: User | null;
}
