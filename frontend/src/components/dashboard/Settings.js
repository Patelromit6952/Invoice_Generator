import React, { useState } from 'react'
import '../dashboard/setting.css'
import { auth, db } from '../../firebase'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'

const Settings = () => {

  const [cname,setcname] = useState(localStorage.getItem('cName'))
  const [phone,setphone] = useState(localStorage.getItem('phone'))
  const [address,setaddress] = useState(localStorage.getItem('address'))

  const handlesubmit = () => {

    updateProfile(auth.currentUser, {
      displayName: cname,
    })
    .then(() => {
      return updateDoc(doc(db, "users", localStorage.getItem('uid')), {
        Companyname: cname,
        Phone: phone,
        Address: address,
      });
    })
    .then(() => {
      localStorage.setItem('cName',cname)
      localStorage.setItem('phone',phone)
      localStorage.setItem('address',address)
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error updating profile or document:", error);
    });
  }
  return (
    <div className="form-container1">
  <div className="form-group">
    <label>Company Name</label>
    <input type="text" id="cname" placeholder="Enter customer name" value={cname} onChange={(e)=>setcname(e.target.value)}/>
  </div>

  <div className="form-group">
    <label >Phone</label>
    <input type="tel" id="phone" placeholder="Enter phone number" value={phone} onChange={(e)=>setphone(e.target.value)}/>
  </div>

  <div className="form-group">
    <label >Address</label>
    <textarea id="address" rows="3" placeholder="Enter address" value={address} onChange={(e)=>setaddress(e.target.value)}></textarea>
  </div>

  <div className="form-group">
    <button className="submit-btn" onClick={handlesubmit}>Submit</button>
  </div>
</div>
  )
}

export default Settings