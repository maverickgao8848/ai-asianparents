const keywordMap: Record<string, string[]> = {
  work: ['工作', '汇报', 'meeting', '会议', '客户', '加班'],
  study: ['学习', '作业', '考试', '复习', 'lecture'],
  health: ['身体', '休息', '生病', '医院', 'therapy'],
  mental_break: ['放松', '玩会', '刷刷', '休息一下'],
  social: ['朋友', '聊天', '约会', '家人', 'message'],
  emergency: ['紧急', '火警', '事故', 'emergency']
};

export function classifyReason(text: string) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return 'other';
}
