'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getAvatarEmoji, getAvatarColor } from '@/lib/avatars';
import { User, LogOut } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!user) return null;


  const userEmail = user.email || '用户';
  const displayName = profile?.nickname || userEmail.split('@')[0];
  const avatarId = profile?.avatar || 'default-1';
  const avatarEmoji = getAvatarEmoji(avatarId);
  const avatarColor = getAvatarColor(avatarId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden"
          type="button"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-2xl shadow-md flex-shrink-0`}>
            {avatarEmoji}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[100]" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
            {user.app_metadata?.provider && (
              <p className="text-xs leading-none text-muted-foreground/70 mt-0.5">
                通过 {user.app_metadata.provider === 'google' ? 'Google' : user.app_metadata.provider === 'github' ? 'GitHub' : '邮箱'} 登录
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>个人中心</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={async (e) => {
            e.preventDefault();
            if (loading) return;
            setLoading(true);
            try {
              await signOut();
              toast({
                title: '已退出登录',
                description: '期待您的再次使用',
              });
              // 刷新页面以确保清除所有状态
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            } catch (error: any) {
              console.error('Sign out error:', error);
              toast({
                title: '退出失败',
                description: error?.message || '请重试',
                variant: 'destructive',
              });
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? '退出中...' : '退出登录'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

