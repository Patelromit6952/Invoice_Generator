import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
import bgImage from '../../assets/invoice.jpg'; 

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cname, setCname] = useState('');
  const navigate = useNavigate();

    const handleregister = (e) => {
    e.preventDefault()
    createUserWithEmailAndPassword(auth, email, password)
      .then(newUser => {
        updateProfile(newUser.user, { displayName: cname })
        setDoc(doc(db, "users", newUser.user.uid), {
          uid: newUser.user.uid,
          Companyname: cname,
          Email: email,
          Phone: "",
          Address: ""
        })
        toast.success("User Registered")
        localStorage.setItem('uid', newUser.user.uid)
        localStorage.setItem('cName', newUser.user.displayName)
        navigate('/login')
      })
      .catch(err => toast.error(err.message))
  }

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
            onSubmit={handleregister}
          >
            <h2 className="text-2xl text-center mb-6 text-gray-800 font-semibold">
              Login to Your Account
            </h2>
             <input
              type="text"
              placeholder="Company Name"
              value={email}
              onChange={(e) => setCname(e.target.value)}
              required
              className="p-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
