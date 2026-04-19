import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function ContactPage() {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [messageText, setMessageText] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    // Populate user data if logged in
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Load messages if user is logged in
    useEffect(() => {
        if (user) {
            fetchMyMessages();
        }
    }, [user]);

    const fetchMyMessages = async () => {
        try {
            const { data } = await API.get('/contact/my-messages');
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !messageText) {
            setStatus({ type: 'error', message: 'All fields are required' });
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            await API.post('/contact', {
                name,
                email,
                message: messageText,
            });
            setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
            setName(user?.name || '');
            setEmail(user?.email || '');
            setMessageText('');
            
            // Refresh messages if user is logged in
            if (user) {
                setTimeout(fetchMyMessages, 1000);
            }
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Failed to send message' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (messageId) => {
        if (!replyMessage.trim()) {
            setStatus({ type: 'error', message: 'Reply cannot be empty' });
            return;
        }

        setReplyLoading(true);

        try {
            const { data } = await API.post(`/contact/${messageId}/reply`, {
                replyMessage: replyMessage,
            });
            setStatus({ type: 'success', message: 'Reply sent successfully!' });
            setReplyMessage('');
            setSelectedMessage(data.data);
            fetchMyMessages();
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Failed to send reply' 
            });
        } finally {
            setReplyLoading(false);
        }
    };

    return (
        <>
            <Nav />
            <main className="container page">
        
                <section className="section-card">
                    <h1>Get in Touch</h1>
                    <p>Do you have a project idea or a question? Fill out the form below.</p>
                    {!user && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            <strong>Note:</strong> You can send messages without logging in, but you won't be able to receive replies. 
                            <Link to="/login" className="target-link" style={{ marginLeft: '0.5rem' }}>Log in</Link> to receive responses.
                        </p>
                    )}
                    <br />
                    
                    {status && status.message && (
                        <div className={`statusMessage ${status.type}`}>{status.message}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="fullname">Full Name</label>
                            <input 
                                type="text" 
                                id="fullname" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name" 
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com" 
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message">Message</label>
                            <textarea 
                                id="message" 
                                rows="5" 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="How can I help you?" 
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </section>

                {user && (
                    <section className="section-card">
                        <h2>Your Messages ({messages.length})</h2>
                        {messages.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>
                                Once you send a message, your conversation will appear here. You'll be able to see admin replies and respond to them.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {messages.map((msg) => (
                                <div 
                                    key={msg._id}
                                    style={{
                                        padding: '1rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        background: selectedMessage?._id === msg._id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                    }}
                                    onClick={() => setSelectedMessage(selectedMessage?._id === msg._id ? null : msg)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                                                {msg.message.substring(0, 50)}...
                                            </p>
                                            <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            background: msg.replies.length > 0 ? '#28a74524' : '#f59e0b24',
                                            color: msg.replies.length > 0 ? '#28a745' : '#f59e0b'
                                        }}>
                                            {msg.replies.length > 0 ? 'Replied' : 'Pending'}
                                        </div>
                                    </div>

                                    {selectedMessage?._id === msg._id && (
                                        <div 
                                            style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                                                <strong>Your Message:</strong>
                                            </p>
                                            <p>{msg.message}</p>

                                            {msg.replies.length > 0 && (
                                                <div style={{ marginTop: '1.5rem' }}>
                                                    <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                                                        <strong>Replies ({msg.replies.length}):</strong>
                                                    </p>
                                                    {msg.replies.map((reply, idx) => (
                                                        <div 
                                                            key={idx}
                                                            style={{
                                                                padding: '0.75rem',
                                                                marginBottom: '0.75rem',
                                                                background: reply.sentBy === 'admin' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                                                                borderRadius: 'var(--radius-lg)',
                                                                borderLeft: `3px solid ${reply.sentBy === 'admin' ? '#2563eb' : '#a855f7'}`,
                                                            }}
                                                        >
                                                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: '600' }}>
                                                                {reply.sentBy === 'admin' ? 'Admin Reply' : 'Your Reply'}
                                                            </p>
                                                            <p style={{ margin: '0 0 0.25rem 0' }}>{reply.message}</p>
                                                            <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {new Date(reply.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {msg.status === 'open' && (
                                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                                    <label htmlFor="reply" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                                        Add Your Reply:
                                                    </label>
                                                    <textarea
                                                        id="reply"
                                                        rows="3"
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        placeholder="Type your reply here..."
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleReply(msg._id)}
                                                        disabled={replyLoading || !replyMessage.trim()}
                                                        className="btn btn-primary"
                                                        style={{ marginTop: '0.5rem' }}
                                                    >
                                                        {replyLoading ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="section-card">
                    <h2>My Location</h2>
                    <div className="map-placeholder">
                        <iframe id="mapFrame" width="100%" height="100%" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=DMMMSU+South+La+Union+Campus&output=embed"></iframe>
                    </div>
                </section>

                <section className="section-card">
                    <h2>Useful Resources</h2>
                    <p>Here are some tools and websites I use daily for development:</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th width="30%">Resource Name</th>
                                <th width="70%">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Microsoft Learn</strong></td>
                                <td>Official documentation and tutorials for .NET and C#.</td>
                            </tr>
                            <tr>
                                <td><strong>Stack Overflow</strong></td>
                                <td>A community forum for solving specific coding errors.</td>
                            </tr>
                            <tr>
                                <td><strong>MDN Web Docs</strong></td>
                                <td>The ultimate guide for HTML, CSS, and JavaScript standards.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="section-card">
                    <h2>Connect Elsewhere</h2>
                    <ul>
                        <li><a href="https://github.com" className="target-link" target="_blank" rel="noreferrer">View my GitHub Profile</a></li>
                        <li><a href="https://www.facebook.com" className="target-link" target="_blank" rel="noreferrer">Connect on Facebook</a></li>
                    </ul>
                </section>
            </main>

            <footer>
                <div className="container">
                    <p>&copy; 2026 Jayvee Reyes. All Rights Reserved.</p>
                    <p>Contact: myemail@gmail.com | [Province], [Country]</p>
                </div>
            </footer>
        </>
        
    );
}

export default ContactPage;