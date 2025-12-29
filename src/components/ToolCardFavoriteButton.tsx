'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getToolName } from '@/lib/tools';

interface ToolCardFavoriteButtonProps {
  toolPath: string;
}

export function ToolCardFavoriteButton({ toolPath }: ToolCardFavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  if (!user) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorite = isFavorite(toolPath);
    const { error } = await toggleFavorite(toolPath, getToolName(toolPath));
    if (error) {
      toast({
        title: error.message || '操作失败',
        variant: 'destructive',
      });
    } else {
      toast({
        title: wasFavorite ? '已取消收藏' : '已收藏',
        variant: 'success',
        duration: 2000,
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full hover:bg-accent transition-colors"
      title={isFavorite(toolPath) ? '取消收藏' : '收藏'}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavorite(toolPath)
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground hover:text-red-500'
        }`}
      />
    </button>
  );
}

