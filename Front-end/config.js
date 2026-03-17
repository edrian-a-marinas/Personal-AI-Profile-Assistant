const CONFIG = {
  BACKEND_URL: window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://edrian-personal-ai-assistant.vercel.app"
};