export async function sendTelegramNotification(
  token: string,
  chatId: string,
  message: string
) {
  if (!token || !chatId) {
    console.warn('[Telegram] Skipping notification: Token or Chat ID missing.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Telegram] API Error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('[Telegram] Failed to send notification:', error);
  }
}
