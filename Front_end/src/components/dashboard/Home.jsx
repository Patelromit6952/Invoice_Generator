import React, { useEffect, useState } from 'react'
import { Chart } from 'chart.js/auto'
import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { format } from 'date-fns'
import SPchart from '../Charts/SPchart'

const Home = () => {
  const [tpurchase, settpurchase] = useState(0)
  const [tsales, settsales] = useState(0)
  const [tinvoice, settinvoice] = useState(0)
  const [invoices, setinvoices] = useState([])

  let myChartInstance = null

  useEffect(() => {
    getPurchaseData()
    getSalesData()
    // createChart()
    fetchRecentDocs()
    fetchMonthlySummary()
    // return () => {
    //   if (myChartInstance) {
    //     myChartInstance.destroy()
    //   }
    // }
  }, [])

  // const createChart = () => {
  //   const ctx = document.getElementById('myChart').getContext('2d')

  //   if (myChartInstance !== null) {
  //     myChartInstance.destroy()
  //   }

  //   myChartInstance = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  //       datasets: [{
  //         label: '# of Votes',
  //         data: [12, 19, 3, 5, 2, 3],
  //         borderWidth: 1
  //       }]
  //     },
  //     options: {
  //       scales: {
  //         y: {
  //           beginAtZero: true
  //         }
  //       }
  //     }
  //   })
  // }

  const getPurchaseData = async () => {
    const q = query(
      collection(db, 'invoices'),
      where('billType', '==', 'purchase')
    )
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    settpurchase(getOverallTotal(data))
  }

  const getSalesData = async () => {
    const q = query(
      collection(db, 'invoices'),
      where('billType', '==', 'sales')
    )
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    settsales(getOverallTotal(data))
    getInvoiceCount()
  }

  const getOverallTotal = (invoiceList) => {
    let t = 0
    invoiceList.forEach(data => {
      t += data.grandTotal || 0
    })
    return t
  }

  const getInvoiceCount = async () => {
    const snapshot = await getCountFromServer(query(collection(db, "invoices")))
    settinvoice(snapshot.data().count)
  }

  const fetchRecentDocs = async () => {
    const q = query(
      collection(db, 'invoices'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    const querySnapshot = await getDocs(q)
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setinvoices(docs)
  }
  const fetchMonthlySummary = async () => {
  const snapshot = await getDocs(collection(db, "invoices"));

  const summary = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.createdAt?.toDate(); // Firestore Timestamp → JS Date
    const month = format(date, "MMM"); // e.g., 'Jan', 'Feb'
    const type = data.billType; // 'sale' or 'purchase'
    const amount = data.grandTotal || 0;

    if (!summary[month]) {
      summary[month] = { sales: 0, purchase: 0 };
    }

    if (type === "sales") summary[month].sales += amount;
    if (type === "purchase") summary[month].purchase += amount;
  });

  // Return array sorted by month (using order of months)
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthOrder.map((month) => ({
    month,
    sales: summary[month]?.sales || 0,
    purchase: summary[month]?.purchase || 0,
  }));
};

  return (
    <>
      {/* First row - Stats */}
      <div className="flex justify-between gap-4">
        <div className="flex-1 h-[27vh] rounded-lg flex flex-col gap-2 justify-center items-center text-white bg-gradient-to-r from-[#282c34] to-[#4409e7]">
          <h1 className="text-4xl font-bold">{tpurchase}</h1>
          <h4 className="text-lg">Total Purchase</h4>
        </div>
        <div className="flex-1 h-[27vh] rounded-lg flex flex-col gap-2 justify-center items-center text-white bg-gradient-to-r from-[#282c34] to-[#fa03d1]">
          <h1 className="text-4xl font-bold">{tsales}</h1>
          <h4 className="text-lg">Total Sales</h4>
        </div>
        <div className="flex-1 h-[27vh] rounded-lg flex flex-col gap-2 justify-center items-center text-white bg-gradient-to-r from-[#282c34] to-[#005eff]">
          <h1 className="text-4xl font-bold">{tinvoice}</h1>
          <h4 className="text-lg">Total Invoices</h4>
        </div>
      </div>

      {/* Second row - Chart & Recent Invoices */}
      <div className="flex justify-between mt-12 gap-6">
        <div className="bg-white w-3/5 h-[60vh] rounded-md shadow-md p-1">
         <SPchart/>
        </div>

        <div className="bg-white w-2/5 h-[60vh] rounded-md shadow-md flex flex-col">
          <h3 className="text-center p-3 bg-[#4409e7] text-white rounded-t-md text-xl font-semibold">
            Recent Invoices
          </h3>
          <div className="flex flex-col overflow-y-auto p-4 space-y-3">
            {invoices.map(invoice => (
              <div
                key={invoice.id}
                className="flex justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <p className="w-1/2 truncate">{invoice.customerName}</p>
                <p className="w-1/2 text-right">
                  {format(invoice.createdAt?.toDate(), 'dd/MM/yyyy hh:mm:ss a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
