'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string | null;
  bio: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  // 获取用户资料的函数
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 先尝试获取现有资料
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 表示没有找到记录，这是正常的（新用户）
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        // 如果没有资料，创建一个默认的
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            nickname: null,
            bio: null,
            avatar: 'default-1',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else if (newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // 获取用户资料
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, refreshKey]);

  // 更新用户资料
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: '用户未登录' } };
    }

    try {
      // 先检查是否存在
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existing) {
        // 如果存在，使用 update
        result = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // 如果不存在，使用 insert
        result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) {
        return { error: result.error };
      }

      if (result.data) {
        // 立即更新本地状态
        setProfile(result.data);
        // 触发全局更新事件，通知所有使用此 hook 的组件
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: result.data }));
        // 触发重新获取，确保所有使用此 hook 的组件都能更新
        setRefreshKey(prev => prev + 1);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return { error: { message: error.message || '更新失败' } };
    }
  };

  // 监听全局更新事件
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedProfile = event.detail as UserProfile;
      if (updatedProfile.user_id === user?.id) {
        setProfile(updatedProfile);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}

