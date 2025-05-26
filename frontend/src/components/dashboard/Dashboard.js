import React from 'react'
import './dashboard.css'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import profile from '../../assets/profile.jpg'
import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'
import toast from 'react-hot-toast'
import { IoMdHome } from "react-icons/io";
import { FaFileInvoice } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate()
  const logout = () => {
    signOut(auth).then(()=>{
      localStorage.clear()
      toast.success("LogOut Successfully")
      navigate('/login')
    }).catch((error)=>{
      toast.error(error.message)
    })
  }
  return (
    <div className='dashboard-wrapper'>
        <div className='side-nav'>
            <div className='profile'>
              <img src={profile} className='profile-pic' alt='profile-pic'/>
              <p>{localStorage.getItem('cName')}</p>
            </div>
            <div className='navbar'>
                    <Link to='/dashboard/home' className='nav-items'><IoMdHome size={22} style={{marginRight:'5px'}}/>Home</Link>
                    <Link to='/dashboard/purchaseinvoice'className='nav-items'><FaShoppingBag size={22} style={{marginRight:'5px'}}/>Purchase Bill</Link>
                    <Link to='/dashboard/sellsinvoice'className='nav-items'><FaFileInvoiceDollar size={22} style={{marginRight:'5px'}}/>Sales Bill</Link>
                    <Link to='/dashboard/invoices' className='nav-items'><FaFileInvoice size={22} style={{marginRight:'5px'}}/>Invoices</Link>
                    <Link to='/dashboard/setting'className='nav-items'><IoIosSettings size={25} style={{marginRight:'5px'}}/>Settings</Link>
                    <button onClick={logout} className='nav-items'><MdLogout size={25} style={{marginRight:'5px'}}/>Logout</button>
            </div>
        </div>
        <div className='main-container'>
            <Outlet/>
        </div>
    </div>
  )
}

export default Dashboard