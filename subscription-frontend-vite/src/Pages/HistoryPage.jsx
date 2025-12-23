import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

// --- Styles ---
const styles = { wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '4rem 1rem', boxSizing: 'border-box' }, container: { width: '100%', maxWidth: '800px', border: '1px solid #374151', borderRadius: '0.75rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', color: '#d1d5db' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 1.5rem 0 1.5rem' }, mainTitle: { color: '#ffffff', margin: '0' }, infoText: { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' }, link: { color: '#818cf8', textDecoration: 'none', marginLeft: '1rem' }, transactionItem: { listStyle: 'none', padding: '1rem', border: '1px solid #374151', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#111827' }, transactionText: { margin: '0.25rem 0', color: '#d1d5db' }, txHashLink: { color: '#818cf8', textDecoration: 'none', wordBreak: 'break-all' } };

export default function HistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Listen for changes in the user's authentication state
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe(); // Cleanup on component unmount
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setTransactions([]);
            return; // If there's no user, don't try to fetch
        }

        setLoading(true);
        // Path to the 'transactions' sub-collection for the current user
        const transactionsColRef = collection(db, "users", user.uid, "transactions");
        
        // Create a query to order transactions by timestamp, newest first
        const q = query(transactionsColRef, orderBy("timestamp", "desc"));

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const txs = [];
            querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() });
            });
            setTransactions(txs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        // Cleanup the listener when the component unmounts or user changes
        return () => unsubscribe();
    }, [user]);

    const renderTransactionDetails = (tx) => {
        switch (tx.type) {
            case 'CREATE_PLAN':
                return `Created a new plan with token ${tx.details.token} for ${tx.details.price} units every ${tx.details.interval} seconds.`;
            case 'SUBSCRIBE':
                return `Subscribed to Plan #${tx.planId}.`;
            case 'CANCEL':
                return `Canceled Subscription #${tx.subscriptionId}.`;
            default:
                return 'Unknown transaction type.';
        }
    };

    return (
         <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.mainTitle}>Transaction History</h2>
                    <div>
                        <Link to="/subscriber" style={styles.link}>Subscriber View</Link>
                        <Link to="/creator" style={styles.link}>Creator View</Link>
                    </div>
                </div>
                 <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    {loading && <p style={styles.infoText}>Loading your transaction history...</p>}
                    {!loading && transactions.length === 0 && <p style={styles.infoText}>You have no transaction history yet.</p>}
                    
                    <ul style={{ padding: 0 }}>
                        {transactions.map(tx => (
                            <li key={tx.id} style={styles.transactionItem}>
                                <p style={styles.transactionText}><strong>Type:</strong> {tx.type}</p>
                                <p style={styles.transactionText}><strong>Date:</strong> {tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</p>
                                <p style={styles.transactionText}><strong>Details:</strong> {renderTransactionDetails(tx)}</p>
                                <p style={styles.transactionText}><strong>Tx Hash:</strong> 
                                    <a href={`https://amoy.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" style={styles.txHashLink}> {tx.txHash}</a>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}