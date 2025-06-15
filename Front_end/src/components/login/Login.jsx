import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
import bgImage from '../../assets/invoice.jpg'; 

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
    <div className="h-screen w-full bg-[#1e1e2f] flex justify-center items-center">
      <div className="flex w-[70%] h-[550px] rounded-lg overflow-hidden bg-gray-100 shadow-xl">
        
        {/* Image Side */}
        <div
          className="flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>

        {/* Form Side */}
        <div className="flex-1 flex justify-center items-center p-8 bg-white">
          <form
            className="w-full max-w-[350px] flex flex-col"
            onSubmit={handleLogin}
          >
            <h2 className="text-2xl text-center mb-6 text-gray-800 font-semibold">
              Login to Your Account
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-all mb-3"
            >
              Login
            </button>
            <p className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
