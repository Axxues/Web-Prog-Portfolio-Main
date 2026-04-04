import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/assetUrl';
import '../styles/HomePage.css';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/posts');
      setPosts(res.data);
      res.data.forEach((post) => fetchComments(post._id));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
    setLoading(false);
  };

  const fetchComments = async (postId) => {
    try {
      const res = await API.get(`/comments/post/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (error) {
      console.error(`Failed to fetch comments for post ${postId}:`, error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const body = commentText[postId]?.trim();
    if (!body) return;
    
    try {
      await API.post('/comments', { postId, body });
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  if (loading) return <><Nav /><main className="container"><p>Loading posts...</p></main></>;

  return (
    <>
      <Nav />
      <main className="container page">
        <section className="section-card home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <p className="home-kicker">Personal portfolio + community blog</p>
              <h1>Welcome to My Coding Journey</h1>
              <p className="home-subtitle">
                I’m a Computer Science student focusing on C# and full‑stack web development—sharing what I learn as I build.
              </p>
              <div className="home-hero-actions">
                <Link to="/about" className="btn btn-secondary">About me</Link>
                <Link to="/register" className="btn btn-primary">Join & post</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-card feed">
          <div className="feed-header">
            <h2>Latest Posts</h2>
            <p className="feed-muted">Fresh updates from the community.</p>
          </div>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <div className="post-author-info">
                      <div className="author-avatar">{post.author?.name?.charAt(0)?.toUpperCase()}</div>
                      <div className="author-details">
                        <div className="author-name">{post.author?.name || 'Unknown'}</div>
                        <div className="post-timestamp">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                    {post.image && <img src={assetUrl(post.image)} alt={post.title} className="post-image" />}
                  </div>

                  <div className="post-actions">
                    <Link to={`/posts/${post._id}`} className="btn btn-secondary">View full post</Link>
                  </div>

                  <div className="comments-section">
                    <div className="comments-header">
                      <span className="comment-count">{comments[post._id]?.length || 0} Comments</span>
                    </div>

                    <div className="comments-list">
                      {comments[post._id]?.map((comment) => (
                        <div key={comment._id} className="comment">
                          <div className="comment-author">{comment.author?.name || 'Unknown'}</div>
                          <div className="comment-body">{comment.body}</div>
                          <div className="comment-time">
                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </div>
                        </div>
                      ))}
                    </div>

                    {user ? (
                      <div className="comment-form">
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                          className="comment-input"
                          rows="2"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post._id)}
                          className="btn btn-primary"
                        >
                          Post Comment
                        </button>
                      </div>
                    ) : (
                      <div className="comment-login-prompt">
                        <Link to="/login">Log in</Link> to comment
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section-card previews">
          <article>
            <h3>Who Am I?</h3>
            <p>Learn more about my background as a BSCS student and my passion for solving real-world problems through code.</p>
            <p><Link to="/about" className="target-link">Read my full story &rarr;</Link></p>
          </article>
          <article>
            <h3>Join the Community</h3>
            <p>Register to create posts, comment, and manage your profile.</p>
            <p><Link to="/register" className="target-link">Sign Up Now &rarr;</Link></p>
          </article>
        </section>
      </main>
    </>
  );
}

export default HomePage;