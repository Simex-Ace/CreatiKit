'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFavorites } from '@/hooks/useFavorites';
import { AVATAR_OPTIONS, getAvatarEmoji, getAvatarColor } from '@/lib/avatars';
import { User, Mail, Calendar, Save, ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();
  const router = useRouter();
  const { toast } = useToast();
  
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('default-1');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (profile && !hasChanges) {
      if (profile.nickname) {
        setNickname(profile.nickname);
      }
      if (profile.bio) {
        setBio(profile.bio);
      }
      if (profile.avatar) {
        setSelectedAvatar(profile.avatar);
      }
    }
  }, [profile]);

  // 如果未登录，重定向到首页
  useEffect(() => {
    if (!user && !profileLoading) {
      router.push('/');
    }
  }, [user, profileLoading, router]);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        nickname: nickname.trim() || null,
        bio: bio.trim() || null,
        avatar: selectedAvatar,
      } as any);

      if (error) {
        toast({
          title: '保存失败',
          description: error.message || '请重试',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '已保存',
          description: '个人资料已更新',
          variant: 'success',
          duration: 2000,
        });
        setHasChanges(false);
      }
    } catch (error: any) {
      toast({
        title: '保存失败',
        description: error.message || '发生了意外错误',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  const userEmail = user.email || '';
  const displayName = profile?.nickname || userEmail.split('@')[0] || '用户';
  const avatarId = profile?.avatar || selectedAvatar || 'default-1';
  const avatarEmoji = getAvatarEmoji(avatarId);
  const avatarColor = getAvatarColor(avatarId);

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Button>
      </Link>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">个人中心</h1>
        <p className="text-muted-foreground">管理您的个人信息和偏好设置</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左侧：用户信息卡片 */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="text-center space-y-4">
              {/* 头像 */}
              <div className="flex justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-gradient-to-br ${avatarColor} shadow-lg`}>
                  {avatarEmoji}
                </div>
              </div>
              
              {/* 用户信息 */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{displayName}</h2>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {userEmail}
                </div>
                {profile?.created_at && (
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <Calendar className="mr-2 h-3 w-3" />
                    注册于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>

              <Separator />

              {/* 收藏统计 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Heart className="mr-1.5 h-3.5 w-3.5" />
                    收藏工具
                  </span>
                  <span className="font-medium">{favorites.length} 个</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：编辑表单 */}
        <div className="md:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  基本信息
                </h3>
              </div>

              {/* 头像选择 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">选择头像</Label>
                <div className="grid grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => {
                          setSelectedAvatar(avatar.id);
                          handleChange();
                        }}
                        className={`
                          relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                          transition-all duration-200
                          ${isSelected 
                            ? 'ring-4 ring-primary ring-offset-2 scale-110' 
                            : 'hover:scale-105 hover:ring-2 hover:ring-primary/50'
                          }
                          bg-gradient-to-br ${avatar.color}
                        `}
                        title={avatar.name}
                      >
                        <span>{avatar.emoji}</span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* 昵称 */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm font-medium">昵称</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="请输入昵称"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    handleChange();
                  }}
                  className="h-10"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  昵称将显示在您的个人资料中（最多20个字符）
                </p>
              </div>

              {/* 个人简介 */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">个人简介</Label>
                <Textarea
                  id="bio"
                  placeholder="介绍一下自己吧..."
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    handleChange();
                  }}
                  className="min-h-[100px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/200 字符
                </p>
              </div>

              {/* 保存按钮 */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !hasChanges}
                  className="min-w-[100px]"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存更改
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* 收藏夹 */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                我的收藏
              </h3>
              
              {favoritesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">还没有收藏任何工具</p>
                  <p className="text-xs text-muted-foreground mt-1">在首页点击工具卡片上的收藏按钮即可收藏</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Link
                        href={favorite.tool_path}
                        className="flex-1 min-w-0"
                      >
                        <p className="text-sm font-medium truncate">{favorite.tool_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{favorite.tool_path}</p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          const { error } = await removeFavorite(favorite.tool_path);
                          if (error) {
                            toast({
                              title: '取消收藏失败',
                              description: error.message || '请重试',
                              variant: 'destructive',
                            });
                          } else {
                            toast({
                              title: '已取消收藏',
                              variant: 'success',
                              duration: 2000,
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 账户信息 */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">账户信息</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">邮箱地址</Label>
                    <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-sm font-medium">用户ID</Label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono text-xs">
                      {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {profile?.created_at && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-sm font-medium">注册时间</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(profile.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

