import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ChatContext {
  religion: string;
  need: string;
  mood: string;
  topic: string;
  philosophy: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  loading: boolean;
  chatContext: ChatContext;
  setChatContext: React.Dispatch<React.SetStateAction<ChatContext>>;
  questionsRemaining: number;
  setQuestionsRemaining: (n: number) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsRemaining, setQuestionsRemaining] = useState(10);
  const [chatContext, setChatContext] = useState<ChatContext>({
    religion: '',
    need: '',
    mood: '',
    topic: '',
    philosophy: '',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);
      if (!newUser) {
        // Reset on logout
        setChatContext({ religion: '', need: '', mood: '', topic: '', philosophy: '' });
        setQuestionsRemaining(10);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('questions_used, questions_limit, preferred_language, preferred_religion')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setQuestionsRemaining(data.questions_limit - data.questions_used);
            if (data.preferred_language) setLanguage(data.preferred_language as Language);
            if (data.preferred_religion) setChatContext(prev => ({ ...prev, religion: data.preferred_religion! }));
          }
        });
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ language, setLanguage, user, loading, chatContext, setChatContext, questionsRemaining, setQuestionsRemaining }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
