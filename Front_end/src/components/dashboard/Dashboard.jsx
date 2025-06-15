import React from 'react'
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
    signOut(auth).then(() => {
      localStorage.clear()
      toast.success("Logout Successfully")
      navigate('/login')
    }).catch((error) => {
      toast.error(error.message)
    })
  }
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/5 bg-[#282c34] flex flex-col overflow-y-auto">
        <div className="flex items-center gap-5 p-4 border-b-4 border-white h-1/5 text-white">
          <img src={profile} alt="profile-pic" className="w-24 h-24 rounded-full object-cover" />
          <Link to="/dashboard/setting" className="text-lg font-bold">{localStorage.getItem('cName')}</Link>
        </div>
        <nav className="flex flex-col gap-4 mt-5 px-2">
          <Link to="/dashboard/home" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <IoMdHome size={22} className="mr-2" /> Home
          </Link>
          <Link to="/dashboard/purchaseinvoice" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <FaShoppingBag size={22} className="mr-2" /> Purchase Bill
          </Link>
          <Link to="/dashboard/sellsinvoice" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <FaFileInvoiceDollar size={22} className="mr-2" /> Sales Bill
          </Link>
          <Link to="/dashboard/acledger" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <IoIosSettings size={25} className="mr-2" /> A/C Ledger
          </Link>
          <Link to="/dashboard/cbentry" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <IoIosSettings size={25} className="mr-2" /> Cash/Bank Entry
          </Link>
          <Link to="/dashboard/invoices" className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition">
            <FaFileInvoice size={22} className="mr-2" /> Invoices
          </Link>
          <button
            onClick={logout}
            className="flex items-center text-white text-xl p-4 hover:bg-blue-600 transition text-left w-full bg-transparent border-none cursor-pointer"
          >
            <MdLogout size={25} className="mr-2" /> Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-gray-200 p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard
