import React, { useState } from 'react';
import { db } from '../../firebase';
import Select from 'react-select';
import { collection, addDoc } from 'firebase/firestore';
import "./Addproduct.css"

const Addproduct = () => {
  const [product, setProduct] = useState({
    name: '',
    gst: '',
    hsn: '',
    qtytype:''
  });


  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), product);
      alert('Product added!');
      setProduct({ name: '', gst: '', hsn: '',qtytype:'' });
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
      <input type="text" name="gst" value={product.gst} onChange={handleChange} placeholder="GST %" required />
      <input type="text" name="hsn" value={product.hsn} onChange={handleChange} placeholder="HSN Code" required />
     <select class="custom-select" name="qtytype" className='qtyclass1' onChange={handleChange}>
          <option value="" disabled selected>Qty Type</option>
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="ltr">Liters</option>
          <option value="grm">Grams</option>
          <option value="mtrs">Meters</option>
          <option value="units">Units</option>
      </select>
      <button type="submit">Add Product</button>
    </form>
  );
};

export default Addproduct;