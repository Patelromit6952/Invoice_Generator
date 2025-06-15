import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import Select from "react-select";
import CustomMenuList from "./CustomMenuList ";
import toast from "react-hot-toast";
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'


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
  const [showAddCategory, setShowAddCategory] = useState(false);
  const location = useLocation()
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    hsn: "",
    gst: null
  });

  const [categories, setCategories] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    group: "",
    purchaseRate: 0,
    salesRate: 0,
    unit: ""
  });

  const [customer, setCustomer] = useState({
    name: "",
    group: "",
    registrationtype: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    aadhar: "",
    GSTIN: "",
    bankname: "",
    branchname: "",
    accountno: "",
    isfccode: "",
    openingbal: "",
    status: ""
  });


  // For editing forms, separate states for controlled inputs:
  const [editCustomer, setEditCustomer] = useState({
    name: "",
    group: "",
    registrationtype: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    aadhar: "",
    GSTIN: "",
    bankname: "",
    branchname: "",
    accountno: "",
    isfccode: "",
    openingbal: "",
    status: ""
  });

  const [editProduct, setEditProduct] = useState({
    name: "",
    group: "",
    purchaseRate: 0,
    salesRate: 0,
    unit: ""
  });
  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "maincategory"));
    const categoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategories(categoryList); // for dropdown
  };

  const setAllNull = () => {
    setpytype('')
    setSelectedCustomer('')
    setSelectedProduct('')
    setProductQty(0)
    setProductList([])
    setSelectedProduct(null)
    setProductPrice(0)
  }
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
  const fetchCounter = async () => {
    const counterRef = doc(db, "counter", "invoiceCounter");
    const conterSnap = await getDoc(counterRef)
    if (conterSnap.exists()) {
      const count = conterSnap.data().counter;
      setInvoiceNo(`PSP-${count}`)
    }
  }
  const incrementCounter = async () => {
    const counterRef = doc(db, "counter", "invoiceCounter");

    try {
      await updateDoc(counterRef, {
        counter: increment(1),
      });
      console.log("Counter incremented");
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };


  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/dashboard/purchaseinvoice") {
      setbillType("purchase");
      setInvoiceNo('')
    } else {
      setbillType("sales");
      fetchCounter()
    }
    fetchData();
    fetchCategories()
    setAllNull()
  }, [location.pathname]);

  const fetchData = async () => {
    const customerSnap = await getDocs(
      query(collection(db, "customers"), orderBy("name"))
    );
    const customerList = customerSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setCustomers(customerList);

    const productSnap = await getDocs(
      query(collection(db, "products"), orderBy("name"))
    );
    const productList = productSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(productList);
  };
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
    const grandTotal = productList.reduce((sum, item) => {
      const gstAmount = (item.total * Number(item.gst)) / 100;
      return sum + item.total + gstAmount;
    }, 0);

    const subtotal = productList.reduce((sum, item) => {
      return sum + item.total;
    }, 0)
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
      subtotal,
      createdAt: new Date()
    };
    // console.log(invoiceData);

    try {
      if (pytype == "debit" && selectedCustomer?.id) {
        const ledgerRef = doc(db, 'ledger', selectedCustomer?.id);
        let type = ""
        if (billType == "purchase") type = "credit"
        else type = "debit"
        const entryToAdd = {
          amount: grandTotal,
          type: type,
          date: format(new Date(), 'dd/MM/yyyy hh:mm:ss a')
          ,
        };
        const existingDoc = await getDoc(ledgerRef);
        if (existingDoc.exists()) {
          await updateDoc(ledgerRef, {
            entries: arrayUnion(entryToAdd)
          });
        } else {
          await setDoc(ledgerRef, {
            customerId: selectedCustomer?.id,
            entries: [entryToAdd]
          });
        }
      }
      const userRef = doc(db, "customers", selectedCustomer?.id);
      const userSnap = await getDoc(userRef);
      await updateDoc(userRef,{"status":"debit"})
      await addDoc(collection(db, "invoices"), invoiceData);
      if (billType == "sales") await incrementCounter()
      toast.success("Invoice Saved Successfully");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.log(error);

      toast.error("Failed to Save invoice"); // fixed from toast.success
    }
  };

  const handleAddProducts = () => {
    if (!selectedProduct || !productPrice || !productQty) {
      toast.error("Please fill product details.");
      return;
    }

    const newProduct = {
      name: selectedProduct.name,
      hsn: selectedProduct.hsn,
      gst: selectedProduct.gst,
      qtytype: selectedProduct.unit,
      price: parseFloat(productPrice),
      quantity: parseInt(productQty),
      total: parseFloat(productPrice) * parseInt(productQty)
    };

    setProductList([...productList, newProduct]);
    setSelectedProduct(null);
    setProductPrice(0);
    setProductQty(0);
    toast.success("Product Added");
  };

  const handleChangeCustomer = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeProduct = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmitproduct = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      const newProduct = { id: docRef.id, ...product };

      setProducts((prevProducts) => [...prevProducts, newProduct]);

      toast.success("Product Added");
      setselectaddproduct(false);
      setProduct({
        name: "",
        group: "",
        purchaseRate: "",
        salesRate: "",
        unit: ""
      });
    } catch (err) {
      console.error("Error adding product: ", err);
      toast.error("Failed to add product.");
    }
  };

  const handleSubmitcustomer = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "customers"), customer);
      const newcust = { id: docRef.id, ...customer };


      setCustomers((prevCustomers) => [...prevCustomers, newcust]);
      toast.success("Customer Added");
      setselectaddcustomer(false);
      setCustomer({
        name: "",
        group: "",
        registrationtype: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        aadhar: "",
        GSTIN: "",
        bankname: "",
        branchname: "",
        accountno: "",
        isfccode: "",
        openingbal: "",
        status: ""
      });
    } catch (err) {
      console.error("Error adding customer: ", err);
      toast.error("Failed to add customer.");
    }
  };

  const handleupdatecustomer = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "customers", selectedCustomer.id);
      await updateDoc(docRef, editCustomer);
      toast.success("Customer Updated");
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id ? { ...c, ...editCustomer } : c
        )
      );
      setselecteditcustomer(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer.");
    }
  };

  const handleupdateproduct = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "products", selectedProduct.id);
      await updateDoc(docRef, editProduct);
      toast.success("Product Updated"); // fixed from toast.error
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, ...editProduct } : p
        )
      );
      setselecteditproduct(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }
  };

  const handleEditproduct = () => {
    setEditProduct({ ...selectedProduct }); // set editProduct state
    setselecteditproduct(true);
  };

  const handleEditcustomer = () => {
    setEditCustomer({ ...selectedCustomer }); // set editCustomer state
    setselecteditcustomer(true);
  };

  const handleAddcustomer = () => setselectaddcustomer(true);
  const handleAddproduct = () => setselectaddproduct(true);

  const handleChangeEditCustomer = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleChangeEditProduct = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handelAddMainCategory = async () => {
    if (newCategoryData.name.trim()) {
      try {
        const docRef = await addDoc(collection(db, "maincategory"), {
          name: newCategoryData.name,
          hsn: newCategoryData.hsn,
          gst: newCategoryData.gst,
        });

        toast.success("Category added successfully!");

        // Optionally update local state
        setCategories([
          ...categories,
          { id: docRef.id, ...newCategoryData }
        ]);

        setNewCategoryData({ name: "", hsn: "", gst: "" });
        setShowAddCategory(false);
      } catch (error) {
        console.error("Error adding category: ", error);
        toast.error("Failed to add category");
      }
    }
  }

  return (
    <>
      <div className="bg-white p-8 mx-auto shadow-md mb-2">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          Add New Invoice
        </h2>
        <div className="grid grid-cols-3 gap-5 mb-5">
          <div>
            <label className="font-semibold mb-1 text-gray-700">
              Select Payment Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
              name="pytype"
              value={pytype}
              onChange={(e) => setpytype(e.target.value)}
            >
              <option value="">Payment Type</option>
              <option value="cash">Cash</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div>
            <label className="font-semibold mb-1 text-gray-700">
              Select Customer
            </label>
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
            <label className="font-semibold mb-1 text-gray-700">
              Invoice No.
            </label>
            <input
              type="text"
              placeholder="INVOICE NO."
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 text-gray-700">
              Select Product
            </label>
            <Select
              options={productOptions}
              styles={customStyles}
              value={
                selectedProduct &&
                productOptions.find((opt) => opt.value === selectedProduct.id)
              }
              onChange={(option) => {
                setSelectedProduct(option.data)
                if (billType == "purchase") setProductPrice(Number(option.data.purchaseRate))
                else setProductPrice(Number(option.data.salesRate))

              }}
              placeholder="Select Product"
              components={{ MenuList: CustomMenuList }}
              onAdd={handleAddproduct}
              onEdit={handleEditproduct}
            />
          </div>
          <div>
            <label className="font-semibold mb-1 text-gray-700">Quantity</label>
            <input
              type="number"
              placeholder="QUANTITY"
              value={productQty}
              onChange={(e) => setProductQty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 text-gray-700">Price</label>
            <input
              type="number"
              placeholder="PRICE"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
            />
          </div>
        </div>
        <button
          className="px-5 py-3 bg-indigo-600 text-white rounded-md font-semibold mt-5 hover:bg-indigo-700 transition"
          onClick={handleAddProducts}
        >
          Add Product
        </button>
      </div>

      {productList.length > 0 && (
        <div>
          <table className="mt-1 w-full border-collapse font-sans">
            <thead>
              <tr>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  Product
                </th>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  HSN
                </th>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  GST
                </th>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  Price
                </th>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  Qty
                </th>
                <th className="bg-gray-700 text-white text-center px-2 py-2">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {productList.map((item, index) => (
                <tr key={index}>
                  <td className="bg-white px-2 py-2 border">{item.name}</td>
                  <td className="bg-white px-2 py-2 border">{item.hsn}</td>
                  <td className="bg-white px-2 py-2 border">{item.gst}</td>
                  <td className="bg-white px-2 py-2 border">{item.price}</td>
                  <td className="bg-white px-2 py-2 border">{item.quantity}</td>
                  <td className="bg-white px-2 py-2 border">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="px-5 py-3 bg-indigo-600 text-white rounded-md font-semibold mt-5 ml-8 hover:bg-indigo-700 transition"
            onClick={handleSubmit1}
          >
            Save Data
          </button>
        </div>
      )}

      {/* Add Customer Modal */}
      {selectaddcustomer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselectaddcustomer(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmitcustomer}
              className=" grid grid-cols-3 gap-2"
            >
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChangeCustomer}
                placeholder="Customer Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
                name="group"
                value={customer.group}
                onChange={handleChangeCustomer}
                required
              >
                <option value="">Select Group</option>
                <option value="creditors">Creditors</option>
                <option value="debitors">Debitors</option>
              </select>

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
                name="registrationtype"
                value={customer.registrationtype}
                onChange={handleChangeCustomer}
                required
              >
                <option value="">Select Registration Type</option>
                <option value="regular">Regular</option>
                <option value="unregistred">Unregistred</option>
                <option value="consumer">Consumer</option>
                <option value="composition">Composition</option>
              </select>

              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleChangeCustomer}
                placeholder="Phone"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleChangeCustomer}
                placeholder="Address"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="state"
                value={customer.state}
                onChange={handleChangeCustomer}
                placeholder="State"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="city"
                value={customer.city}
                onChange={handleChangeCustomer}
                placeholder="City"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="pincode"
                value={customer.pincode}
                onChange={handleChangeCustomer}
                placeholder="Pincode"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="aadhar"
                value={customer.aadhar}
                onChange={handleChangeCustomer}
                placeholder="Aadhar No"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="GSTIN"
                value={customer.GSTIN}
                onChange={handleChangeCustomer}
                placeholder="GSTIN No"
                required={customer.registrationtype === "regular"}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              {
                customer.group == "creditors" && (
                  <>
                    <input
                      type="text"
                      name="bankname"
                      value={customer.bankname}
                      onChange={handleChangeCustomer}
                      placeholder="Bank Name"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="branchname"
                      value={customer.branchname}
                      onChange={handleChangeCustomer}
                      placeholder="Branch Name"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="accountno"
                      value={customer.accountno}
                      onChange={handleChangeCustomer}
                      placeholder="Account No"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="isfccode"
                      value={customer.isfccode}
                      onChange={handleChangeCustomer}
                      placeholder="IFSC Code"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    /></>
                )
              }
              <input
                type="text"
                name="openingbal"
                value={customer.openingbal}
                onChange={handleChangeCustomer}
                placeholder="Opening Balance"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
                name="status"
                value={customer.status}
                onChange={handleChangeCustomer}
                required={customer.openingbal !== ""}
              >
                <option value="">Select OB Type</option>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>


              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-md px-4 py-2 mt-2 hover:bg-indigo-700"
              >
                Add Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {selecteditcustomer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselecteditcustomer(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleupdatecustomer}
              className="grid grid-cols-2 gap-3"
            >
              <input
                type="text"
                name="name"
                value={editCustomer.name}
                onChange={handleChangeEditCustomer}
                placeholder="Customer Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <select
                name="group"
                value={editCustomer.group}
                onChange={handleChangeEditCustomer}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Group</option>
                <option value="creditors">Creditors</option>
                <option value="debitors">Debitors</option>
              </select>

              <select
                name="registrationtype"
                value={editCustomer.registrationtype}
                onChange={handleChangeEditCustomer}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Registration Type</option>
                <option value="regular">Regular</option>
                <option value="unregistred">Unregistred</option>
                <option value="consumer">Consumer</option>
                <option value="composition">Composition</option>
              </select>

              <input
                type="text"
                name="phone"
                value={editCustomer.phone}
                onChange={handleChangeEditCustomer}
                placeholder="Phone"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="address"
                value={editCustomer.address}
                onChange={handleChangeEditCustomer}
                placeholder="Address"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="state"
                value={editCustomer.state}
                onChange={handleChangeEditCustomer}
                placeholder="State"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="city"
                value={editCustomer.city}
                onChange={handleChangeEditCustomer}
                placeholder="City"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="pincode"
                value={editCustomer.pincode}
                onChange={handleChangeEditCustomer}
                placeholder="Pincode"
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="aadhar"
                value={editCustomer.aadhar}
                onChange={handleChangeEditCustomer}
                placeholder="Aadhar No"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="GSTIN"
                value={editCustomer.GSTIN}
                onChange={handleChangeEditCustomer}
                placeholder="GSTIN No"
                required={editCustomer.registrationtype === "regular"}
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              {
                editCustomer.group == "creditors" && (
                  <>
                    <input
                      type="text"
                      name="bankname"
                      value={editCustomer.bankname}
                      onChange={handleChangeEditCustomer}
                      placeholder="Bank Name"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="branchname"
                      value={editCustomer.branchname}
                      onChange={handleChangeEditCustomer}
                      placeholder="Branch Name"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="accountno"
                      value={editCustomer.accountno}
                      onChange={handleChangeEditCustomer}
                      placeholder="Account No"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="isfccode"
                      value={editCustomer.isfccode}
                      onChange={handleChangeEditCustomer}
                      placeholder="IFSC Code"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    /></>
                )
              }
              <input
                type="text"
                name="openingbal"
                value={editCustomer.openingbal}
                onChange={handleChangeEditCustomer}
                placeholder="Opening Balance"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
                name="status"
                value={editCustomer.status}
                onChange={handleChangeEditCustomer}
                required={editCustomer.openingbal !== ""}

              >
                <option value="">Select OB Type</option>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>

              <button
                type="submit"
                className="col-span-2 bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700"
              >
                Update Customer
              </button>
            </form>
          </div>
        </div>
      )}


      {selectaddproduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselectaddproduct(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmitproduct}
              className="grid grid-cols-1 gap-2"
            >
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChangeProduct}
                placeholder="SubProduct Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <div className="flex gap-2 items-center">
                <select
                  name="group"
                  value={product.group}
                  onChange={(e) => {
                    const selected = categories.find(cat => cat.name === e.target.value);
                    setProduct({
                      ...product,
                      group: selected.name,
                      hsn: selected.hsn,
                      gst: selected.gst
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)} // control category modal
                  className="bg-blue-600 text-white px-3 py-1 w-50 rounded-md hover:bg-blue-700"
                >
                  Add Main Category
                </button>
              </div>

              <input
                type="text"
                name="purchaseRate"
                value={product.purchaseRate}
                onChange={handleChangeProduct}
                placeholder="Purchase Rate"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                name="salesRate"
                value={product.salesRate}
                onChange={handleChangeProduct}
                placeholder="Sales Rate"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <select
                name="unit"
                value={product.unit}
                onChange={handleChangeProduct}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Unit</option>
                <option value="Piece">Piece</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
              </select>

              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-md px-4 py-2 mt-2 hover:bg-indigo-700"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}


      {selecteditproduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselecteditproduct(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleupdateproduct}
              className="grid grid-cols-1 gap-2"
            >
              <input
                type="text"
                name="name"
                value={editProduct.name}
                onChange={handleChangeEditProduct}
                placeholder="Product Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />

              <div className="flex gap-2 items-center">
                <select
                  name="group"
                  value={editProduct.group}
                  onChange={(e) => {
                    const selected = categories.find(cat => cat.name === e.target.value);
                    setEditProduct({
                      ...editProduct,
                      group: selected.name,
                      hsn: selected.hsn,
                      gst: selected.gst
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="bg-blue-600 text-white px-3 py-1 w-50 rounded-md hover:bg-blue-700"
                >
                  Add Main Category
                </button>
              </div>

              <input
                type="text"
                name="hsn"
                value={editProduct.hsn}
                onChange={handleChangeEditProduct}
                placeholder="HSN Code"
                className="border border-gray-300 rounded-md px-3 py-2"
                readOnly
              />
              <input
                type="text"
                name="gst"
                value={editProduct.gst}
                onChange={handleChangeEditProduct}
                placeholder="GST %"
                readOnly
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                name="purchaseRate"
                value={editProduct.purchaseRate}
                onChange={handleChangeEditProduct}
                placeholder="Purchase Rate"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                name="salesRate"
                value={editProduct.salesRate}
                onChange={handleChangeEditProduct}
                placeholder="Sales Rate"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                name="unit"
                value={editProduct.unit}
                onChange={handleChangeEditProduct}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Unit</option>
                <option value="Piece">Piece</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
              </select>

              <button
                type="submit"
                className="bg-green-600 text-white rounded-md px-4 py-2 mt-2 hover:bg-green-700"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
      {showAddCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddCategory(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add Main Category</h2>

            <input
              type="text"
              name="name"
              value={newCategoryData.name}
              onChange={(e) =>
                setNewCategoryData({ ...newCategoryData, name: e.target.value })
              }
              placeholder="Category Name"
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-2"
            />
            <input
              type="text"
              name="hsn"
              value={newCategoryData.hsn}
              onChange={(e) =>
                setNewCategoryData({ ...newCategoryData, hsn: e.target.value })
              }
              placeholder="HSN Code"
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-2"
            />
            <input
              type="number"
              name="gst"
              value={newCategoryData.gst}
              onChange={(e) =>
                setNewCategoryData({ ...newCategoryData, gst: e.target.value })
              }
              placeholder="GST %"
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddCategory(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handelAddMainCategory}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
  // );
};

export default Newinvoice;
