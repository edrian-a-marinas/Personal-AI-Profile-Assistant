// ------------------- Utilities / Helper functions -------------------
function generateId() {
  return crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 10);
}

// ------------------- Lightbox -------------------
function Lightbox({ onClose }) {
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', backdropFilter: 'blur(4px)',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '340px', width: '100%' }}>
        <img
          src="./Images/Edrian2x2.jpg"
          alt="Edrian Mariñas"
          style={{ width: '100%', borderRadius: '12px', display: 'block', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        />
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '-14px', right: '-14px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '16px', color: '#333', fontWeight: 700,
          }}
        >×</button>
      </div>
    </div>
  )
}

// ------------------- Chat Input Component  -------------------
function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = React.useState('');

  function saveInputText(event) {
    setInputText(event.target.value);
  }

  function enterText(event) {
    if (event.key === 'Enter'){
      sendMessage();
    }
  }

  // Sends message to backend and updates chat state
  async function sendMessage() {
    if (!inputText.trim()) return; // Ignore empty input

    const newChatMessages = [
      ...chatMessages,
      {
        message: inputText,
        sender: 'user',
        id: generateId()

      }
    ];

    setChatMessages(newChatMessages);
    const typingMessage = {
      message: <span className="typing"><span></span></span>,
      sender: 'robot',
      id: generateId(),
      typing: true
    };    
    setChatMessages(prev => [...prev, typingMessage]);
    
    setInputText('');

    // Call Python backend to get AI response 
    try {
      const res = await fetch(`${CONFIG.BACKEND_URL}/api/v1/messages`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Ai response to your chat    
      setChatMessages(prev =>
        prev
          .filter(msg => !msg.typing) 
          .concat({
            message: data.reply,
            sender: 'robot',
            id: generateId()
          })
      );


    } catch (err) {
      console.error(err);
      setChatMessages([
        ...newChatMessages,
        {
          message: 'Server error. Please try again later.',
          sender: 'robot',
          id: generateId()
        }
      ]);
    }


  }

  return (
    <div className="chat-input-wrapper">
      <span className="tooltip-icon">?
        <span className="tooltip-text">
          Ask about my skills, status, contacts or personal details!
        </span>
      </span>

      <div className="chat-input-container">
        <input
          className="chat-input"
          placeholder="Ask me anything about Edrian…"
          size="25"
          onChange={saveInputText}
          onKeyDown={enterText}
          value={inputText}
        />
        <button 
          onClick={sendMessage}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}


// ------------------- Chat Message Component -------------------
function parseLinks(text) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const combined = /(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(09\d{9}|\+63\d{10})|([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?)/g;
    const parts = [];
    let last = 0;
    let match;
    while ((match = combined.exec(line)) !== null) {
      if (match.index > last) parts.push({ type: 'text', value: line.slice(last, match.index) });
      if (match[1])      parts.push({ type: 'url',    value: match[1] });
      else if (match[2]) parts.push({ type: 'email',  value: match[2] });
      else if (match[3]) parts.push({ type: 'phone',  value: match[3] });
      else if (match[4]) parts.push({ type: 'domain', value: match[4] });
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push({ type: 'text', value: line.slice(last) });

    const rendered = parts.map((part, i) => {
      if (part.type === 'url')
        return <a key={i} href={part.value} target="_blank" rel="noopener noreferrer" style={{ color: '#3399ff', cursor: 'pointer', wordBreak: 'break-all' }}>{part.value}</a>;
      if (part.type === 'email')
        return <a key={i} href={`mailto:${part.value}`} style={{ color: '#3399ff', cursor: 'pointer' }}>{part.value}</a>;
      if (part.type === 'phone')
        return <a key={i} href={`tel:${part.value}`} style={{ color: '#3399ff', cursor: 'pointer' }}>{part.value}</a>;
      if (part.type === 'domain')
        return <a key={i} href={`https://${part.value}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3399ff', cursor: 'pointer', wordBreak: 'break-all' }}>{part.value}</a>;
      return <span key={i}>{part.value}</span>;
    });

    return (
      <span key={lineIdx}>
        {rendered}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}

function ChatMessage({ message, sender, typing, onPhotoClick }) {
  return (
    <div className={sender === 'user' ? 'chat-message-user' : 'chat-message-robot'}>
      {sender === 'robot' && (
        <img
          className="icon" src="./Images/Edrian2x2.jpg"
          onClick={onPhotoClick}
          style={{ cursor: 'pointer' }}
        />
      )}
      <div className="chat-message-text">
        {typing
          ? <span className="typing">{message}</span>
          : <span>{typeof message === 'string' ? parseLinks(message) : message}</span>
        }
      </div>
      {sender === 'user' && (
        <img className="icon" src="./Images/usr.png" />
      )}
    </div>
  )
}


// ------------------- Chat Messages Container Mostly -------------------
function ChatMessages({ chatMessages, onPhotoClick }) {
  const chatMessagesRef = React.useRef(null);
  React.useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) containerElem.scrollTop = containerElem.scrollHeight;
  }, [chatMessages]);
  return (
    <div className="chat-messages-container" ref={chatMessagesRef}>
      {chatMessages.length === 0 && (
        <p className="welcome-message">
          Hi! I'm Edrian AI form. Ask me anything about skills, hobbies, or background.
        </p>
      )}
      {chatMessages.map(chatMessage => (
        <ChatMessage
          message={chatMessage.message}
          sender={chatMessage.sender}
          key={chatMessage.id}
          onPhotoClick={onPhotoClick}
        />
      ))}
    </div>
  )
}


// ------------------- Custom hook: monitor backend server every 5 seconds -------------------
function useServerStatus() {
  const HEALTHY_INTERVAL  = 60000;
  const RETRY_INTERVAL    = 3000;
  const RECONNECT_SHOW_MS = 3000;

  const [serverStatus, setServerStatus] = React.useState('connected');
  const [showTopbar,   setShowTopbar]   = React.useState(false);

  const statusRef          = React.useRef('connected');
  const timeoutRef         = React.useRef(null);
  const reconnectBannerRef = React.useRef(null);

  const setStatus = React.useCallback((next) => {
    statusRef.current = next;
    setServerStatus(next);
  }, []);

  React.useEffect(() => {
    function schedule(delay) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(check, delay);
    }

    async function check() {
      try {
        await fetch(`${CONFIG.BACKEND_URL}/api/v1/health`, { method: 'GET' });

        if (statusRef.current !== 'connected') {
          setStatus('connected');
          setShowTopbar(true);
          if (reconnectBannerRef.current) clearTimeout(reconnectBannerRef.current);
          reconnectBannerRef.current = setTimeout(() => setShowTopbar(false), RECONNECT_SHOW_MS);
        }

        schedule(HEALTHY_INTERVAL);

      } catch {
        if (statusRef.current !== 'disconnected') {
          setStatus('disconnected');
          setShowTopbar(true);
          if (reconnectBannerRef.current) clearTimeout(reconnectBannerRef.current);
        }
        schedule(RETRY_INTERVAL);
      }
    }

    check();

    return () => {
      if (timeoutRef.current)         clearTimeout(timeoutRef.current);
      if (reconnectBannerRef.current) clearTimeout(reconnectBannerRef.current);
    };
  }, []);

  return { serverStatus, showTopbar };
}


// ------------------- Main App Component -------------------
function App() {
  const [chatMessages, setChatMessages] = React.useState([]);
  const [lightbox, setLightbox] = React.useState(false);
  const { serverStatus, showTopbar } = useServerStatus();
  return (
    <div className={`app-shell ${showTopbar ? 'with-topbar' : ''}`}>
      {lightbox && <Lightbox onClose={() => setLightbox(false)} />}
      {showTopbar && (
        <div className={`server-topbar ${serverStatus}`}>
          {serverStatus === 'connected' ? '✅ Server reconnected' : '🔴 Server is down. Reconnecting...'}
        </div>
      )}
      <div className="app-container">
        <ChatMessages chatMessages={chatMessages} onPhotoClick={() => setLightbox(true)} />
        <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
      </div>
    </div>
  )
}


// ------------------- Render React App into HTML container -------------------
const container = document.querySelector('.js-container');
const containerRoot = ReactDOM.createRoot(container);
containerRoot.render(<App />);

