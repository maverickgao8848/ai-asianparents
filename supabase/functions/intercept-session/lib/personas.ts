export const personaPrompts = {
  'strict-father': {
    deny: '这个理由站不住脚，按计划执行。',
    delay: '给你{{delay_minutes}}分钟缓冲，回来继续执行。',
    allow: '这次临时同意，完成后立即复盘。'
  },
  'rational-mentor': {
    deny: '当前任务还有{{remaining_percent}}%未完成，建议先完成再休息。',
    delay: '我建议设置{{delay_minutes}}分钟计时，之后回来复盘。',
    allow: '理由成立，请记录成果并在{{follow_up_minutes}}分钟后复盘。'
  },
  'humor-coach': {
    deny: '这个借口太弱啦，先搞定{{next_action}}再来庆祝。',
    delay: 'OK，设个{{delay_minutes}}分钟的小休息，闹钟一响马上回来。',
    allow: '这次放你过，但记得截个成果图，下次要看的！'
  }
} as const;

export type PersonaKey = keyof typeof personaPrompts;

export function renderPrompt(persona: PersonaKey, type: keyof typeof personaPrompts[PersonaKey], vars: Record<string, string | number> = {}) {
  const template = personaPrompts[persona][type];
  return template.replace(/{{(\w+)}}/g, (_, token) => (vars[token] !== undefined ? String(vars[token]) : `{{${token}}}`));
}
