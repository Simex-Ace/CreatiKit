'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Favorite {
  id: string;
  user_id: string;
  tool_path: string;
  tool_name: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 获取收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // 初始化加载
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 检查是否已收藏
  const isFavorite = useCallback((toolPath: string) => {
    return favorites.some(fav => fav.tool_path === toolPath);
  }, [favorites]);

  // 添加收藏
  const addFavorite = useCallback(async (toolPath: string, toolName: string) => {
    if (!user) {
      return { error: { message: '请先登录' } };
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          tool_path: toolPath,
          tool_name: toolName,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      if (data) {
        setFavorites(prev => [data, ...prev]);
        // 触发全局更新事件
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      }

      return { data, error: null };
    } catch (error: any) {
      return { error: { message: error.message || '添加收藏失败' } };
    }
  }, [user, supabase]);

  // 移除收藏
  const removeFavorite = useCallback(async (toolPath: string) => {
    if (!user) {
      return { error: { message: '请先登录' } };
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_path', toolPath);

      if (error) {
        return { error };
      }

      setFavorites(prev => prev.filter(fav => fav.tool_path !== toolPath));
      // 触发全局更新事件
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || '移除收藏失败' } };
    }
  }, [user, supabase]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (toolPath: string, toolName: string) => {
    if (isFavorite(toolPath)) {
      return await removeFavorite(toolPath);
    } else {
      return await addFavorite(toolPath, toolName);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // 监听全局更新事件
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      fetchFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}

