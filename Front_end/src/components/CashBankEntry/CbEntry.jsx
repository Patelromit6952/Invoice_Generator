import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import Select from "react-select";
import CustomMenuList from "../Newinvoice/CustomMenuList ";
import toast from "react-hot-toast";
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'


const CbEntry = () => {
  const [customers, setCustomers] = useState([])
  const [groups, setGroups] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectaddgroup, setselectaddgroup] = useState(false);
  const [selectaddcustomer, setselectaddcustomer] = useState(false);
  const [selecteditgroup, setselecteditgroup] = useState(false);
  const [selecteditcustomer, setselecteditcustomer] = useState(false);
  const [amount, setAmount] = useState('')
  const location = useLocation()
  const [type, setType] = useState('')


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
  const [group, setGroup] = useState({
    bankname: '',
    accountno: '',
    isfccode: ''
  });
  const [editgroup, setEditgroup] = useState({
    bankname: '',
    accountno: '',
    isfccode: ''
  });

  // const setAllNull = () => {
  //   setpytype('')
  //   setSelectedCustomer('')
  //   setSelectedProduct('')
  //   setProductQty(0)
  //   setProductList([])
  //   setSelectedProduct(null)
  //   setProductPrice(0)
  // }
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "290x",
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
    fetchData()
  }, [])

  const fetchData = async () => {
    const customerSnap = await getDocs(
      query(collection(db, "customers"), orderBy("name"))
    );
    const customerList = customerSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(customerList);

    setCustomers(customerList);

    const groupSnap = await getDocs(
      query(collection(db, "groups"), orderBy("bankname"))
    );
    const groupList = groupSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(groupList);

    setGroups(groupList);
  };
  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: c.id,
    data: c
  }));

  const groupOptions = groups.map((p) => ({
    label: p.bankname,
    value: p.id,
    data: p
  }));

  // const handleSubmit1 = async () => {
  //   const grandTotal = productList.reduce((sum, item) => {
  //     const gstAmount = (item.total * Number(item.gst)) / 100;
  //     return sum + item.total + gstAmount;
  //   }, 0);

  //   const subtotal = productList.reduce((sum, item) => {
  //     return sum + item.total;
  //   }, 0)
  //   const invoiceData = {
  //     customerName: selectedCustomer?.name,
  //     customerPhone: selectedCustomer?.phone,
  //     customerAddress: selectedCustomer?.address,
  //     pytype,
  //     billType,
  //     invoiceNo,
  //     products: productList,
  //     uid: selectedCustomer?.id,
  //     grandTotal,
  //     subtotal,
  //     createdAt: new Date()
  //   };
  //   console.log(invoiceData);

  //   try {
  //     if (pytype == "debit" && selectedCustomer?.id) {
  //       const ledgerRef = doc(db, 'ledger', selectedCustomer?.id);
  //       let type = ""
  //       if (billType == "purchase") type = "credit"
  //       else type = "debit"
  //       const entryToAdd = {
  //         amount: grandTotal,
  //         type: type,
  //         date: format(new Date(), 'dd/MM/yyyy hh:mm:ss a')
  //         ,
  //       };
  //       const existingDoc = await getDoc(ledgerRef);
  //       if (existingDoc.exists()) {
  //         await updateDoc(ledgerRef, {
  //           entries: arrayUnion(entryToAdd)
  //         });
  //       } else {
  //         await setDoc(ledgerRef, {
  //           customerId: selectedCustomer?.id,
  //           entries: [entryToAdd]
  //         });
  //       }
  //     }
  //     const userRef = doc(db, "customers", selectedCustomer?.id);
  //     const userSnap = await getDoc(userRef);
  //     await updateDoc(userRef, { "status": "debit" })
  //     await addDoc(collection(db, "invoices"), invoiceData);
  //     if (billType == "sales") await incrementCounter()
  //     toast.success("Invoice Saved Successfully");
  //     setTimeout(() => {
  //       window.location.reload();
  //     }, 2000);
  //   } catch (error) {
  //     console.log(error);

  //     toast.error("Failed to Save invoice"); // fixed from toast.success
  //   }
  // };

  const handleAddEntry = async () => {
    if (!selectedGroup || !selectedCustomer || !amount || !type) {
      toast.error("Please fill  details.");
      return;
    }

    const newEntry = {
      customerName: selectedCustomer.name,
      group: selectedGroup.bankname,
      amount: amount,
      type: type,
    };


    try {
        const ledgerRef = doc(db, 'ledger', selectedCustomer?.id);
        let type1 = ""
        if (type == "payment") type1 = "debit"
        else type1 = "credit"
        const entryToAdd = {
          pytype:selectedGroup.bankname,
          amount: amount,
          type: type1,
          date: format(new Date(), 'dd/MM/yyyy hh:mm:ss a'),
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
      
      toast.success("Entry Saved Successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Save entry");
    }

  };

  const handleChangeCustomer = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeGroup = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "groups"), group);
      const newGroup = { id: docRef.id, ...group };
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      toast.success("Group Added");
      setselectaddgroup(false);
      setGroup({
        bankname: '',
        accountno: '',
        isfccode: ''
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

  const handleupdategroup = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "group", selectedGroup.id);
      await updateDoc(docRef, editgroup);
      toast.success("Group Updated");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedGroup.id ? { ...p, ...editgroup } : p
        )
      );
      setselecteditgroup(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }
  };

  const handleEditgroup = () => {
    setEditgroup({ ...selectedGroup }); // set editProduct state
    setse(true);
  };

  const handleEditcustomer = () => {
    setEditCustomer({ ...selectedCustomer }); // set editCustomer state
    setselecteditcustomer(true);
  };

  const handleAddcustomer = () => setselectaddcustomer(true);
  const handleAddgroup = () => setselectaddgroup(true);

  const handleChangeEditCustomer = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleChangeEditGroup = (e) => {
    const { name, value } = e.target;
    setEditgroup((prev) => ({
      ...prev,
      [name]: value
    }));
  };



  return (
    <>
      <div className="bg-white p-8 mx-auto shadow-md mb-2">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          Add Cash / Bank Entry
        </h2>
        <div className="grid grid-cols-4 gap-5 mb-5">
          <div>
            <label className="font-semibold mb-1 text-gray-700">
              Select Group
            </label>
            <Select
              options={groupOptions}
              styles={customStyles}
              value={
                selectedGroup &&
                groups.find((opt) => opt.value === selectedGroup.id)
              }
              onChange={(option) => {
                setSelectedGroup(option.data)


              }}
              placeholder="Select Group"
              components={{ MenuList: CustomMenuList }}
              onAdd={handleAddgroup}
              onEdit={handleEditgroup}
            />
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
              Select Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value=""> Type</option>
              <option value="reciept">Reciept</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="font-semibold mb-1 text-gray-700">Amount</label>
            <input
              type="text"
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base min-h-[40px]"
            />
          </div>
        </div>
        <button
          className="px-5 py-3 bg-indigo-600 text-white rounded-md font-semibold mt-5 hover:bg-indigo-700 transition"
          onClick={handleAddEntry}
        >
          Add Entry
        </button>
      </div>

      {/* {productList.length > 0 && (
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
      )} */}

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

      {/* Add Group */}
      {selectaddgroup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselectaddgroup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmitGroup}
              className="grid grid-cols-2 gap-2"
            >
              <input
                type="text"
                name="bankname"
                value={group.bankname}
                onChange={handleChangeGroup}
                placeholder="Bank Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              {
                group.bankname !== "cash" && (
                  <>
                    <input
                      type="text"
                      name="accountno"
                      value={group.accountno}
                      onChange={handleChangeGroup}
                      placeholder="Account No"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      name="isfccode"
                      value={group.isfccode}
                      onChange={handleChangeGroup}
                      placeholder="IFSC Code"
                      required
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </>
                )
              }

              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-md px-4 py-2 mt-2 hover:bg-indigo-700"
              >
                Add Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group */}
      {selecteditgroup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setselecteditgroup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleupdategroup}
              className="grid grid-cols-1 gap-2"
            >
              <input
                type="text"
                name="name"
                value={editgroup.name}
                onChange={handleChangeEditGroup}
                placeholder="Group Name"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="bankname"
                value={editgroup.bankname}
                onChange={handleChangeEditGroup}
                placeholder="Bank Name"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="acno"
                value={editgroup.accountno}
                onChange={handleChangeEditGroup}
                placeholder="Account No"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="ifsc"
                value={editgroup.isfccode}
                onChange={handleChangeEditGroup}
                placeholder="IFSC Code"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="submit"
                className="bg-green-600 text-white rounded-md px-4 py-2 mt-2 hover:bg-green-700"
              >
                Update Group
              </button>
            </form>
          </div>
        </div>
      )}


    </>
  );
};

export default CbEntry;
