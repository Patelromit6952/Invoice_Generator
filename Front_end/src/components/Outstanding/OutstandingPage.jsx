import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const OutstandingPage = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "customers"));
        const allCustomers = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter only customers with non-zero closing amount
        const filtered = allCustomers.filter(cust =>
          Number(cust.closingbal) !== 0
        );

        setCustomers(filtered);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl  font-bold mb-4">🧾 Outstanding Report</h2>

      <table className="table-auto w-full border border-collapse shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 border">Customer Name</th>
            <th className="p-3 border">Group</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Outstanding Amount</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No outstanding found.
              </td>
            </tr>
          ) : (
            customers.map((cust, index) => {
              const amount = Number(cust.closingbal);
              const isDebit = cust.status === "debit";

              return (
                <tr key={cust.id} className="hover:bg-gray-50">
                  <td className="p-3 border capitalize">{cust.name}</td>
                  <td className="p-3 border capitalize">{cust.group}</td>
                  <td className="p-3 border capitalize">{cust.status}</td>
                  <td className={`p-3 border text-right font-semibold ${isDebit ? "text-red-600" : "text-green-600"}`}>
                    ₹ {Math.abs(amount).toFixed(2)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OutstandingPage;
