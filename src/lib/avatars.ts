// 内置头像选项
export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'default-1', name: '笑脸', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { id: 'default-2', name: '机器人', emoji: '🤖', color: 'from-gray-400 to-gray-600' },
  { id: 'default-3', name: '猫', emoji: '🐱', color: 'from-orange-300 to-pink-300' },
  { id: 'default-4', name: '狗', emoji: '🐶', color: 'from-amber-400 to-yellow-500' },
  { id: 'default-5', name: '熊猫', emoji: '🐼', color: 'from-gray-200 to-gray-400' },
  { id: 'default-6', name: '狐狸', emoji: '🦊', color: 'from-orange-400 to-red-400' },
  { id: 'default-7', name: '狮子', emoji: '🦁', color: 'from-yellow-500 to-orange-500' },
  { id: 'default-8', name: '老虎', emoji: '🐯', color: 'from-orange-500 to-yellow-600' },
  { id: 'default-9', name: '熊', emoji: '🐻', color: 'from-amber-600 to-brown-600' },
  { id: 'default-10', name: '兔子', emoji: '🐰', color: 'from-pink-200 to-pink-400' },
  { id: 'default-11', name: '企鹅', emoji: '🐧', color: 'from-gray-300 to-gray-500' },
  { id: 'default-12', name: '鸟', emoji: '🐦', color: 'from-blue-300 to-blue-500' },
  { id: 'default-13', name: '鱼', emoji: '🐟', color: 'from-blue-400 to-cyan-400' },
  { id: 'default-14', name: '蝴蝶', emoji: '🦋', color: 'from-purple-300 to-pink-300' },
  { id: 'default-15', name: '独角兽', emoji: '🦄', color: 'from-pink-300 to-purple-300' },
  { id: 'default-16', name: '龙', emoji: '🐲', color: 'from-green-400 to-emerald-500' },
  { id: 'default-17', name: '太阳', emoji: '☀️', color: 'from-yellow-300 to-orange-400' },
  { id: 'default-18', name: '月亮', emoji: '🌙', color: 'from-blue-400 to-indigo-600' },
  { id: 'default-19', name: '星星', emoji: '⭐', color: 'from-yellow-200 to-yellow-400' },
  { id: 'default-20', name: '彩虹', emoji: '🌈', color: 'from-pink-400 via-purple-400 to-blue-400' },
  { id: 'default-21', name: '火焰', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { id: 'default-22', name: '闪电', emoji: '⚡', color: 'from-yellow-400 to-yellow-600' },
  { id: 'default-23', name: '雪花', emoji: '❄️', color: 'from-blue-200 to-cyan-300' },
  { id: 'default-24', name: '云朵', emoji: '☁️', color: 'from-gray-200 to-gray-400' },
];

// 根据头像ID获取emoji
export function getAvatarEmoji(avatarId: string): string {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.emoji || AVATAR_OPTIONS[0].emoji;
}

// 根据头像ID获取颜色
export function getAvatarColor(avatarId: string): string {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.color || AVATAR_OPTIONS[0].color;
}

// 根据头像ID获取完整信息
export function getAvatarInfo(avatarId: string): AvatarOption {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar || AVATAR_OPTIONS[0];
}

