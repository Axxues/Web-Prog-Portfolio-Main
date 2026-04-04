import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import API from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import '../styles/EditPostPage.css';

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setBody(res.data.body);
        if (res.data.image) setImagePreview(assetUrl(res.data.image));
      })
      .catch(() => setStatus('Could not load post.'));
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      if (image) {
        formData.append('image', image);
      }
      await API.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Post updated.');
      setTimeout(() => navigate(`/posts/${id}`), 1000);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <>
      <Nav />
      <main className="container">
        <section className="edit-post-section">
          <h2>Edit Post</h2>
          {status && <div className={`statusMessage ${status.includes('updated') ? 'success' : 'error'}`}>{status}</div>}
          <form onSubmit={handleSubmit} className="edit-post-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input 
                id="title"
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Enter post title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Content</label>
              <textarea 
                id="body"
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                rows={8} 
                required 
                placeholder="Write your post content here..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="postImage">Featured Image</label>
              <div className="image-upload-section">
                {imagePreview && (
                  <div className="image-preview">
                    <img src={assetUrl(imagePreview)} alt="Preview" />
                  </div>
                )}
                <input
                  id="postImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="postImage" className="btn btn-secondary">
                  Change Image
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </section>
      </main>
    </>
  );
}

export default EditPostPage;
