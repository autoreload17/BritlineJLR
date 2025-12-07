/**
 * Send notification to Telegram
 */

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram] Bot token or chat ID not configured');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Telegram] Failed to send message:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Telegram] Error sending notification:', error);
    return false;
  }
}

export function formatOrderMessage(order: any): string {
  const items = order.items || [];
  const itemsList = items.length > 0
    ? items
        .map((item: any, index: number) => {
          const title = item.title || 'Service';
          const price = item.price || 0;
          return `${index + 1}. ${title}\n   💷 £${price}`;
        })
        .join('\n\n')
    : 'Нет услуг';

  const vehicle = order.vehicle || {};
  const vehicleInfo = vehicle.brand && vehicle.model && vehicle.year
    ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
    : 'Не указано';

  const orderId = order.id ? order.id.replace('order-', '') : 'N/A';
  const date = new Date(order.createdAt || Date.now()).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `🆕 <b>Новый заказ!</b>

📋 <b>Заказ #${orderId}</b>
📅 ${date}

👤 <b>Клиент:</b>
   Имя: ${order.customerName || 'Не указано'}
   Контакт: ${order.contact || 'Не указано'}
   VIN: ${order.vehicleVIN || 'Не указано'}

🚗 <b>Автомобиль:</b>
   ${vehicleInfo}

📦 <b>Услуги (${items.length}):</b>
${itemsList}

💰 <b>Итого: £${order.total || 0}</b>

📊 Статус: ${order.status || 'pending'}`.trim();
}

