import React, { useEffect, useState } from 'react'
import {Chart} from 'chart.js/auto'
import { collection,getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { format } from 'date-fns';
import "./home.css"
// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend
// } from 'chart.js';

const Home = () => {
  const [tpurchase,settpurchase] = useState(99999)
  const [tsales,settsales] = useState(99999)
  const [tinvoice,settinvoice] = useState(99999)
  const [invoices,setinvoices] = useState([])
  // const [chartData, setChartData] = useState(null);

  let myChartInstance = null;

  useEffect(()=>{
    getPurchaseData()
    getSalesData()
    createchart()
    fetchRecentDocs()
    return () => {
      if (myChartInstance) {
        myChartInstance.destroy();
      }
    };
    // fetchData()
  },[])

  const createchart = () =>{
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChartInstance !== null) {
      myChartInstance.destroy();
    }

    myChartInstance = new Chart (ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  }

  const getPurchaseData = async () => {
    const q = query(
      collection(db, 'invoices'),
      where('billType', '==', 'purchase')
    );      
    const querySnapshort = await getDocs(q);
      const data  =  querySnapshort.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
      // setinvoices(data)
      settpurchase(getOverallTotal(data))
    }

    const getSalesData = async () => {
      const q = query(
        collection(db, 'invoices'),
        where('billType', '==', 'sales')
      );      
      const querySnapshort = await getDocs(q);
      const data  =  querySnapshort.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
      settsales(getOverallTotal(data))
      getinvoices()
    }

    const getOverallTotal = (invoicelist) => {      
      let t = 0;
      invoicelist.forEach(data=>{
        t= t +  data.grandTotal
      })
      return t;
    }

    const getinvoices = async () => {
      const snapshort = await getCountFromServer(query(collection(db,"invoices")));
      settinvoice(snapshort.data().count)
    }

    const fetchRecentDocs = async () => {
      const q = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit(7)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(docs);
      
      setinvoices(docs);
    };

    // const fetchData = async () => {
    //   const invoicesSnap = await getDocs(collection(db, 'invoices'));
    //   const data = {};

    //   invoicesSnap.forEach(doc => {
    //     const { billType, total, date } = doc.data();
    //     const month = new Date(date.seconds * 1000).toLocaleString('default', { month: 'short', year: 'numeric' });

    //     if (!data[month]) {
    //       data[month] = { purchase: 0, sale: 0 };
    //     }
    //     data[month][billType] += total;
    //   });

    //   const months = Object.keys(data);
    //   const purchases = months.map(month => data[month].purchase);
    //   const sales = months.map(month => data[month].sales);

    //   setChartData({
    //     labels: months,
    //     datasets: [
    //       {
    //         label: 'Purchase',
    //         data: purchases,
    //         backgroundColor: 'rgba(255, 99, 132, 0.6)',
    //       },
    //       {
    //         label: 'Sales',
    //         data: sales,
    //         backgroundColor: 'rgba(54, 162, 235, 0.6)',
    //       },
    //     ],
    //   });
    // };


  return (
    <>
    <div className='home-first-row'>
      <div className='home-box box-1'>
          <h1>{tpurchase}</h1>
          <h4>Total Purchase</h4>
      </div>
      <div className='home-box box-2'>
        <h1>{tsales}</h1>
        <h4>Total Sales</h4>
      </div>
      <div className='home-box box-3'>
        <h1>{tinvoice}</h1>
        <h4>Total Invoices</h4>
      </div>
    </div>
    <div className='home-second-row'>
    {/* <div style={{ width: '100%', maxWidth: '700px', margin: 'auto' }}>
      <h3>Monthly Purchase vs Sales</h3>
      {chartData && <Bar data={chartData} />}
    </div> */}
    <div className='chart-box'>
      <canvas id='myChart'></canvas>
    </div>
      <div className='recent-invoice'>
      <h3>Recent Invoices</h3>
      <div className='recent-items'>
        {invoices.map((invoice) => (
          <div key={invoice.id} style={{
            border: '1px solid #ccc',
            marginBottom: '10px',
            display:'flex',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <p>{invoice.customerName}</p>
            <p>{format( invoice.createdAt?.toDate(), 'dd/MM/yyyy hh:mm:ss a')}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
    </>
  )
}
    
export default Home