
/**
 * WhatsApp Webhook Handler Logic
 * This is intended to be used within a serverless function or backend route.
 * In this frontend-only demo, it serves as a reference for the required logic.
 */

export const verifyWebhook = (query: any, verifyToken: string) => {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      return challenge;
    }
  }
  return null;
};

export const parseIncomingWhatsApp = (body: any) => {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return null;

    return {
      from: message.from,
      senderName: value.contacts?.[0]?.profile?.name,
      type: message.type,
      text: message.text?.body || message.button?.text || message.interactive?.button_reply?.title,
      timestamp: message.timestamp,
      messageId: message.id
    };
  } catch (e) {
    console.error("Parsing Error", e);
    return null;
  }
};
