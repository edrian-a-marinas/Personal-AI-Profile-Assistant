// ------------------- Utilities / Helper functions -------------------
function generateId() {
  return crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 10);
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
      const res = await fetch('http://127.0.0.1:8000/api/v1/messages', { 
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
          Ask about Edrian's skills, status, contacts or personal details!
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
function ChatMessage({ message, sender, typing }) {
  return (
    <div className = {
      sender === 'user'
      ? 'chat-message-user'
      : 'chat-message-robot'
    } >
      {sender === 'robot' && (
        <img className="icon" src="./CSS/Images/bot.png" />
      )}

      <div className = "chat-message-text"> 
        <span className={typing ? 'typing' : ''}>
          {message}
        </span>
      </div>

      {sender === 'user' && (
        <img className="icon" src="./CSS/Images/usr.png" />
      )}
    </div>
  );
}


// ------------------- Chat Messages Container Mostly -------------------
function ChatMessages({ chatMessages }) {
  const chatMessagesRef = React.useRef(null);

  React.useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="chat-messages-container" ref={chatMessagesRef}>
      {chatMessages.length === 0 && (
        <p className="welcome-message">
          Hi! I'm Edrian's AI. Ask me anything about Edrian's skills, hobbies, or background.
        </p>
      )}

      {chatMessages.map(chatMessage => (
        <ChatMessage
          message={chatMessage.message}
          sender={chatMessage.sender}
          key={chatMessage.id}
        />
      ))}
    </div>
  );
}


// ------------------- Custom hook: monitor backend server every 5 seconds -------------------
function useServerStatus() {
  const [serverStatus, setServerStatus] = React.useState('connected');
  const [showTopbar, setShowTopbar] = React.useState(false);

  React.useEffect(() => {
    async function checkServer() {
      try {
        await fetch('http://127.0.0.1:8000/api/v1/health', { method: 'GET' }); // checking if the server is fine

        if (serverStatus !== 'connected') {
          setServerStatus('connected');
          setShowTopbar(true);
          setTimeout(() => setShowTopbar(false), 3000);
        }
      } catch {
        if (serverStatus !== 'disconnected') {
          setServerStatus('disconnected');
          setShowTopbar(true);
        }
      }
    }

    checkServer(); // check immediately
    const interval = setInterval(checkServer, 60000);

    return () => clearInterval(interval);
  }, [serverStatus]);

  return { serverStatus, showTopbar };
}


// ------------------- Main App Component -------------------
function App() {
  const [chatMessages, setChatMessages] = React.useState([]);
  const { serverStatus, showTopbar } = useServerStatus();

  return (
    <div className={`app-shell ${showTopbar ? 'with-topbar' : ''}`}>
      {showTopbar && (
        <div className={`server-topbar ${serverStatus}`}>
          {serverStatus === 'connected'
            ? '✅ Server reconnected'
            : '🔴 Server is down. Reconnecting...'}
        </div>
      )}


      <div className="app-container">
        <ChatMessages
          chatMessages={chatMessages}
        />

        <ChatInput
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      </div>
    </div>
  );
}


// ------------------- Render React App into HTML container -------------------
const container = document.querySelector('.js-container');
const containerRoot = ReactDOM.createRoot(container);
containerRoot.render(<App />);

