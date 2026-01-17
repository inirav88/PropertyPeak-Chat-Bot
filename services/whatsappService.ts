
/**
 * WhatsApp Cloud API Service
 * Handles outgoing communication to Meta's servers
 */

export const sendWhatsAppMessage = async (to: string, message: string, config: any) => {
  const { phoneNumberId, accessToken, apiVersion = 'v21.0' } = config.meta;

  if (!phoneNumberId || !accessToken) {
    console.error("WhatsApp credentials missing");
    return { success: false, error: "Missing Credentials" };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: message }
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    return { success: false, error };
  }
};

export const sendWhatsAppButtons = async (to: string, text: string, buttons: string[], config: any) => {
  const { phoneNumberId, accessToken, apiVersion = 'v21.0' } = config.meta;

  if (!phoneNumberId || !accessToken) return { success: false };

  // Meta limits interactive buttons to 3. If more, we use a list or just text.
  if (buttons.length > 3) {
    const buttonText = text + "\n\n" + buttons.map((b, i) => `${i + 1}. ${b}`).join("\n");
    return sendWhatsAppMessage(to, buttonText, config);
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: text },
          action: {
            buttons: buttons.map((btn, index) => ({
              type: "reply",
              reply: {
                id: `btn_${index}`,
                title: btn.substring(0, 20) // Meta limit is 20 chars
              }
            }))
          }
        }
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error };
  }
};
