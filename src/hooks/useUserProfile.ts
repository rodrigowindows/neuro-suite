import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  fullName: string;
  preferredName: string;
  displayName: string;
  email: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferred_name, full_name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfile({
            id: user.id,
            fullName: data.full_name || '',
            preferredName: data.preferred_name || '',
            displayName: data.preferred_name || data.full_name || '',
            email: data.email || user.email || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  return { profile, loading };
}
