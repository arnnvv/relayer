import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined.");
}

const backendApiUrl = process.env.BACKEND_API_URL;
if (!backendApiUrl) {
  throw new Error("BACKEND_API_URL is not defined.");
}

const dappUrl = process.env.DAPP_URL;
if (!dappUrl) {
  throw new Error("DAPP_URL is not defined.");
}

export const bot = new TelegramBot(token);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage =
    "Welcome to Signalfi Trader! I can help you with deposits, balance checks, and more.\n\nHere are the available commands:\n\n/deposit - Get a link to deposit funds.\n/balance - Check your current balance.\n/follow - Authorize copy-trading.\n/withdraw - Request a withdrawal.";
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/deposit/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `To make a deposit, please visit our secure dApp:\n${dappUrl}`,
  );
});

bot.onText(/\/follow/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `To authorize copy-trading, you need to sign a gasless message in our dApp:\n${dappUrl}`,
  );
});

bot.onText(/\/withdraw/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Withdrawals are processed through our secure dApp. Please visit:\n${dappUrl}`,
  );
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramUserId = msg.from?.id;

  if (!telegramUserId) {
    bot.sendMessage(chatId, "Sorry, I couldn't identify your user ID.");
    return;
  }

  try {
    bot.sendMessage(chatId, "⏳ Fetching your balance, please wait...");

    const response = await fetch(
      `${backendApiUrl}/api/balance/${telegramUserId}`,
    );

    if (!response.ok) {
      bot.sendMessage(
        chatId,
        "Sorry, our backend service seems to be down. Please try again later.",
      );
      throw new Error(
        `Backend service responded with status: ${response.status}`,
      );
    }

    const data = await response.json();
    const balance = data.balance;

    bot.sendMessage(chatId, `✅ Your current balance is: ${balance} tokens.`);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    bot.sendMessage(
      chatId,
      "❌ An error occurred while fetching your balance. Please try again later.",
    );
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.startsWith("/")) {
    return;
  }

  if (text) {
    bot.sendMessage(
      chatId,
      `I received: "${text}".\n\nPlease use one of the available commands by typing / or using the menu.`,
    );
  }
});

export const sendNotification = (userId: string | number, message: string) => {
  try {
    bot.sendMessage(userId, message);
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}`, error);
  }
};

console.log("Bot server started...");
