import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      sender: 'You',
      text: userMessage,
      type: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3000/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'Bot',
        text: data.reply || 'Sorry, I could not answer that.',
        type: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'Bot',
        text: 'Sorry, something went wrong.',
        type: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        id="chatbot-toggle"
        className="chatbot-toggle"
        onClick={handleToggle}
        aria-label="Open chatbot"
      >
        💬
      </button>

      {/* Chat Box */}
      <div className={`chatbot-box ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <span>🌱 Bloom Assistant</span>
          <button
            onClick={handleClose}
            className="chatbot-close"
            aria-label="Close chatbot"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.length === 0 && (
            <div className="chatbot-welcome">
              <p>Hi {user.name || 'there'}! 👋</p>
              <p>I'm your agricultural assistant. Ask me anything about farming, crops, or agriculture!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`chatbot-message ${message.type}`}>
              <span className="sender">{message.sender}:</span>
              <span className="text">{message.text}</span>
            </div>
          ))}

          {isTyping && (
            <div className="chatbot-message bot typing">
              <span className="sender">Bot:</span>
              <span className="text">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="chatbot-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about agriculture..."
            className="chatbot-input"
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !inputValue.trim()}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
