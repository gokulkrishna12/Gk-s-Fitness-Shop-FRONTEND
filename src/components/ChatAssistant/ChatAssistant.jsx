import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import './ChatAssistant.scss';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your AI Shopping Assistant. How can I help you find the perfect gear today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isAuthenticated) {
      setMessages(prev => [...prev,
      { text: input, sender: 'user' },
      { text: "Please login to chat with me! I need to know who you are to give personalized recommendations. 🔒", sender: 'ai' }
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai/recommend', { query: userMessage });

      setMessages(prev => [...prev, {
        text: response.data.recommendation,
        sender: 'ai'
      }]);
    } catch (error) {
      console.error("AI Connection Error:", error);
      setMessages(prev => [...prev, {
        text: "Oops! My brain is a little overwhelmed right now. Please try again in a moment.",
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-assistant">
      {isOpen && (
        <div className="chat-assistant-window">
          <div className="chat-assistant-header">
            <div>
              <Sparkles size={20} />
              <span>AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="chat-assistant-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-assistant-message ${msg.sender}`}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-assistant-message ai" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                <Loader2 size={14} className="spinning-loader" style={{ display: 'inline', marginRight: '5px', animation: 'spin 2s linear infinite' }} />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-assistant-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAuthenticated ? "Ask about a product..." : "Login to chat..."}
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* 🔥 THE COMPACT RED MAGICAL AI TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-assistant-toggle"
        >
          <Sparkles size={18} color="#ffffff" />
          <span>AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;