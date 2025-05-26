import React, { useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem('uid', user.uid);
        localStorage.setItem('cName', user.displayName);
        toast.success("Logged in Successfully");
        navigate('/dashboard');
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className='auth-wrapper'>
      <div className='auth-container'>
        <div className='auth-image-side'></div>
        <div className='auth-form-side'>
          <form className='auth-form' onSubmit={handleLogin}>
            <h2 className='auth-title'>Login to Your Account</h2>
            <input 
              type="email" 
              placeholder='Email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder='Password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type='submit' className='auth-button'>Login</button>
            <p className="auth-link-text">
              Don't have an account? <Link to='/register'>Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
