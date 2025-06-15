import { collection, deleteDoc, doc, getDocs, orderBy, query, startAfter, limit, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [pageSnapshots, setPageSnapshots] = useState([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPage(1);
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    const coll = collection(db, "invoices");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    setTotalPages(Math.ceil(count / pageSize));
  };

  const fetchPage = async (page) => {
    setLoading(true);
    let q;
    if (page === 1) {
      q = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    } else {
      const lastSnap = pageSnapshots[page - 2];
      if (!lastSnap) return;
      q = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        startAfter(lastSnap),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    if (docs.length === 0) {
      setInvoices([]);
      setIsLastPage(true);
      setLoading(false);
      return;
    }


    const lastVisible = docs[docs.length - 1];
    const data = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (pageSnapshots.length < page) {
      setPageSnapshots(prev => [...prev, lastVisible]);
    }

    setInvoices(data);
    setCurrentPage(page);
    setIsLastPage(docs.length < pageSize);
    setLoading(false);
  };

  const deleteInvoice = async (id) => {
    const isConfirm = window.confirm("Are you sure to delete?");
    if (isConfirm) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
        const coll = collection(db, "invoices");
        const snapshot = await getCountFromServer(coll);
        const count = snapshot.data().count;
        const newTotalPages = Math.ceil(count / pageSize);

        // Redirect to page 1 if current page > newTotalPages
        if (currentPage > newTotalPages) {
          fetchPage(1);
        } else {
          fetchPage(currentPage);
        }

        setTotalPages(newTotalPages);

      } catch (error) {
        alert("Something went wrong!");
      }
    }
  };

  //  delete invoice with decrement counter  

  // const deleteInvoice = async (id) => {
  //   const isConfirm = window.confirm("Are you sure to delete?");
  //   if (isConfirm) {
  //     try {
  //       await deleteDoc(doc(db, "invoices", id));

  //       // Decrement counter
  //       const counterRef = doc(db, "counter", "invoiceCounter");
  //       const counterSnap = await getDoc(counterRef);

  //       if (counterSnap.exists()) {
  //         const currentCount = counterSnap.data().count || 0;
  //         if (currentCount > 0) {
  //           await updateDoc(counterRef, {
  //             count: currentCount - 1,
  //           });
  //         }
  //       }

  //       fetchPage(currentPage);
  //     } catch (error) {
  //       console.error(error);
  //       alert("Something went wrong!");
  //     }
  //   }
  // };


  return (
    <div className="bg-white text-left">
      <div className="flex gap-4 mt-2 items-center p-5 bg-white font-semibold border-b">
        <p className="w-1/5">Party Name</p>
        <p className="w-1/5">BillType</p>
        <p className="w-1/5">Total</p>
        <p className="w-1/5">Date</p>
        <p className="w-1/5"></p>
      </div>

      <div className={`${loading ? 'opacity-50' : 'animate-fade-in'}`}>
        {loading ? (
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto my-8"></div>
        ) : invoices.length === 0 ? (
          <div className="text-center my-6 text-gray-500 italic">No invoices found on this page.</div>
        ) : (
          invoices.map((data) => (
            <div key={data.id} className="flex gap-4 items-center p-3 border-b">
              <p className="w-1/5">{data.customerName}</p>
              <p className="w-1/5">{data.billType}</p>
              <p className="w-1/5">Rs. {(data.grandTotal)}</p>
              <p className="w-1/5">{new Date(data.createdAt.seconds * 1000).toLocaleDateString()}</p>
              <div className="flex gap-2 w-1/5">
                <button
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1"
                  onClick={() => navigate('/dashboard/invoice-details', { state: data })}
                >
                  <IoEyeSharp size={15} /> View
                </button>
                <button
                  className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-1"
                  onClick={() => deleteInvoice(data.id)}
                >
                  <MdDelete size={15} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center mt-6 p-3 gap-2">
        <button
          onClick={() => fetchPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-3 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>

        {[...Array(totalPages).keys()].map(pg => {
          const pageNum = pg + 1;
          return (
            <button
              key={pageNum}
              onClick={() => fetchPage(pageNum)}
              disabled={loading}
              className={`px-3 py-2 border rounded ${pageNum === currentPage ? 'bg-blue-500 text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => fetchPage(currentPage + 1)}
          disabled={isLastPage || loading}
          className="px-3 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Invoices;
