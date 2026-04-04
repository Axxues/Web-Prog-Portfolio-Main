import { useState } from 'react';
import Nav from '../components/Nav';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePostPage.css';

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

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
      const { data } = await API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Post created successfully.');
      navigate(`/posts/${data._id}`);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Create failed');
    }
  };

  return (
    <>
      <Nav />
      <main className="container">
        <section className="create-post-section">
          <h2>Create Post</h2>
          {status && <div className={`statusMessage ${status.includes('successfully') ? 'success' : 'error'}`}>{status}</div>}
          <form onSubmit={handleSubmit} className="create-post-form">
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
                    <img src={imagePreview} alt="Preview" />
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
                  Choose Image
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Publish Post</button>
          </form>
        </section>
      </main>
    </>
  );
}

export default CreatePostPage;
