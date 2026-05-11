import { supabase } from "@/integrations/supabase/client";

/**
 * Apaga permanentemente o histórico de chat (mensagens + entradas em
 * activity_history do tipo 'chat') vinculado à religião/filosofia anterior.
 * Não toca em user_memory, versículos, orações ou outras práticas.
 */
export async function clearAffiliationHistory(
  userId: string,
  prevReligion?: string | null,
  prevPhilosophy?: string | null,
): Promise<void> {
  if (!userId) return;

  const tasks: Promise<unknown>[] = [];

  if (prevReligion) {
    tasks.push(
      supabase.from("chat_messages").delete().eq("user_id", userId).eq("religion", prevReligion),
    );
  }
  if (prevPhilosophy) {
    tasks.push(
      supabase.from("chat_messages").delete().eq("user_id", userId).eq("philosophy", prevPhilosophy),
    );
  }

  // activity_history: filtra por type='chat' e metadata da fé anterior
  if (prevReligion) {
    tasks.push(
      supabase
        .from("activity_history")
        .delete()
        .eq("user_id", userId)
        .eq("type", "chat")
        .filter("metadata->>religion", "eq", prevReligion),
    );
  }
  if (prevPhilosophy) {
    tasks.push(
      supabase
        .from("activity_history")
        .delete()
        .eq("user_id", userId)
        .eq("type", "chat")
        .filter("metadata->>philosophy", "eq", prevPhilosophy),
    );
  }

  await Promise.allSettled(tasks);
}
