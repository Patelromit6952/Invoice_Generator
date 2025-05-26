import { addDoc, collection, doc, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import Select from "react-select";
import "../Newinvoice/Newinvoice.css"
import CustomMenuList from "./CustomMenuList ";

const Newinvoice = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPrice, setProductPrice] = useState(0);
  const [productQty, setProductQty] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [productList, setProductList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billType,setbillType] = useState("")
  const [pytype,setpytype] = useState("")
  const [selectaddproduct,setselectaddproduct] = useState(false)

const customStyles = {
  control: (provided) => ({
    ...provided,
    width:'364px',
    minHeight: '40px', 
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    boxSizing: 'border-box', 
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '15px', 
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  }),
  placeholder: (provided) => ({
    ...provided,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    lineHeight: 'normal',
    margin: 0,
    padding: '0 8px',
  }),
  singleValue: (provided) => ({
    ...provided,
    top: '50%',

    lineHeight: 'normal',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
};


  useEffect(() => {
     const pathname = window.location.pathname;
    if (pathname === "/dashboard/purchaseinvoice") {
      setbillType("purchase");
    } else {
      setbillType("sales");
    }
    const fetchData = async () => {
  const q = query(collection(db, "customers"), orderBy("name"));
  const customerSnap = await getDocs(q);
  const customerList = customerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setCustomers(customerList);

  const productSnap = await getDocs(query(collection(db, "products"), orderBy("name")));
  const productList = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setProducts(productList);
};
    fetchData();
  }, []);
  
  const customerOptions = customers.map(c => ({
    label: c.name,
    value: c.id,
    data: c,
  }));

  const productOptions = products.map(p => ({
    label: p.name,
    value: p.id,
    data: p,
  }));

  const handleSubmit1 = async () => {
   const grandTotal = productList.reduce((total, item) => total + item.total, 0);

    const invoiceData = {
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      pytype:pytype,
      billType:billType,
      invoiceNo: invoiceNo,
      products:productList,
      uid:selectedCustomer.id,
      grandTotal:grandTotal,
      createdAt: new Date()
    };
  
    try {
      await addDoc(collection(db, "invoices"), invoiceData);
      alert("Invoice saved successfully!");
      window.location.reload()
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save invoice.");
    }
  };
  const handleAddProduct = () => {

    if (!selectedProduct || !productPrice || !productQty) {
      alert("Please fill product details.");
      return;
    }
  
    const newProduct = {
      name: selectedProduct.name,
      hsn: selectedProduct.hsn,
      gst: selectedProduct.gst,
      qtytype:selectedProduct.qtytype,
      price: parseFloat(productPrice),
      quantity: parseInt(productQty),
      total: parseFloat(productPrice) * parseInt(productQty),
    };
    console.log(newProduct);
    
  
    setProductList([...productList, newProduct]);
    setSelectedProduct(null);
    setProductPrice(0);
    setProductQty(0);
  };
   const [product, setProduct] = useState({
      name: '',
      gst: '',
      hsn: '',
      qtytype:''
    });
    
    const handleChange = (e) => {           
      setProduct({ ...product, [e.target.name]: e.target.value});
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await addDoc(collection(db, 'products'), product);
        alert('Product added!');
        // window.location.reload()
        selectaddproduct(false)
        setProduct({ name: '', gst: '', hsn: '' ,qtytype:''});
      } catch (err) {
        console.error('Error adding document: ', err);
      }
    };  
  
const handleAddcustomer = () => {
  
}
const handleEditcustomer = () => {}  
const handleAddproduct = () => {
  setselectaddproduct(true)
}
const handleEditproduct = () => {}  
console.log(productList);

  return (
    <>
    <div className="form-container">
    <h2>Add New Invoice</h2>

  <div className="input-group">
  <div>
     <label>Select Payment Type</label>
      <select className="qtyclass"  name="pytype">
          <option value="" disabled selected>Payment Type</option>
          <option value="cash">Cash</option>
          <option value="debit">Debit</option>
       </select>
  </div>
  <div>
    <label>Select Customer</label>
    <Select
      options={customerOptions}
      styles={customStyles}
      value={selectedCustomer}
      onChange={setSelectedCustomer}
      placeholder="Select Customer"
      components={{ MenuList: CustomMenuList }}
      onAdd={handleAddcustomer}
      onEdit={handleEditcustomer}
    />
  </div>

  <div>
    <label>Invoice No.</label>
    <input type="text" placeholder="INVOICE NO." value={invoiceNo} onChange={(e)=>setInvoiceNo(e.target.value)}/>
  </div>

  <div>
    <label>Select Product</label>
       <Select
      options={productOptions}
      styles={customStyles}
      value={selectedProduct}
      onChange={setSelectedProduct}
      placeholder="Select Product"
      components={{ MenuList: CustomMenuList }}
      onAdd={handleAddproduct}
      onEdit={handleEditproduct}
    />
  </div>

  <div>
    <label>Price</label>
    <input type="number" placeholder="PRICE" value={productPrice} onChange={(e)=>setProductPrice(e.target.value)} />
  </div>

  <div>
    <label>Quantity</label>
    <input type="number" placeholder="QUANTITY  " value={productQty} onChange={(e)=>setProductQty(e.target.value)}/>
  </div>
</div>
  <button className="submit-btn" onClick={handleAddProduct}>Add Product</button>
</div>
<div>
{
    productList.length > 0 && (
      <>
      <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>HSN</th>
          <th>GST</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {productList.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.hsn}</td>
            <td>{item.gst}</td>
            <td>{item.price}</td>
            <td>{item.quantity}</td>
            <td>{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
      <button className="submit-btn1" onClick={handleSubmit1}>Save Data</button>
      </>
    )
  }
</div>

 { 
  selectaddproduct && (
    <div className="addproductpage">
      <form onSubmit={handleSubmit} className="form">
      <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
      <input type="text" name="gst" value={product.gst} onChange={handleChange} placeholder="GST %" required />
      <input type="text" name="hsn" value={product.hsn} onChange={handleChange} placeholder="HSN Code" required />
      <select className="qtyclass"  name="qtytype" onChange={handleChange}>
          <option value="" disabled selected>Qty Type</option>
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="ltr">Liters</option>
          <option value="grams">Grams</option>
          <option value="mtr">Meters</option>
          <option value="units">Units</option>
       </select>
      <button type="submit">Add Product</button>
    </form>
    </div>
  )}
</>

  );
};

export default Newinvoice;
