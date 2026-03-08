import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Users, Crown, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AppRole } from '@/hooks/useUserRole';

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  preferred_name: string | null;
  roles: AppRole[];
}

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    if (!authLoading && !roleLoading && !isAdmin) navigate('/dashboard');
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, preferred_name')
        .order('created_at', { ascending: false })
        .limit(200);

      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rErr) throw rErr;

      const roleMap = new Map<string, AppRole[]>();
      roles?.forEach((r) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role as AppRole);
        roleMap.set(r.user_id, existing);
      });

      const combined: UserWithRole[] = (profiles || []).map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        preferred_name: p.preferred_name,
        roles: roleMap.get(p.id) || ['user'],
      }));

      setUsers(combined);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast.error('Você não pode alterar seu próprio papel');
      return;
    }
    setUpdatingUser(userId);
    try {
      // Delete existing roles for this user
      const { error: delErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delErr) throw delErr;

      // Insert new role
      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      if (insErr) throw insErr;

      toast.success(`Papel atualizado para ${newRole}`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar papel');
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadge = (role: AppRole) => {
    const config: Record<AppRole, { variant: 'default' | 'secondary' | 'outline'; icon: typeof Crown }> = {
      admin: { variant: 'default', icon: Crown },
      manager: { variant: 'secondary', icon: Shield },
      user: { variant: 'outline', icon: UserCheck },
    };
    const c = config[role];
    return (
      <Badge variant={c.variant} className="gap-1">
        <c.icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getHighestRole = (roles: AppRole[]): AppRole => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('manager')) return 'manager';
    return 'user';
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 flex items-center gap-3 border-b bg-card/60 backdrop-blur-sm px-4 sticky top-0 z-40">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display font-bold text-sm sm:text-base">Painel Admin</h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block">Gerenciamento de roles e usuários</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Usuários', value: users.length, icon: Users, color: 'text-primary' },
            { label: 'Gestores', value: users.filter(u => u.roles.includes('manager') || u.roles.includes('admin')).length, icon: Shield, color: 'text-accent' },
            { label: 'Admins', value: users.filter(u => u.roles.includes('admin')).length, icon: Crown, color: 'text-destructive' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>Gerencie os papéis de cada colaborador</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Papel Atual</TableHead>
                      <TableHead>Alterar Papel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.preferred_name || u.full_name || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.email || '—'}
                        </TableCell>
                        <TableCell>{getRoleBadge(getHighestRole(u.roles))}</TableCell>
                        <TableCell>
                          {u.id === user?.id ? (
                            <span className="text-xs text-muted-foreground">Você</span>
                          ) : (
                            <Select
                              defaultValue={getHighestRole(u.roles)}
                              onValueChange={(val) => handleRoleChange(u.id, val as AppRole)}
                              disabled={updatingUser === u.id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="manager">manager</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
