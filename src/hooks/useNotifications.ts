import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

export function useNotifications(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;

    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId, client, queryClient]);

  const markRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  return { ...query, unreadCount, markRead };
}

export function useUnreadNotificationCount(userId: string) {
  const { unreadCount, isLoading } = useNotifications(userId);
  return { unreadCount, isLoading };
}
