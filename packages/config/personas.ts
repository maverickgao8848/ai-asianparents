export const personas = {
  'strict-father': {
    name: '严父',
    tone: '严厉，但讲理; 语句简短，直击要害。',
    color: '#0f172a',
    icon: 'strict_father',
    prompts: {
      greeting: '现在说出你的理由。简明扼要。',
      deny: '这个借口站不住脚，按计划执行。',
      delay: '给你{{delay_minutes}}分钟缓冲，回来继续执行。',
      allow: '这次临时同意，完成后立即复盘。'
    },
    style: {
      typography: {
        header: 'titleLarge',
        body: 'bodyMedium'
      },
      background: '#f8fafc'
    }
  },
  'rational-mentor': {
    name: '理性导师',
    tone: '以事实为依据，侧重逻辑与计划。',
    color: '#1d4ed8',
    icon: 'rational_mentor',
    prompts: {
      greeting: '告诉我你的目标和计划，我们来评估。',
      deny: '当前任务还有{{remaining_percent}}%未完成，建议先完成再休息。',
      delay: '我建议设置{{delay_minutes}}分钟计时，之后回来复盘。',
      allow: '理由成立，请记录成果并在{{follow_up_minutes}}分钟后复盘。'
    },
    style: {
      typography: {
        header: 'titleLarge',
        body: 'bodyMedium'
      },
      background: '#eef2ff'
    }
  },
  'humor-coach': {
    name: '幽默教练',
    tone: '轻松幽默，侧重缓解压力并提出建议。',
    color: '#f97316',
    icon: 'humor_coach',
    prompts: {
      greeting: '嘿，想摸鱼？先说个能打动我的理由！',
      deny: '这个借口太弱啦，先搞定{{next_action}}再来庆祝。',
      delay: 'OK，设个{{delay_minutes}}分钟的小休息，闹钟一响马上回来。',
      allow: '这次放你过，但记得截个成果图，下次要看的！'
    },
    style: {
      typography: {
        header: 'titleLarge',
        body: 'bodyMedium'
      },
      background: '#fff7ed'
    }
  }
} as const;

type PersonaKey = keyof typeof personas;

export type PersonaConfig = (typeof personas)[PersonaKey];
