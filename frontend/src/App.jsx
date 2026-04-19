import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import AdminPage from './pages/AdminPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  // Example function to trigger in React (e.g., when a user clicks 'Submit')
  // const handleAddTask = async () => {
  //   const response = await fetch('http://localhost:5000/api/tasks', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ title: "Learn how to use MongoDB!" })
  //   });

  //   const data = await response.json();
  //   console.log("Task saved to database:", data);
  // };

  // useEffect(() => {
  //   // Fetching data from your Node.js backend
  //   fetch('http://localhost:5000/api/data')
  //     .then(response => response.json())
  //     .then(json => setData(json.message))
  //     .catch(error => console.error("Error fetching data:", error));
  // }, []);

  return (
    // <div>
    //   <h1>React & MongoDB Atlas</h1>
    //   <p>Data from database via API: {data ? data : "Loading..."}</p>
    // </div>
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<SplashPage />} />
            <Route path='/home' element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/posts/:id' element={<PostPage />} />
            <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path='/create-post' element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
            <Route path='/edit-post/:id' element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute role='admin'><AdminPage /></ProtectedRoute>} />
            <Route path='/admin/messages' element={<ProtectedRoute role='admin'><AdminMessagesPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}




export default App;
