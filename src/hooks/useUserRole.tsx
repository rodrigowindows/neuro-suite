import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'manager' | 'user';

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

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

  const isManager = roles.includes('manager') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return { roles, isManager, isAdmin, loading, refreshRoles: loadRoles };
}
