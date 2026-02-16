
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulação de delay de rede do OAuth do Google
    setTimeout(() => {
      const mockUser: User = {
        id: 'google-123',
        name: 'Usuário Base',
        email: 'contato@dicasdabase.com',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1efe7] px-8">
      {/* Tipografia Minimalista BASE */}
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-7xl font-serif tracking-[0.3em] text-[#1b4376] font-medium transition-all duration-700 hover:tracking-[0.4em] cursor-default select-none">
          BASE
        </h2>
        <div className="w-12 h-0.5 bg-[#1b4376] mt-4 opacity-20"></div>
      </div>

      <h1 className="text-3xl font-black text-slate-900 text-center mb-4 leading-tight">
        Domine sua rotina
      </h1>
      <p className="text-slate-500 text-center mb-12 font-medium max-w-[280px]">
        Junte-se a milhares de pessoas que estão construindo bases sólidas para o sucesso.
      </p>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full max-w-xs flex items-center justify-center space-x-4 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 py-4 px-6 rounded-3xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-[#1B4376] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg viewBox="0 0 48 48" className="w-6 h-6">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className="font-bold text-slate-700">Entrar com Google</span>
          </>
        )}
      </button>

      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">Ao entrar, você concorda com nossos</p>
        <div className="flex space-x-2 mt-1 justify-center">
          <button className="text-xs text-indigo-500 font-bold hover:underline">Termos</button>
          <span className="text-slate-300">•</span>
          <button className="text-xs text-indigo-500 font-bold hover:underline">Privacidade</button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
