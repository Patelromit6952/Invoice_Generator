import React, { useState } from 'react'
import './register.css'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast'

const Register = () => {
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [displayname, setdisplayname] = useState('')
  const navigate = useNavigate()

  const submithandler = (e) => {
    e.preventDefault()
    createUserWithEmailAndPassword(auth, email, password)
      .then(newUser => {
        updateProfile(newUser.user, { displayName: displayname })
        setDoc(doc(db, "users", newUser.user.uid), {
          uid: newUser.user.uid,
          Companyname: displayname,
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
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left" />
        <div className="auth-right">
          <form className="auth-form" onSubmit={submithandler}>
            <h2 className="auth-heading">Register Your Company</h2>
            <input type="text" placeholder="Company Name" className="auth-input" onChange={(e) => setdisplayname(e.target.value)} required />
            <input type="email" placeholder="Email" className="auth-input" onChange={(e) => setemail(e.target.value)} required />
            <input type="password" placeholder="Password" className="auth-input" onChange={(e) => setpassword(e.target.value)} required />
            <button type="submit" className="auth-btn">Register</button>
            <p className="auth-link-text">
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
