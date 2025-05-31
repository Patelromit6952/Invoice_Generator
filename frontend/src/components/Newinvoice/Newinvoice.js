import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import Select from "react-select";
import "../Newinvoice/Newinvoice.css";
import CustomMenuList from "./CustomMenuList ";
import toast from 'react-hot-toast';

const Newinvoice = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPrice, setProductPrice] = useState(0);
  const [productQty, setProductQty] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [productList, setProductList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billType, setbillType] = useState("");
  const [pytype, setpytype] = useState("");
  const [selectaddproduct, setselectaddproduct] = useState(false);
  const [selectaddcustomer, setselectaddcustomer] = useState(false);
  const [selecteditproduct, setselecteditproduct] = useState(false);
  const [selecteditcustomer, setselecteditcustomer] = useState(false);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "364px",
      minHeight: "40px",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
      boxSizing: "border-box",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "15px"
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0",
      display: "flex",
      alignItems: "center",
      height: "100%"
    }),
    placeholder: (provided) => ({
      ...provided,
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      lineHeight: "normal",
      margin: 0,
      padding: "0 8px"
    }),
    singleValue: (provided) => ({
      ...provided,
      top: "50%",

      lineHeight: "normal"
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0
    })
  };

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/dashboard/purchaseinvoice") {
      setbillType("purchase");
    } else {
      setbillType("sales");
    }

    const fetchData = async () => {
      const customerSnap = await getDocs( query(collection(db, "customers"), orderBy("name")));
      const customerList = customerSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);

      const productSnap = await getDocs(query(collection(db, "products"), orderBy("name")));
      const productList = productSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    };

    fetchData();
  }, []);

  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: c.id,
    data: c
  }));

  const productOptions = products.map((p) => ({
    label: p.name,
    value: p.id,
    data: p
  }));

  const handleSubmit1 = async () => {
    const grandTotal = productList.reduce(
      (total, item) => total + item.total,
      0
    );

    const invoiceData = {
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerAddress: selectedCustomer?.address,
      pytype,
      billType,
      invoiceNo,
      products: productList,
      uid: selectedCustomer?.id,
      grandTotal,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "invoices"), invoiceData);
      toast.success("Invoice Saved Successfully")
      window.location.reload();
    } catch (error) {
      toast.success("Failed to Save invoice")
    }
  };

  const handleAddProducts = () => {
    if (!selectedProduct || !productPrice || !productQty) {
      toast.error("Please fill product details.")
      return;
    }

    const newProduct = {
      name: selectedProduct.name,
      hsn: selectedProduct.hsn,
      gst: selectedProduct.gst,
      qtytype: selectedProduct.qtytype,
      price: parseFloat(productPrice),
      quantity: parseInt(productQty),
      total: parseFloat(productPrice) * parseInt(productQty)
    };

    setProductList([...productList, newProduct]);
    setSelectedProduct(null);
    setProductPrice(0);
    setProductQty(0);
    toast.success("Product Added")
  };

  const [product, setProduct] = useState({
    name: "",
    gst: "",
    hsn: "",
    qtytype: ""
  });
  const [customer, setcustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const handleChangecustomer = (e) => {
    setcustomer({ ...customer, [e.target.name]: e.target.value });
  };
  const handleChangeproduct = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmitproduct = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      const newProduct = { id: docRef.id, ...product };

      setProducts((prevProducts) => [...prevProducts, newProduct]);

      toast.success("Product Added")
      setselectaddproduct(false);
      setProduct({ name: "", gst: "", hsn: "", qtytype: "" });
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  const handleSubmitcustomer = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "customers"), customer);
      const newcust = { id: docRef.id, ...customer };
      setCustomers((prevCustomers) => [...prevCustomers, newcust]);
      toast.success("Customer Added")
      setselectaddcustomer(false);
      setcustomer({ name: "", phone: "", address: "" });
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  const handleupdatecustomer = async (e) => {
  e.preventDefault();
  try {
    const docRef = doc(db, "customers", selectedCustomer.id);
    await updateDoc(docRef, customer);
    toast.success("customer Updated")
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id ? { ...c, ...customer } : c
      )
    );
    setselecteditcustomer(false);
  } catch (error) {
    console.error("Error updating customer:", error);
    toast.error("Failed to update customer.")
  }
};

const handleupdateproduct = async (e) => {
  e.preventDefault();
  try {
    const docRef = doc(db, "products", selectedProduct.id);
    await updateDoc(docRef, product);
    toast.error("Product updated!")
    // Update local state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? { ...p, ...product } : p
      )
    );
    setselecteditproduct(false);
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product.")
  }
};
const handleEditproduct = () => {
  setProduct({...selectedProduct});
  setselecteditproduct(true);
};

const handleEditcustomer = () => {
  setcustomer({...selectedCustomer});
  setselecteditcustomer(true);
};

const handleAddcustomer = () => setselectaddcustomer(true);
  const handleAddproduct = () => setselectaddproduct(true);

  return (
    <>
      <div className="form-container">
        <h2>Add New Invoice</h2>
        <div className="input-group">
          <div>
            <label>Select Payment Type</label>
            <select
              className="qtyclass"
              name="pytype"
              value={pytype}
              onChange={(e) => setpytype(e.target.value)}
            >
              <option value="">Payment Type</option>
              <option value="Cash">Cash</option>
              <option value="Debit">Debit</option>
            </select>
          </div>
          <div>
            <label>Select Customer</label>
            <Select
              options={customerOptions}
              styles={customStyles}
              value={
                selectedCustomer &&
                customerOptions.find((opt) => opt.value === selectedCustomer.id)
              }
              onChange={(option) => setSelectedCustomer(option.data)}
              placeholder="Select Customer"
              components={{ MenuList: CustomMenuList }}
              onAdd={handleAddcustomer}
              onEdit={handleEditcustomer}
            />
          </div>
          <div>
            <label>Invoice No.</label>
            <input
              type="text"
              placeholder="INVOICE NO."
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div>
            <label>Select Product</label>
            <Select
              options={productOptions}
              styles={customStyles}
              value={
                selectedProduct &&
                productOptions.find((opt) => opt.value === selectedProduct.id)
              }
              onChange={(option) => setSelectedProduct(option.data)}
              placeholder="Select Product"
              components={{ MenuList: CustomMenuList }}
              onAdd={handleAddproduct}
              onEdit={handleEditproduct}
            />
          </div>
          <div>
            <label>Price</label>
            <input
              type="number"
              placeholder="PRICE"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <div>
            <label>Quantity</label>
            <input
              type="number"
              placeholder="QUANTITY"
              value={productQty}
              onChange={(e) => setProductQty(e.target.value)}
            />
          </div>
        </div>
        <button className="submit-btn" onClick={handleAddProducts}>
          Add Product
        </button>
      </div>

      {productList.length > 0 && (
        <div>
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
          <button className="submit-btn1" onClick={handleSubmit1}>
            Save Data
          </button>
        </div>
      )}

      {selectaddproduct && (
        <div
          className="modal-backdrop"
          onClick={() => setselectaddproduct(false)}
        >
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitproduct} className="form">
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChangeproduct}
                placeholder="Product Name"
                required
              />
              <input
                type="text"
                name="gst"
                value={product.gst}
                onChange={handleChangeproduct}
                placeholder="GST %"
                required
              />
              <input
                type="text"
                name="hsn"
                value={product.hsn}
                onChange={handleChangeproduct}
                placeholder="HSN Code"
                required
              />
              <select
                class="custom-select"
                name="qtytype"
                className="qtyclass1"
                onChange={handleChangeproduct}
              >
                <option value="" disabled selected>
                  Qty Type
                </option>
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="ltr">Liters</option>
                <option value="grm">Grams</option>
                <option value="mtrs">Meters</option>
                <option value="units">Units</option>
              </select>
              <button type="submit">Add Product</button>
            </form>
          </div>
        </div>
      )}

      {selectaddcustomer && (
        <div
          className="modal-backdrop"
          onClick={() => setselectaddcustomer(false)}
        >
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitcustomer} className="form">
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChangecustomer}
                placeholder="Party Name"
                required
              />
              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleChangecustomer}
                placeholder="Phone.No"
                required
              />
              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleChangecustomer}
                placeholder="Address"
                required
              />
              <button type="submit">Add Customer</button>
            </form>
          </div>
        </div>
      )}

       {selecteditproduct && (
        <div
          className="modal-backdrop"
          onClick={() => setselecteditproduct(false)}
        >
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleupdateproduct} className="form">
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChangeproduct}
                placeholder="Product Name"
                required
              />
              <input
                type="text"
                name="gst"
                value={product.gst}
                onChange={handleChangeproduct}
                placeholder="GST %"
                required
              />
              <input
                type="text"
                name="hsn"
                value={product.hsn}
                onChange={handleChangeproduct}
                placeholder="HSN Code"
                required
              />
              <select
                class="custom-select"
                className="qtyclass1"
                name="qtytype"
                onChange={handleChangeproduct}
              >
                <option value="" disabled selected>
                  Qty Type
                </option>
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="ltr">Liters</option>
                <option value="grm">Grams</option>
                <option value="mtrs">Meters</option>
                <option value="units">Units</option>
              </select>
              <button type="submit">Update Product</button>
            </form>
          </div>
        </div>
      )}

      {selecteditcustomer && (
        <div
          className="modal-backdrop"
          onClick={() => setselecteditcustomer(false)}
        >
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleupdatecustomer} className="form">
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChangecustomer}
                placeholder="Party Name"
                required
              />
              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleChangecustomer}
                placeholder="Phone.No"
                required
              />
              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleChangecustomer}
                placeholder="Address"
                required
              />
              <button type="submit">Update Customer</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Newinvoice;
