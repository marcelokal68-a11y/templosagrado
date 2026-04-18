import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Language, t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { computeAccess, AccessStatus, isPreviewEnvironment } from '@/lib/access';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatContext {
  religion: string;
  need: string;
  mood: string;
  topic: string;
  philosophy: string;
}

type Msg = { role: 'user' | 'assistant'; content: string };

export type ChatTone = 'concise' | 'reflective';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  loading: boolean;
  isSubscriber: boolean;
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
  memoryEnabled: boolean;
  setMemoryEnabled: (v: boolean) => void;
  chatTone: ChatTone;
  setChatTone: (v: ChatTone) => void;
  accessStatus: AccessStatus;
  trialDaysLeft: number;
  isAdmin: boolean;
  preferredReligion: string | null;
  refreshProfile: () => Promise<void>;
  changeFaithWithCleanup: (newReligion: string | null) => Promise<void>;
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
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [memoryEnabled, setMemoryEnabledState] = useState(false);
  const [chatTone, setChatToneState] = useState<ChatTone>('reflective');
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('anon');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileRaw, setProfileRaw] = useState<any>(null);
  const [preferredReligion, setPreferredReligion] = useState<string | null>(null);

  const setMemoryEnabled = useCallback(async (v: boolean) => {
    setMemoryEnabledState(v);
    if (user) {
      await supabase.from('profiles').update({ memory_enabled: v } as any).eq('user_id', user.id);
    }
  }, [user]);

  const setChatTone = useCallback(async (v: ChatTone) => {
    setChatToneState(v);
    if (user) {
      await supabase.from('profiles').update({ chat_tone: v } as any).eq('user_id', user.id);
    }
  }, [user]);

  // Undo buffer
  const [previousMessages, setPreviousMessages] = useState<Msg[]>([]);
  const [hasPendingUndo, setHasPendingUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Faith prompt state
  const [faithPromptReligion, setFaithPromptReligion] = useState<string | null>(null);
  const [faithPromptDismissed, setFaithPromptDismissed] = useState(false);
  const hasPreferredReligionRef = useRef<boolean | null>(null);

  const clearChatWithUndo = useCallback(() => {
    if (messages.length === 0) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setPreviousMessages([...messages]);
    setMessages([]);
    setChatInput('');
    setHasPendingUndo(true);
    undoTimerRef.current = setTimeout(() => {
      setPreviousMessages([]);
      setHasPendingUndo(false);
      undoTimerRef.current = null;
    }, 20000);
  }, [messages]);

  const undoClearChat = useCallback(() => {
    if (previousMessages.length === 0) return;
    if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
    setMessages(previousMessages);
    setPreviousMessages([]);
    setHasPendingUndo(false);
  }, [previousMessages]);

  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
  }, []);

  // Watch for first religion selection → show faith prompt
  useEffect(() => {
    if (!user || faithPromptDismissed || hasPreferredReligionRef.current === true) return;
    if (hasPreferredReligionRef.current === null) return; // still loading
    const religion = chatContext.religion;
    if (religion && !faithPromptReligion) {
      setFaithPromptReligion(religion);
    }
  }, [chatContext.religion, user, faithPromptDismissed, faithPromptReligion]);

  const handleFaithConfirm = async () => {
    if (!user || !faithPromptReligion) return;
    await supabase.from('profiles').update({ preferred_religion: faithPromptReligion } as any).eq('user_id', user.id);
    hasPreferredReligionRef.current = true;
    setPreferredReligion(faithPromptReligion);
    setFaithPromptReligion(null);
  };

  const handleFaithDismiss = () => {
    setFaithPromptDismissed(true);
    setFaithPromptReligion(null);
  };

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
        hasPreferredReligionRef.current = null;
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfileRaw(null);
      setAccessStatus('anon');
      setTrialDaysLeft(0);
      setIsAdmin(false);
      setPreferredReligion(null);
      return;
    }

    // Load profile
    const { data } = await supabase
      .from('profiles')
      .select('questions_used, questions_limit, preferred_language, preferred_religion, latitude, longitude, memory_enabled, chat_tone, is_subscriber, is_pro, trial_ends_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const inPreview = isPreviewEnvironment();

    if (data) {
      setProfileRaw(data);
      setQuestionsRemaining(inPreview ? 999999 : data.questions_limit - data.questions_used);
      setIsSubscriber(inPreview ? true : !!(data as any).is_subscriber);
      setMemoryEnabledState(!!(data as any).memory_enabled);
      const tone = (data as any).chat_tone;
      if (tone === 'concise' || tone === 'reflective') setChatToneState(tone);
      if (data.preferred_language) setLanguage(data.preferred_language as Language);
      if (data.preferred_religion) {
        setChatContext(prev => ({ ...prev, religion: data.preferred_religion! }));
        hasPreferredReligionRef.current = true;
        setPreferredReligion(data.preferred_religion);
      } else {
        hasPreferredReligionRef.current = false;
        setPreferredReligion(null);
      }
      if (data.latitude != null && data.longitude != null) {
        setGeo({ latitude: data.latitude, longitude: data.longitude });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const geoData = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setGeo(geoData);
            supabase.from('profiles').update(geoData as any).eq('user_id', user.id).then(() => {});
          },
          () => {},
          { timeout: 5000, maximumAge: 600000 }
        );
      }
    }

    // Check admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    const admin = roles?.some((r: any) => r.role === 'admin') ?? false;
    setIsAdmin(admin);

    // Compute access status (preview always returns 'subscriber')
    const access = computeAccess(data as any, admin);
    setAccessStatus(inPreview ? 'subscriber' : access.status);
    setTrialDaysLeft(inPreview ? 0 : access.trialDaysLeft);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const faithReligionLabel = faithPromptReligion ? t(`religion.${faithPromptReligion}`, language) : '';

  return (
    <AppContext.Provider value={{ language, setLanguage, user, loading, isSubscriber, chatContext, setChatContext, questionsRemaining, setQuestionsRemaining, messages, setMessages, chatInput, setChatInput, clearChatWithUndo, undoClearChat, hasPendingUndo, geo, memoryEnabled, setMemoryEnabled, chatTone, setChatTone, accessStatus, trialDaysLeft, isAdmin, preferredReligion, refreshProfile: loadProfile }}>
      {children}
      <AlertDialog open={!!faithPromptReligion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('learn.ask_faith', language).replace('{religion}', faithReligionLabel)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('learn.ask_faith', language).replace('{religion}', faithReligionLabel)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleFaithDismiss}>
              {t('learn.not_now', language)}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleFaithConfirm}>
              {t('learn.yes', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
