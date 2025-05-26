import { collection,deleteDoc,doc,getDocs,orderBy,query,startAfter,limit, getCountFromServer} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import "./invoices.css"

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [pageSnapshots, setPageSnapshots] = useState([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);


  const navigate = useNavigate();

  useEffect(() => {
    fetchPage(1);
    fetchTotalCount()
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
    const lastSnap = pageSnapshots[page - 2]; // previous page's last doc
    if (!lastSnap) return; // avoid going to a page if no snapshot
    q = query(
      collection(db, 'invoices'),
      orderBy('createdAt', 'desc'),
      startAfter(lastSnap),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const docs = snapshot.docs;

  // Don’t change page or update state if there's no data
  if (docs.length === 0) {
    setIsLastPage(true);
    return;
  }

  const lastVisible = docs[docs.length - 1];
  const data = docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Only add snapshot if going forward
  if (pageSnapshots.length < page) {
    setPageSnapshots(prev => [...prev, lastVisible]);
  }

  setInvoices(data);
  setCurrentPage(page);
  setIsLastPage(docs.length < pageSize); // true if fewer than expected
  setLoading(false)
};


  const deleteInvoice = async (id) => {
    const isConfirm = window.confirm("Are you sure to delete?");
    if (isConfirm) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
        fetchPage(currentPage); 
      } catch (error) {
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="invoices-container">
      <div className="invoices-wrapper">
        <p className='invoice-p'>Party Name</p>
        <p className='invoice-p'>BillType</p>
        <p className='invoice-p'>Total</p>
        <p className='invoice-p'>Date</p>
      </div>

      <div className={`invoices-content ${loading ? 'fade-out' : 'fade-in'}`}>
        {loading ? (
          <div className="spinner"></div>
        ) : invoices.length === 0 ? (
          <div className="no-invoices-message">No invoices found on this page.</div>
        ) : (
          invoices.map((data) => (
            <div key={data.id} className="invoices-wrapper">
              <p>{data.customerName}</p>
              <p>{data.billType}</p>
              <p>Rs. {data.grandTotal}</p>
              <p>{new Date(data.createdAt.seconds * 1000).toLocaleDateString()}</p>
              <button
                className="view-btn"
                onClick={() => navigate('/dashboard/invoice-details', { state: data })}
              >
                <IoEyeSharp size={15} /> View
              </button>
              <button className="delete-btn" onClick={() => deleteInvoice(data.id)}>
                <MdDelete size={15} /> Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => fetchPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="page-btn1"
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
              className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => fetchPage(currentPage + 1)}
          disabled={isLastPage || loading}
          className="page-btn1"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Invoices;
