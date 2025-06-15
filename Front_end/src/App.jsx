import Login from './components/login/Login.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './components/register/Register';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/dashboard/Home';
import Invoices from './components/dashboard/Invoices';
// import Newinvoice from './components/Newinvoice/Newinvoice';
import Settings from './components/dashboard/Settings';
import { Toaster } from 'react-hot-toast';
import InvoiceDetails from './components/dashboard/InvoiceDetails';
// import Addproduct from './components/AddProduct/Addproduct';
// import Addparty from './components/AddParty/Addparty';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Newinvoice from './components/Newinvoice/Newinvoice.jsx';
import Acledger from './components/ACLedger/Acledger.jsx';
import AcDetails from './components/ACLedger/AcDetails.jsx';
import CbEntry from './components/CashBankEntry/CbEntry.jsx';
import OutstandingPage from './components/Outstanding/OutstandingPage.jsx';

function App() {
  const myRouter = createBrowserRouter([
    { path: '', element: <Login /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    {
      path: '/dashboard',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      children: [
        { path: '', element: <Home /> },
        { path: '/dashboard/home', element: <Home /> },
        { path: '/dashboard/purchaseinvoice', element: <Newinvoice /> },
        { path: '/dashboard/sellsinvoice', element: <Newinvoice /> },
        { path: '/dashboard/acledger', element: <Acledger /> },
        { path: '/dashboard/invoices', element: <Invoices /> },
        { path: '/dashboard/acledger/customer/:id', element: <AcDetails /> },
        { path: '/dashboard/cbentry', element: <CbEntry /> },
        { path: '/dashboard/outstanding', element: <OutstandingPage /> },
        { path: '/dashboard/invoice-details', element: <InvoiceDetails /> },
        { path: '/dashboard/setting', element: <Settings /> },
      ]
    }
  ])
  return (
    <div>
      <RouterProvider router={myRouter} />
      <Toaster />
    </div>
  );
}

export default App;
