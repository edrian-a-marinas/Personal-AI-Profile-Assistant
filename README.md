# Ask Edrian 🤖
A personal AI chatbot built with **FastAPI and React**, powered by **Groq AI** — ask about Edrian's skills, projects, background, or just chat!

🔗 **Live:** [edrian-ai-profile-assistant.vercel.app](https://edrian-ai-profile-assistant.vercel.app)

---

## Click to Watch Demo

<a href="https://drive.google.com/file/d/1Vy7cWOe9JEnhf4KeGjeI-g6dNRZ-LtMr/view?usp=sharing" target="_blank">
  <img src="https://edrian-marinas.vercel.app/projects/PersonalAI.webp" alt="Demo Video" width="400" />
</a>

---

## How It Works

The chatbot uses a two-layer response system:

- **Fast replies** — keyword-based responses for common queries (greetings, contacts, date, jokes) returned instantly without hitting the AI
- **Groq AI fallback** — open-ended or complex questions are handled by `llama-3.3-70b-versatile` via Groq API, responding in first person as Edrian

The frontend monitors the backend health every 130 seconds when connected, and retries every 3 seconds if the server goes down — showing a topbar banner on status changes.

---

## Stack

**Back-end:** Python, FastAPI, Groq API, REST API, Vercel  
**Front-end:** React, JavaScript, HTML/CSS, Vercel
