export type Platform = 'LeetCode' | 'GeeksForGeeks' | 'CodingNinjas' | 'TUF+' | 'YouTube' | 'Educative' | 'DesignGurus' | 'Other';

const PLATFORM_PATTERNS: { platform: Platform; patterns: RegExp[] }[] = [
  {
    platform: 'LeetCode',
    patterns: [/leetcode\.com/i, /leetcode\.cn/i],
  },
  {
    platform: 'GeeksForGeeks',
    patterns: [/geeksforgeeks\.org/i, /gfg\.dev/i],
  },
  {
    platform: 'CodingNinjas',
    patterns: [/codingninjas\.com/i, /naukri\.com\/code360/i, /code360\.tech/i],
  },
  {
    platform: 'TUF+',
    patterns: [/takeuforward\.org/i, /tuf\+/i],
  },
  {
    platform: 'YouTube',
    patterns: [/youtube\.com/i, /youtu\.be/i],
  },
  {
    platform: 'Educative',
    patterns: [/educative\.io/i],
  },
  {
    platform: 'DesignGurus',
    patterns: [/designgurus\.io/i, /designgurus\.org/i],
  },
];

/**
 * Auto-detect platform from a URL.
 * Returns the platform name if detected, null if the URL is empty/invalid.
 */
export function detectPlatform(url: string): Platform | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some((p) => p.test(trimmed))) {
      return platform;
    }
  }

  // Has a URL but doesn't match known platforms
  return 'Other';
}

export const ALL_PLATFORMS: Platform[] = ['LeetCode', 'GeeksForGeeks', 'CodingNinjas', 'TUF+', 'YouTube', 'Educative', 'DesignGurus', 'Other'];
