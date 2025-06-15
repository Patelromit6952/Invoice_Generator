import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';

const Settings = () => {
  const [cname, setcname] = useState('');
  const [phone, setphone] = useState('');
  const [address, setaddress] = useState('');

  const fetchData = async () => {
    try {
      const userRef = doc(db, "users", localStorage.getItem('uid'));
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setcname(data.Companyname ?? '');   // Use ?? '' to avoid undefined
        setphone(data.Phone ?? '');
        setaddress(data.Address ?? '');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        localStorage.setItem('cName', cname);
        localStorage.setItem('phone', phone);
        localStorage.setItem('address', address);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating profile or document:", error);
      });
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 border border-gray-300 bg-white rounded-md shadow-md font-sans">
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Company Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Enter company name"
          value={cname ?? ''} // Ensures controlled input
          onChange={(e) => setcname(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Phone</label>
        <input
          type="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Enter phone number"
          value={phone ?? ''}
          onChange={(e) => setphone(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Address</label>
        <textarea
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Enter address"
          value={address ?? ''}
          onChange={(e) => setaddress(e.target.value)}
        ></textarea>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handlesubmit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Settings;
