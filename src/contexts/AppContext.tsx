import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

type Msg = { role: 'user' | 'assistant'; content: string };

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  loading: boolean;
  chatContext: ChatContext;
  setChatContext: React.Dispatch<React.SetStateAction<ChatContext>>;
  questionsRemaining: number;
  setQuestionsRemaining: (n: number) => void;
  messages: Msg[];
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  chatInput: string;
  setChatInput: (v: string) => void;
  clearChatWithUndo: () => void;
  undoClearChat: () => void;
  hasPendingUndo: boolean;
  geo: { latitude: number; longitude: number } | null;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsRemaining, setQuestionsRemaining] = useState(10);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatContext, setChatContext] = useState<ChatContext>({
    religion: '',
    need: '',
    mood: '',
    topic: '',
    philosophy: '',
  });
  const [geo, setGeo] = useState<{ latitude: number; longitude: number } | null>(null);

  // Undo buffer
  const [previousMessages, setPreviousMessages] = useState<Msg[]>([]);
  const [hasPendingUndo, setHasPendingUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearChatWithUndo = useCallback(() => {
    if (messages.length === 0) return;
    
    // Clear any existing undo timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    // Save current messages to buffer
    setPreviousMessages([...messages]);
    setMessages([]);
    setChatInput('');
    setHasPendingUndo(true);

    // Auto-discard buffer after 20 seconds
    undoTimerRef.current = setTimeout(() => {
      setPreviousMessages([]);
      setHasPendingUndo(false);
      undoTimerRef.current = null;
    }, 20000);
  }, [messages]);

  const undoClearChat = useCallback(() => {
    if (previousMessages.length === 0) return;
    
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setMessages(previousMessages);
    setPreviousMessages([]);
    setHasPendingUndo(false);
  }, [previousMessages]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);
      if (!newUser) {
        setChatContext({ religion: '', need: '', mood: '', topic: '', philosophy: '' });
        setQuestionsRemaining(10);
        setMessages([]);
        setChatInput('');
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
        .select('questions_used, questions_limit, preferred_language, preferred_religion, latitude, longitude')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setQuestionsRemaining(data.questions_limit - data.questions_used);
            if (data.preferred_language) setLanguage(data.preferred_language as Language);
            if (data.preferred_religion) setChatContext(prev => ({ ...prev, religion: data.preferred_religion! }));
            
            // Geo persistence: load from profile or request once
            if (data.latitude != null && data.longitude != null) {
              setGeo({ latitude: data.latitude, longitude: data.longitude });
            } else if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const geoData = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                  setGeo(geoData);
                  // Save to profile
                  supabase.from('profiles').update(geoData as any).eq('user_id', user.id).then(() => {});
                },
                () => { /* permission denied */ },
                { timeout: 5000, maximumAge: 600000 }
              );
            }
          }
        });
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ language, setLanguage, user, loading, chatContext, setChatContext, questionsRemaining, setQuestionsRemaining, messages, setMessages, chatInput, setChatInput, clearChatWithUndo, undoClearChat, hasPendingUndo, geo }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
