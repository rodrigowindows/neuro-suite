import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'manager' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const loadRoles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!error && data) {
          setRoles(data.map(r => r.role as AppRole));
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [user?.id]);

  const isManager = roles.includes('manager') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return { roles, isManager, isAdmin, loading };
}
