import { personas, renderPrompt } from '@ai-yanfu/config';

export type PersonaKey = keyof typeof personas;

export function usePersona(personaKey: PersonaKey) {
  const persona = personas[personaKey];

  function getPrompt(type: keyof typeof persona.prompts, vars?: Record<string, string | number>) {
    return renderPrompt(personaKey, type, vars);
  }

  return {
    persona,
    getPrompt
  };
}
