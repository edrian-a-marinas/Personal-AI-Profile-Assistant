import random
import requests
from datetime import datetime
from ai_brain import ai_think_async

class Chatbot:
  def __init__(self):
    self.default_responses = {
      "introduce yourself": self.introduce,
      "your name": self.fullName,
      "nickname": lambda: "Call me Ian for short",
      "degree": lambda: "I'm currently taking up BS in Information Technology at Our Lady of Fatima University.",
      "hello": self.random_greeting,
      "hi": self.random_greeting,
      "how are you": self.random_status,
      "thank you": lambda: "No problem! Let me know if you need anything else.",
      "age": lambda: f"I'm {self.age()}",
      "when is your birthday": lambda: "My birthday is January 27, 2004.",
      "where do you live": self.whereLive,
      "hobbies": lambda: "I enjoy coding and listening to music.",
      "skills": lambda: "My skills include Python, FastAPI, PostgreSQL, MySQL, React, TypeScript, JavaScript, SQL, and HTML/CSS.",
      "gender": lambda: "I'm male.",
      "favorite movie": lambda: "My favorite movie is Knives Out.",
      "favorite show": lambda: "My favorite show is Breaking Bad.",
      "favorite anime": lambda: "One Piece is my favorite anime.",
      "favorite language": lambda: "My favorite programming language is Python.",
      "status": self.jobHunt,
      "do you job": self.jobHunt,
      "employed": self.jobHunt,
      "social": self.my_contacts,
      "date today": self.date_today,
      "tell me a joke": self.get_joke,
    }

  # ---------- Identity ----------
  def introduce(self):
    return f"I'm {self.fullName()}, {self.age()} {self.whereLive()} {self.jobHunt()}"

  def age(self):
    return "22 years old."

  def fullName(self):
    return "Edrian Aldrin C. Marinas"

  def whereLive(self):
    return "I live in Manila, Philippines."

  def jobHunt(self):
    return "I'm currently looking for Software or Web development positions."

  def my_contacts(self):
    return (
      "Facebook: https://facebook.com/edri.a.marinas\n"
      "LinkedIn: https://linkedin.com/in/edrian-a-marinas\n"
      "GitHub: https://github.com/edrian-a-marinas\n"
      "Gmail: edrian.a.marinas@gmail.com\n"
      "Portfolio: https://edrian-marinas.vercel.app"
    )

  def my_portfolio(self):
    return "You can check out my experience and projects on my portfolio: https://edrian-marinas.vercel.app"

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

    # ---- Identity ----
    if any(word in message for word in ["introduce", "about yourself", "about you", "who are you"]):
      return self.introduce()

    if any(word in message for word in ["name"]):
      return self.fullName()

    if any(word in message for word in ["nickname", "call you"]):
      return "Call me Ian for short."

    if any(word in message for word in ["age", "old are you", "how old"]):
      return "I'm 22 years old."

    if any(word in message for word in ["birthday", "born"]):
      return "My birthday is January 27, 2004."

    if any(word in message for word in ["live", "location", "from", "where are you"]):
      return self.whereLive()

    if any(word in message for word in ["gender", "sex"]):
      return "I'm male."

    # ---- Education ----
    if any(word in message for word in ["degree", "course", "university", "school", "college", "study", "student"]):
      return "I'm currently taking up BS in Information Technology at Our Lady of Fatima University."

    # ---- Career ----
    if any(word in message for word in ["job", "work", "employed", "employment", "status", "looking", "career", "position", "hire", "hiring"]):
      return self.jobHunt()

    # ---- Experience / Projects / Portfolio ----
    if any(word in message for word in ["experience", "project", "projects", "portfolio", "built", "worked on", "previous"]):
      return self.my_portfolio()

    # ---- Skills & Interests ----
    if any(word in message for word in ["skill", "skills", "tech", "stack", "technologies", "tools", "know", "expertise"]):
      return "My skills include Python, FastAPI, PostgreSQL, MySQL, React, TypeScript, JavaScript, SQL, and HTML/CSS."

    if any(word in message for word in ["interest", "interests", "passion", "passionate", "enjoy", "love doing"]):
      return "I'm passionate about Python and backend development. I also enjoy coding and listening to music."

    if any(word in message for word in ["hobby", "hobbies"]):
      return "I enjoy coding and listening to music."

    # ---- Favorites ----
    if any(word in message for word in ["favorite language", "fav language", "programming language"]):
      return "My favorite programming language is Python."

    if any(word in message for word in ["favorite movie", "fav movie"]):
      return "My favorite movie is Knives Out."

    if any(word in message for word in ["favorite show", "fav show", "tv show"]):
      return "My favorite show is Breaking Bad."

    if any(word in message for word in ["favorite anime", "fav anime", "anime"]):
      return "One Piece is my favorite anime."

    # ---- Contacts / Social ----
    if any(word in message for word in ["contact", "contacts", "social", "reach", "facebook", "linkedin", "github", "gmail", "email"]):
      return self.my_contacts()

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