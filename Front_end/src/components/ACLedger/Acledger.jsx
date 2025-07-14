import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Acledger = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const customersSnapshot = await getDocs(
        query(collection(db, 'customers'), orderBy('name'))
      );
      const customersList = customersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })).filter((customer) => customer.status !== "");
      setCustomers(customersList);
      setFilteredCustomers(customersList); // set initially
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = customers.filter((cust) =>
      cust.name?.toLowerCase().includes(term)
    );
    setFilteredCustomers(results);
  }, [searchTerm, customers]);

  const handleCustomerClick = (customer) => {
    navigate(`customer/${customer.id}`, { state: customer });
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">A/C Ledger</h1>

      <input
        type="text"
        placeholder="Search by customer name..."
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <p className="text-center text-gray-500">No customers found.</p>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => handleCustomerClick(customer)}
            >
              <div>
                <p className="font-semibold text-lg">{customer.name}</p>
               {
                customer.openingbal == "0"|| "" || 0 ? ( <p className="text-sm capitalize text-gray-600">Status: {'All Clear'}</p>) : ( <p className="text-sm capitalize text-gray-600">Status: {customer.group || 'N/A'}</p>)
               }
              </div>
              <div className="text-right text-green-700 font-bold">
                ₹ {customer.openingbal || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Acledger;
