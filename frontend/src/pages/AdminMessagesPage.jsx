import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import '../styles/AdminPage.css';

function AdminMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home');
      return;
    }
    fetchAllMessages();
  }, [user, navigate]);

  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/contact/admin/all-messages');
      setMessages(data);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to load messages' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setStatus({ type: 'error', message: 'Reply cannot be empty' });
      return;
    }

    setReplySending(true);

    try {
      const { data } = await API.post(`/contact/admin/${selectedMessage._id}/reply`, {
        replyMessage: replyText,
      });
      setSelectedMessage(data.data);
      setReplyText('');
      setStatus({ type: 'success', message: 'Reply sent successfully!' });
      
      // Refresh messages list
      setTimeout(fetchAllMessages, 1000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send reply' 
      });
    } finally {
      setReplySending(false);
    }
  };

  const handleCloseMessage = async (messageId) => {
    try {
      await API.patch(`/contact/admin/${messageId}/close`);
      setStatus({ type: 'success', message: 'Message closed' });
      fetchAllMessages();
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to close message' });
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main className="container page">
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading messages...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: '1200px' }}>
        <section className="section-card">
          <h2>Message Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Total Messages: {messages.length} | Pending: {messages.filter(m => m.status === 'open' && m.replies.length === 0).length}
          </p>
        </section>

        {status && status.message && (
          <div className={`statusMessage ${status.type}`} style={{ marginBottom: '1.5rem' }}>
            {status.message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Messages List */}
          <div>
            <section className="section-card">
              <h3>Messages</h3>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No messages yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      onClick={() => setSelectedMessage(msg)}
                      style={{
                        padding: '1rem',
                        border: selectedMessage?._id === msg._id ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        background: selectedMessage?._id === msg._id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', fontSize: '0.95rem' }}>
                            {msg.name}
                          </p>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {msg.email}
                          </p>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {msg.message.substring(0, 60)}...
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: msg.status === 'closed' ? '#dc354524' : '#28a74524',
                            color: msg.status === 'closed' ? '#dc3545' : '#28a745',
                          }}>
                            {msg.status === 'closed' ? 'Closed' : 'Open'}
                          </span>
                          {msg.replies.length > 0 && (
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: '#2563eb24',
                              color: '#2563eb',
                            }}>
                              {msg.replies.length} reply
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Message Details */}
          <div>
            {selectedMessage ? (
              <section className="section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Message Details</h3>
                  {selectedMessage.status === 'open' && (
                    <button
                      onClick={() => handleCloseMessage(selectedMessage._id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Close
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    FROM
                  </p>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>{selectedMessage.name}</p>
                  <p style={{ margin: '0', color: 'var(--text-muted)' }}>{selectedMessage.email}</p>
                </div>

                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    MESSAGE
                  </p>
                  <p style={{ margin: '0', lineHeight: '1.6' }}>{selectedMessage.message}</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Replies */}
                {selectedMessage.replies.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 1rem 0', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      CONVERSATION ({selectedMessage.replies.length})
                    </p>
                    {selectedMessage.replies.map((reply, idx) => (
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
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: '600' }}>
                          {reply.sentBy === 'admin' ? '👤 You' : '👤 User'}
                        </p>
                        <p style={{ margin: '0 0 0.25rem 0' }}>{reply.message}</p>
                        <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {selectedMessage.status === 'open' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Send Reply:
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'inherit',
                        marginBottom: '0.75rem',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={replySending || !replyText.trim()}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      {replySending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                )}

                {selectedMessage.status === 'closed' && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(220, 53, 69, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    textAlign: 'center',
                    color: '#dc3545',
                  }}>
                    This message is closed. You cannot reply.
                  </div>
                )}
              </section>
            ) : (
              <section className="section-card">
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  Select a message to view details
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminMessagesPage;
