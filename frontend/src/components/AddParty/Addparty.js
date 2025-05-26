import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import "./Addparty.css"

const Addparty = () => {
  const [customer, setcustomer] = useState({
    name: '',
    phone:'',
    address: ''
  });

  const handleChange = (e) => {
    setcustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customers'), customer);
      alert('Customer added!');
      setcustomer({ name: '',phone:'', address: ''});
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input type="text" name="name" value={customer.name} onChange={handleChange} placeholder="Party Name" required />
      <input type="text" name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone.No" required />
      <input type="text" name="address" value={customer.address} onChange={handleChange} placeholder="Address" required />
      <button type="submit">Add Customer</button>
    </form>
  );
};

export default Addparty;