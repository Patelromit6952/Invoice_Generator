// AcDetails.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns'


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

                // Calculate credit and debit totals
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

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (!newEntry.type || !newEntry.amount || !newEntry.date) return;

        const entryToAdd = {
            type: newEntry.type,
            amount: parseFloat(newEntry.amount),
            date: format(newEntry.date, 'dd/MM/yyyy hh:mm:ss a'),
        };

        const ledgerRef = doc(db, 'ledger', id);
        const ledgerSnap = await getDoc(ledgerRef);

        try {
            if (ledgerSnap.exists()) {
                await updateDoc(ledgerRef, {
                    entries: arrayUnion(entryToAdd),
                });
            } else {
                await setDoc(ledgerRef, {
                    customerId: id,
                    entries: [entryToAdd],
                });
            }
            setNewEntry({ type: '', amount: '', date: '' });
            fetchLedger();
        } catch (err) {
            console.error('Error adding entry:', err);
        }
    };

    return (
        <div className="p-4 bg-white">
            <h2 className="text-xl font-bold mb-2">{customer.name}'s Statement</h2>
            <div className='flex space-x-4 p-4 bg-white'>
                <p><strong>Name:</strong> {customer?.name}</p>
                <p><strong>Status:</strong> {customer?.group}</p>
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
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((entry, idx) => (
                            <tr key={idx} className="text-center">
                                 <td className="p-2 border">
                                    {entry.date?.toDate ? entry.date.toDate().toLocaleDateString() : entry.date}
                                </td>
                                <td className="p-2 border capitalize"> {entry.type === 'credit' ? ` ${entry.type}(${entry?.pytype})` : `${entry.type}`}</td>
                                <td className="p-2 border">
                                    {entry.type === 'credit' ? `₹ ${entry.amount}` : '-'}
                                </td>
                                <td className="p-2 border">
                                    {entry.type === 'debit' ? `₹ ${entry.amount}` : '-'}
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