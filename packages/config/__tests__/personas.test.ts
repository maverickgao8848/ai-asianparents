import { getPersonaConfig, renderPrompt, ensurePromptLength } from '../personaUtils';

describe('persona config', () => {
  it('returns persona config with prompts', () => {
    const config = getPersonaConfig('strict-father');
    expect(config.prompts.deny).toContain('借口');
  });

  it('renders prompt with variables', () => {
    const prompt = renderPrompt('rational-mentor', 'deny', { remaining_percent: 30 });
    expect(prompt).toContain('30%');
  });

  it('keeps placeholders when variable missing', () => {
    const prompt = renderPrompt('humor-coach', 'delay');
    expect(prompt).toContain('{{delay_minutes}}');
  });

  it('throws when prompt too long', () => {
    expect(() => ensurePromptLength('a'.repeat(61))).toThrow();
  });
});
