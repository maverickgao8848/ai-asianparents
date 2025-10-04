function safeEnv(key: string) {
  try {
    return Deno.env.get(key) ?? undefined;
  } catch (_error) {
    return undefined;
  }
}

const expoAccessToken = safeEnv('EXPO_ACCESS_TOKEN');
const resendApiKey = safeEnv('RESEND_API_KEY');

export async function sendPush(payload: Record<string, unknown>) {
  if (!expoAccessToken) {
    return { success: false, reason: 'missing_expo_token' } as const;
  }
  // TODO: integrate expo-server-sdk; placeholder logs only.
  console.log('Sending push', payload);
  return { success: true } as const;
}

export async function sendEmail(payload: Record<string, unknown>) {
  if (!resendApiKey) {
    return { success: false, reason: 'missing_resend_key' } as const;
  }
  console.log('Sending email', payload);
  return { success: true } as const;
}

export async function sendInApp(payload: Record<string, unknown>) {
  // In-app notifications stored in `notifications` table, handled separately.
  console.log('Recording in-app notification', payload);
  return { success: true } as const;
}
