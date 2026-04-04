import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/Nav';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/assetUrl';

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    API.get(`/posts/${id}`).then((res) => setPost(res.data)).catch(() => setStatus('Could not load post.'));
    API.get(`/comments/post/${id}`).then((res) => setComments(res.data)).catch(() => setComments([]));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await API.post('/comments', { postId: id, body: comment });
      setComment('');
      const res = await API.get(`/comments/post/${id}`);
      setComments(res.data);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save comment.');
    }
  };

  if (!post) return <><Nav /><main className="container page"><section className="section-card"><h2>Loading post...</h2></section></main></>;

  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: 980 }}>
        <section className="section-card">
          <h2>{post.title}</h2>
          <p style={{ color: 'var(--text-muted)' }}>By {post.author?.name || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
          {post.image && <img src={assetUrl(post.image)} alt={post.title} style={{ width: '100%', marginTop: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }} />}
          <p>{post.body}</p>
          <h3>Comments</h3>
          {comments.length === 0 && <p>No comments yet.</p>}
          <ul>
            {comments.map((c) => <li key={c._id}><strong>{c.author?.name || 'Guest'}:</strong> {c.body}</li>)}
          </ul>
          {user ? (
            <form onSubmit={handleSubmit}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." rows={3} required />
              <button type="submit" className="btn btn-primary">Post comment</button>
            </form>
          ) : <p>Log in to leave a comment.</p>}
          {status && <p className="statusMessage error">{status}</p>}
        </section>
      </main>
    </>
  );
}

export default PostPage;
