// 密码强度检查
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('至少8个字符');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含小写字母');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含大写字母');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含数字');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含特殊字符');
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return { strength, score, feedback };
}

// 邮箱格式验证
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


