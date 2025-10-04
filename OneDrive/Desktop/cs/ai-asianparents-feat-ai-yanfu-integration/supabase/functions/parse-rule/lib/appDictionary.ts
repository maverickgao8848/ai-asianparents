export type AppProfile = {
  keywords: string[];
  identifier: string;
  displayName: string;
  platform: 'android' | 'ios' | 'web' | 'other';
};

export const APP_DICTIONARY: AppProfile[] = [
  {
    keywords: ['tiktok', 'tik tok', '抖音'],
    identifier: 'com.zhiliaoapp.musically',
    displayName: 'TikTok',
    platform: 'android'
  },
  {
    keywords: ['wechat', 'weixin', '微信'],
    identifier: 'com.tencent.mm',
    displayName: 'WeChat',
    platform: 'android'
  },
  {
    keywords: ['bilibili', '哔哩哔哩'],
    identifier: 'tv.danmaku.bili',
    displayName: 'Bilibili',
    platform: 'android'
  },
  {
    keywords: ['youtube'],
    identifier: 'com.google.android.youtube',
    displayName: 'YouTube',
    platform: 'android'
  },
  {
    keywords: ['game', '王者荣耀', 'honor of kings'],
    identifier: 'com.tencent.tmgp.sgame',
    displayName: '王者荣耀',
    platform: 'android'
  }
];

export function matchApp(text: string) {
  const lower = text.toLowerCase();
  for (const profile of APP_DICTIONARY) {
    if (profile.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return profile;
    }
  }
  return null;
}
