import logging
import ollama
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters

# --- CONFIGURATION ---
TOKEN = "8582888165:AAGMI6mVE3HcRnpGfiD7wkQmnROClQehF6c" # PASTE YOUR TOKEN HERE
OLLAMA_BRAIN = "qwen2.5:7b"

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

async def start(update: Update, context):
    """Welcome message when you text /start"""
    await update.message.reply_text(
        " JARVIS SOVEREIGN LINK ACTIVE.\n"
        "I am connected to your local brain. Awaiting commands, Architect."
    )

async def handle_message(update: Update, context):
    """Routes your text to local Ollama and sends the reply back."""
    user_text = update.message.text
    user_id = update.message.from_user.id
    
    # Security: Only YOU can talk to it (Replace 123456789 with your actual Telegram User ID)
    # To find your ID, text @userinfobot on Telegram
    # if user_id != YOUR_TELEGRAM_ID:
    #     await update.message.reply_text("🚫 ACCESS DENIED. Unknown entity.")
    #     return

    await update.message.reply_text("🧠 Processing via local neural net...")
    
    try:
        # Send to local Ollama
        response = ollama.chat(
            model=OLLAMA_BRAIN, 
            messages=[{'role': 'user', 'content': user_text}]
        )
        reply = response['message']['content']
        
        # Telegram has a 4096 char limit, so we chunk it if needed
        if len(reply) > 4000:
            reply = reply[:4000] + "...\n[Message truncated due to length]"
            
        await update.message.reply_text(reply)
    except Exception as e:
        await update.message.reply_text(f"️ Neural link interrupted: {str(e)}")

def main():
    print(" TELEGRAM BRIDGE ONLINE. Waiting for Architect...")
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Start polling
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
