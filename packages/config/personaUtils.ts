import { PersonaConfig, personas } from './personas';

type PersonaKey = keyof typeof personas;

type PromptVariables = Record<string, string | number | undefined>;

export function getPersonaConfig(key: PersonaKey): PersonaConfig {
  return personas[key];
}

export function renderPrompt(
  key: PersonaKey,
  type: keyof PersonaConfig['prompts'],
  vars: PromptVariables = {}
) {
  const persona = getPersonaConfig(key);
  const template = persona.prompts[type];
  return template.replace(/{{(\w+)}}/g, (_, token) => {
    const value = vars[token];
    return value !== undefined ? String(value) : `{{${token}}}`;
  });
}

export function ensurePromptLength(prompt: string, maxChars = 60) {
  if (prompt.length > maxChars) {
    throw new Error(`Prompt exceeds ${maxChars} characters: ${prompt}`);
  }
}
