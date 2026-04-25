import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const CREDIT_COSTS = {
  FULL_QUOTATION: 10,
  ITEM_REWRITE: 3,
} as const;

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (error?.code === 'PGRST116') {
      // Row doesn't exist yet — create it (fallback if trigger didn't fire)
      const { data: inserted } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, credits: 100 })
        .select('credits')
        .single();
      setCredits(inserted?.credits ?? 100);
    } else {
      setCredits(data?.credits ?? 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  /**
   * Deducts `amount` credits. Returns true if successful, false if insufficient.
   * The DB constraint prevents credits going below 0 as a safety net.
   */
  const deductCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || credits === null || credits < amount) return false;

    const newCredits = credits - amount;
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error) {
      setCredits(newCredits);
      return true;
    }
    return false;
  }, [user, credits]);

  const canAfford = useCallback((amount: number): boolean => {
    return credits !== null && credits >= amount;
  }, [credits]);

  return { credits, loading, canAfford, deductCredits, refresh: fetchCredits };
}
