const axios = require('axios');

module.exports = async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, contact_info, service_type, message } = req.body || {};

  // Валидация обязательных полей
  if (!name || !contact_info || !service_type) {
    return res.status(400).json({ success: false, message: 'Заполните обязательные поля' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, message: 'Ошибка переменных окружения на сервере' });
  }

  // Расшифровка типа услуги на русский язык
  const servicesMap = {
	management: 'Операционное шефство / Ведение бара',
    menu: 'Разработка меню & Техкарт',
    audit: 'Аудит & Оптимизация расходов',
    turnkey: 'Запуск бара «Под ключ»',
    training: 'Обучение персонала & Регламенты',
    other: 'Другое / Консультация'
  };

  const selectedService = servicesMap[service_type] || service_type;

  // Экранирование HTML тегов для безопасности Telegram
  const clean = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const text = `🔔 <b>НОВАЯ ЗАЯВКА С САЙТА</b>\n\n` +
               `👤 <b>Имя:</b> ${clean(name)}\n` +
               `📞 <b>Связь:</b> ${clean(contact_info)}\n` +
               `📋 <b>Услуга:</b> ${clean(selectedService)}\n` +
               `💬 <b>Задача:</b> ${clean(message || 'Не указана')}\n\n` +
               `<i>Specialty Barista Lab // Расул Алиев</i>`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(telegramUrl, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    if (response.data && response.data.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: response.data });
    }
  } catch (error) {
    console.error('Telegram Send Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message, 
      details: error.response?.data 
    });
  }
};