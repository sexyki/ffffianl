const { chromium } = require('playwright');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN);
const PRODUCT_URL = 'https://www.onenessboutique.com/products/fear-of-god-essentials-bonded-nylon-soccer-shorts-in-desert-sand-160h024437f';
const ORIGINAL_PRICE = 90;

async function checkDiscount() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(PRODUCT_URL, { waitUntil: 'networkidle' });

    await page.click('input[value="XL"]');
    await page.click('button[name="add"]');
    await page.waitForTimeout(2000);
    await page.goto('https://www.onenessboutique.com/checkout', { waitUntil: 'networkidle' });

    const priceText = await page.textContent('.payment-due__price');
    const currentPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));

    if (currentPrice < ORIGINAL_PRICE) {
      const message = `💸 할인 감지됨! 현재 가격: $${currentPrice} (기존 $${ORIGINAL_PRICE})\n${PRODUCT_URL}`;
      await bot.sendMessage(process.env.CHAT_ID, message);
    }
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
}

checkDiscount();
