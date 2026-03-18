import random
import requests
from datetime import datetime
from ai_brain import ai_think_async

CONTACTS = (
  "Here's how you can reach me:\n"
  "Email: edrian.a.marinas@gmail.com\n"
  "Phone: 09854703444\n"
  "LinkedIn: linkedin.com/in/edrian-a-marinas\n"
  "GitHub: github.com/edrian-a-marinas\n"
  "Facebook: facebook.com/edri.a.marinas\n"
  "Portfolio: edrian-marinas.vercel.app"
)

class Chatbot:
  def __init__(self):
    self.default_responses = {
      "hello": self.random_greeting,
      "hi": self.random_greeting,
      "how are you": self.random_status,
      "thank you": lambda: "No problem! Let me know if you need anything else.",
      "date today": self.date_today,
      "tell me a joke": self.get_joke,
    }

  # ---------- Random greetings and status ----------
  def random_status(self):
    return random.choice([
      "I'm doing great — thanks for asking! Feel free to ask me anything.",
      "All good on my end 😄 What would you like to know about me?",
      "Doing well! What can I help you with today?"
    ])

  def random_greeting(self):
    return random.choice([
      "Hey! I'm Edrian 🤖 — well, my AI form. Ask me anything about myself!",
      "Hi there! 👋 I'm Edrian's AI. What would you like to know about me?",
      "Yoo! I'm Edrian in AI form. I can tell you about my skills, background, or even crack a joke!",
      "Hello! I'm Edrian — ask me anything about my background, skills, or just chat!"
    ])

  # ---------- Correction when user refers to Edrian in third person ----------
  def third_person_correction(self):
    return random.choice([
      "Just a heads up — you can talk to me directly! I'm Edrian. What would you like to know?",
      "Hey, I'm right here! 😄 You can ask me directly — I'm Edrian in AI form.",
      "No need for 'his' — I'm Edrian himself (in AI form)! Ask me anything directly."
    ])

  # ---------- Quick utility response ----------
  def date_today(self):
    now = datetime.now()
    return now.strftime("Today is %B %d, %Y")

  def get_joke(self):
    try:
      res = requests.get(
        "https://official-joke-api.appspot.com/jokes/random",
        timeout=5
      )
      data = res.json()
      return f"{data['setup']} — {data['punchline']}"
    except Exception:
      return "I couldn't fetch a joke right now."

  # ---------- Utilities / Helper functions ----------
  def compare_two_strings(self, a: str, b: str) -> float:
    a, b = a.replace(" ", ""), b.replace(" ", "")
    if len(a) < 2 or len(b) < 2:
      return 0.0
    bigrams = {}
    for i in range(len(a) - 1):
      bg = a[i:i+2]
      bigrams[bg] = bigrams.get(bg, 0) + 1
    intersection = 0
    for i in range(len(b) - 1):
      bg = b[i:i+2]
      if bigrams.get(bg, 0) > 0:
        bigrams[bg] -= 1
        intersection += 1
    return (2 * intersection) / (len(a) + len(b) - 2)

  # ---------- Main logic / Fast response ----------
  async def get_response(self, message: str):
    message = message.lower().strip()

    # ---- Third person correction ----
    third_person_triggers = [
      "what is his", "what's his", "tell me about him",
      "how old is he", "where does he", "what does he",
      "who is he", "is he", "does he", "his name", "his age",
      "his skills", "his hobbies", "his job", "his birthday",
      "his contacts", "his email", "his github", "his linkedin"
    ]
    if any(phrase in message for phrase in third_person_triggers):
      return self.third_person_correction()

    # ---- Greetings ----
    if any(word in message for word in ["hello", "hi", "hey"]):
      return self.random_greeting()

    # ---- Contacts — handled here to guarantee exact formatting ----
    if any(word in message for word in ["contact", "contacts", "reach", "social", "facebook", "linkedin", "github", "gmail", "email", "phone", "number"]):
      return CONTACTS

    # ---- Utilities ----
    if any(word in message for word in ["date", "today", "what day"]):
      return self.date_today()

    if any(word in message for word in ["joke", "funny", "make me laugh"]):
      return self.get_joke()

    if any(word in message for word in ["how are you", "how's it going", "you doing"]):
      return self.random_status()

    if any(word in message for word in ["thank", "thanks", "appreciate"]):
      return "No problem! Let me know if you need anything else."

    # ---- Bigram fuzzy match fallback ----
    best_match = None
    best_score = 0.0
    for key in self.default_responses:
      score = self.compare_two_strings(message, key)
      if score > best_score:
        best_score = score
        best_match = key

    if best_score >= 0.6 and best_match:
      response = self.default_responses[best_match]
      return response() if callable(response) else response

    # ---- AI THINKING FALLBACK / Longer response ----
    return await ai_think_async(message)