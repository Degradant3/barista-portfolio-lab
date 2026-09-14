// barista-portfolio/api/send-brief.js (Serverless Function)
const axios = require('axios'); // Нам понадобится библиотека axios для запросов (её нужно будет установить в папку проекта)

export default async function handler(req, res) {
  // 1. Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Only POST allowed' });
  }

  // 2. Получаем данные из запроса
  const { name, contact_info, service_type, message } = req.body;

  // Базовая валидация (защита от пустых спам-заявок)
  if (!name || !contact_info || !service_type) {
    return res.status(400).json({ success: false, message: 'Name, contact, and service type are required.' });
  }

  // 3. Получаем секретные данные из переменных окружения
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing Telegram Environment Variables');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  // 4. Форматируем сообщение для Телеграма (MarkdownV2)
  const textMessage = `
🔔 *НОВАЯ ЗАЯВКА НА БРИФ* // ${new Date().toLocaleString('ru-RU')}

*От кого:* \`${name.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}\`
*Контакт:* \`${contact_info.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}\`
*Тип проекта:* \`${service_type.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}\`
*Сообщение:* \`${(message || 'Нет сообщения').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}\`

Specialty Barista Lab // Rasul Aliev
  `;

  // 5. Отправляем запрос в Телеграм API
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: textMessage,
      parse_mode: 'MarkdownV2'
    });

    if (response.data.ok) {
      // 6. Успешный ответ
      return res.status(200).json({ success: true, message: 'Brief sent successfully to Telegram!' });
    } else {
      console.error('Telegram API Error:', response.data);
      return res.status(500).json({ success: false, message: 'Error sending message to Telegram.' });
    }
  } catch (error) {
    console.error('Axios Error:', error.message);
    return res.status(500).json({ success: false, message: 'A network error occurred.' });
  }
}