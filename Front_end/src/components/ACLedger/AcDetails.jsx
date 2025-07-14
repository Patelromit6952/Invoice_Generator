// AcDetails.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, deleteDoc, collection, where, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns'
import { FaMinusCircle } from "react-icons/fa";


const AcDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);

    const customer = location.state;

    const [transactions, setTransactions] = useState([]);
    const [newEntry, setNewEntry] = useState({ type: '', amount: '', date: '' });

    const fetchLedger = async () => {
        try {
            const ledgerRef = doc(db, 'ledger', id);
            const ledgerSnap = await getDoc(ledgerRef);

            if (ledgerSnap.exists()) {
                const data = ledgerSnap.data();
                const entries = data.entries || [];

                const credit = entries
                    .filter(entry => entry.type === 'credit')
                    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

                const debit = entries
                    .filter(entry => entry.type === 'debit')
                    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

                setTransactions(entries);
                setTotalCredit(credit);
                setTotalDebit(debit);
            } else {
                setTransactions([]);
                setTotalCredit(0);
                setTotalDebit(0);
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
        }
    };


    useEffect(() => {
        fetchLedger();
    }, [id]);

    const removeEntry = async (entryToRemove) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
        if (!confirmDelete) return;

        try {
            const ledgerRef = doc(db, 'ledger', id);
            const ledgerSnap = await getDoc(ledgerRef);

            if (ledgerSnap.exists()) {
                const data = ledgerSnap.data();
                const existingEntries = data.entries || [];

                // Remove entry
                const updatedEntries = existingEntries.filter(entry => {
                    return !(
                        entry.date === entryToRemove.date &&
                        entry.amount === entryToRemove.amount &&
                        entry.type === entryToRemove.type &&
                        (entry.invoiceNo || '') === (entryToRemove.invoiceNo || '')
                    );
                });

                // Recalculate totals
                const credit = updatedEntries
                    .filter(entry => entry.type === 'credit')
                    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

                const debit = updatedEntries
                    .filter(entry => entry.type === 'debit')
                    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

                // Parse opening balance safely
                const openingBal = parseFloat(customer.openingbal || '0');
                let closingBal = 0;

                // Apply cross logic for balance
                if (customer.group === 'creditors') {
                    closingBal = openingBal + credit - debit;
                } else if (customer.group === 'debitors') {
                    closingBal = openingBal + debit - credit;
                } else {
                    closingBal = openingBal + credit - debit; // default
                }

                // Save updated ledger
                await updateDoc(ledgerRef, { entries: updatedEntries });
                const customerRef = doc(db, 'customers', id);
                if (closingBal == 0) {
                    await updateDoc(customerRef, { closingbal: closingBal.toFixed(0).toString(),status:"" });
                }
                else {
                    await updateDoc(customerRef, { closingbal: closingBal.toFixed(0).toString() });
                }
                // Save updated closing balance (as string with 2 decimal points)


                // Refresh data
                fetchLedger();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert("Failed to delete entry");
        }
    };



    return (
        <div className="p-4 bg-white">
            <h2 className="text-xl font-bold mb-2">{customer.name}'s Statement</h2>
            <div className='flex space-x-4 p-4 bg-white'>
                <p><strong>Name:</strong> {customer?.name}</p>
                <p className='capitalize'><strong>Status:</strong> {customer?.group}</p>
                <p><strong>Opening Balance:</strong> ₹ {customer?.openingbal}</p>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-2">Ledger Transactions</h3>
            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Type</th>
                            <th className="p-2 border">Credit</th>
                            <th className="p-2 border">Debit</th>
                            <th className='p-2 border'>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((entry, idx) => (
                            <tr key={idx} className="text-center">
                                <td className="p-2 border">
                                    {entry.date?.toDate ? entry.date.toDate().toLocaleDateString() : entry.date}
                                </td>
                                <td className="p-2 border capitalize">
                                    {
                                        entry.custtype === "creditors"
                                            ? (entry.type === "credit"
                                                ? (entry.billType && entry.invoiceNo
                                                    ? `${entry.billType} A/c (${entry.invoiceNo})`
                                                    : `${entry.pytype || ''}`
                                                )
                                                : `${entry.pytype || ''}`
                                            )
                                            : entry.custtype === "debitors"
                                                ? (entry.type === "debit"
                                                    ? (entry.billType && entry.invoiceNo
                                                        ? `${entry.billType} A/c (${entry.invoiceNo})`
                                                        : `${entry.pytype || ''}`
                                                    )
                                                    : `${entry.pytype || ''}`
                                                )
                                                : (entry.type === "credit"
                                                    ? `${entry.pytype || ''}`
                                                    : (entry.billType && entry.invoiceNo
                                                        ? `${entry.billType} A/c (${entry.invoiceNo})`
                                                        : `${entry.pytype || ''}`
                                                    )
                                                )
                                    }
                                </td>

                                <td className="p-2 border">
                                    {entry.type === 'credit' ? `₹ ${entry.amount}` : '-'}
                                </td>
                                <td className="p-2 border">
                                    {entry.type === 'debit' ? `₹ ${entry.amount}` : '-'}
                                </td>
                                <td className="p-2 border">
                                    <button onClick={() => removeEntry(entry)}><FaMinusCircle /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            )}
            <div className="mt-4 text-right">
                <p><strong>Total Credit:</strong> ₹ {totalCredit.toFixed(2)}</p>
                <p><strong>Total Debit:</strong> ₹ {totalDebit.toFixed(2)}</p>
                <p>
                    <strong>Net Balance:</strong>{" "}
                    <span className={totalCredit - totalDebit >= 0 ? "text-green-600" : "text-red-600"}>
                        ₹ {(totalCredit - totalDebit).toFixed(2)}
                    </span>
                </p>

            </div>


        </div>
    );
};

export default AcDetails