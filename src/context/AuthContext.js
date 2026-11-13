import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const entrar = async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) throw error;
  };

  // Cadastro de funcionário (Supabase Auth). Se "Confirm email" estiver ligado no
  // Supabase, a sessão só nasce depois do clique no link do e-mail.
  const cadastrar = async (email, senha) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
    if (error) throw error;
    return { precisaConfirmar: !data.session };
  };

  const sair = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, carregando, entrar, cadastrar, sair }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
