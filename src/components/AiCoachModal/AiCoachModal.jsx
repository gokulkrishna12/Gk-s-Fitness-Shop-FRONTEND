import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { getAiRecommendation } from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';
import './AiCoachModal.scss';

const AiCoachModal = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI Fitness Coach. Tell me your fitness goals, budget, or what supplements you need, and I'll find the perfect gear for you!"
        }
    ]);

    const messagesEndRef = useRef(null);

    // Auto-scroll to the newest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, loading]);

    // If the user isn't logged in, we hide the widget since the backend route is protected
    if (!isAuthenticated) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const data = await getAiRecommendation(userMsg.content);

            // Extract the response string from the backend output
            // Adjust this depending on exactly what key your backend returns (e.g., data.recommendation)
            const aiText = data.recommendation || data.message || "I found some great options for you!";

            setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the gym right now. Try again later!"
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-coach-wrapper">
            {/* The Floating Chat Panel */}
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="header-info">
                            <Bot size={24} className="bot-icon" />
                            <h3>AI Fitness Coach</h3>
                        </div>
                        <button className="btn-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                Coach is typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <form onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="I want to lose fat, budget is ₹3000..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" className="btn-send" disabled={loading || !query.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* The Floating Action Button */}
            {!isOpen && (
                <button className="chat-fab" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
};

export default AiCoachModal;