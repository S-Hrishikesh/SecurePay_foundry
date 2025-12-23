import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.11.1/ethers.min.js";
import { Link } from "react-router-dom";
import PlanCard from '../components/planCard.jsx';

// --- NEW: Firebase Imports ---
import { auth, db } from '../firebase.js';
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- Constants, ABI, and Styles ---
const SUBSCRIPTION_MANAGER_ABI = [{"type":"constructor","inputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"cancel","inputs":[{"name":"subscriptionId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"createPlan","inputs":[{"name":"tokenAddr","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"interval","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"function","name":"isActive","inputs":[{"name":"user","type":"address","internalType":"address"},{"name":"planId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"nextPlanId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"nextSubscriptionId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"plans","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"creator","type":"address","internalType":"address"},{"name":"token","type":"address","internalType":"contract IERC20"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"interval","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"renew","inputs":[{"name":"subscriptionId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setPlanStatus","inputs":[{"name":"planId","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"subscribe","inputs":[{"name":"planId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"function","name":"subscriptions","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"subscriber","type":"address","internalType":"address"},{"name":"planId","type":"uint256","internalType":"uint256"},{"name":"nextPaymentDue","type":"uint256","internalType":"uint256"},{"name":"lastPaid","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"}];
const ERC20_ABI = [{"type":"function","name":"approve","inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"outputs":[{"name":"","type":"uint256"}],"stateMutability":"view"}];
const SUBSCRIPTION_MANAGER_ADDRESS = "0x7c488e429e2b9a014df5fdccc32076ae513f7861";
function getSubscriptionManagerContract(s){return new ethers.Contract(ethers.getAddress(SUBSCRIPTION_MANAGER_ADDRESS),SUBSCRIPTION_MANAGER_ABI,s);}
const styles = { wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '4rem 1rem', boxSizing: 'border-box' }, container: { width: '100%', maxWidth: '800px', border: '1px solid #374151', borderRadius: '0.75rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', color: '#d1d5db' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 1.5rem 0 1.5rem' }, mainTitle: { color: '#ffffff', margin: '0' }, subTitle: { color: '#ffffff', marginTop: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.75rem' }, infoText: { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' }, accountInfo: { margin: 0, color: '#9ca3af', fontSize: '0.9rem', whiteSpace: 'nowrap' }, link: { color: '#818cf8', textDecoration: 'none', marginLeft: '1rem' }, hr: { border: 'none', borderTop: '1px solid #374151', margin: '2rem 0' }, card: { padding: '1.5rem', border: '1px solid #374151', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#111827' }, cardTitle: { color: '#ffffff', margin: '0 0 1rem 0' }, cardText: { color: '#d1d5db', margin: '0.5rem 0' }, button: { padding: '0.625rem 1rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer', fontWeight: '500' }, disabledButton: { padding: '0.625rem 1rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#4b5563', color: '#9ca3af', cursor: 'not-allowed', fontWeight: '500' }, secondaryButton: { padding: '0.5rem 1rem', border: '1px solid #4b5563', borderRadius: '0.375rem', backgroundColor: '#374151', color: '#d1d5db', cursor: 'pointer', fontWeight: '500' }, dangerButton: { padding: '0.625rem 1rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: '500' }, status: { padding: '1rem', backgroundColor: '#1e3a8a', color: '#bfdbfe', borderRadius: '0.5rem', margin: '1rem 0', wordBreak: 'break-all' }, error: { padding: '1rem', backgroundColor: '#991b1b', color: '#fecaca', borderRadius: '0.5rem', margin: '1rem 0', wordBreak: 'break-all' }, code: { backgroundColor: '#374151', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#9ca3af' }, activePill: { backgroundColor: '#166534', color: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', marginLeft: '0.5rem' }, inactivePill: { backgroundColor: '#991b1b', color: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', marginLeft: '0.5rem' } };

export default function SubscriberDashboard() {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [txStatus, setTxStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [allPlans, setAllPlans] = useState([]);
    const [mySubscriptions, setMySubscriptions] = useState([]);
    const [subscribedPlanIds, setSubscribedPlanIds] = useState(new Set());
    
    // --- UPDATED: Connect function with wallet linking ---
    const connect = async () => {
        setError(''); setTxStatus('');
        try {
            if (!window.ethereum) throw new Error("MetaMask is not installed.");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const addr = await signer.getAddress();
            const contractInstance = getSubscriptionManagerContract(signer);

            setAccount(addr);
            setSigner(signer);
            setContract(contractInstance);

            // Link wallet to Firebase user
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, { 
                    walletAddress: addr,
                    email: user.email,
                }, { merge: true });
                console.log("Wallet address linked to Firebase user.");
            }
        } catch (e) { setError(e.message || "Failed to connect."); }
    };

    const disconnect = () => {
        setAccount(null);
        setSigner(null);
        setContract(null);
        setAllPlans([]);
        setMySubscriptions([]);
    };

    const fetchAllData = useCallback(async () => {
        if (!contract || !account) return;
        setLoading(true); setError('');
        try {
            const nextPlanId = await contract.nextPlanId();
            const plansPromises = [];
            for (let i = 1; i < Number(nextPlanId); i++) {
                plansPromises.push(contract.plans(i).then(p => ({
                    creator: p[0], token: p[1], price: p[2],
                    interval: p[3], active: p[4], id: BigInt(i)
                })));
            }
            const plansData = await Promise.all(plansPromises);
            setAllPlans(plansData);

            const nextSubId = await contract.nextSubscriptionId();
            const subsPromises = [];
            for (let i = 1; i < Number(nextSubId); i++) {
                 subsPromises.push(contract.subscriptions(i).then(s => ({
                    subscriber: s[0], planId: s[1], nextPaymentDue: s[2],
                    lastPaid: s[3], isActive: s[4], id: BigInt(i)
                 })));
            }
            const subsData = await Promise.all(subsPromises);
            
            const userSubs = subsData.filter(s => 
                s.subscriber.toLowerCase() === account.toLowerCase() && 
                s.isActive &&
                (Number(s.nextPaymentDue) * 1000 > Date.now())
            );
            setMySubscriptions(userSubs);
            
            const ids = new Set(userSubs.map(sub => sub.planId.toString()));
            setSubscribedPlanIds(ids);
        } catch (e) {
            console.error(e);
            setError("Failed to fetch data from the contract.");
        } finally { setLoading(false); }
    }, [contract, account]);

    useEffect(() => {
        if (!auth.currentUser) return;
        if(account && contract) {
            fetchAllData();
        }
    }, [account, contract, fetchAllData]);
    
    useEffect(() => {
        if (auth.currentUser) {
            connect();
        }
    }, []);

    // --- UPDATED: handleSubscribe with transaction recording ---
    const handleSubscribe = async (plan) => {
        if (!contract || !signer) return;
        setTxStatus(`Subscribing to Plan #${plan.id}...`); setError('');
        let subscribeTx;
        try {
            const tokenContract = new ethers.Contract(plan.token, ERC20_ABI, signer);
            setTxStatus("Step 1/2: Approving token transfer...");
            const approveTx = await tokenContract.approve(SUBSCRIPTION_MANAGER_ADDRESS, plan.price);
            await approveTx.wait();

            setTxStatus("Step 2/2: Confirming subscription...");
            subscribeTx = await contract.subscribe(plan.id);
            await subscribeTx.wait();

            setTxStatus("Recording transaction to your history...");
            const user = auth.currentUser;
            if (user) {
                const transactionsColRef = collection(db, "users", user.uid, "transactions");
                await addDoc(transactionsColRef, {
                    type: 'SUBSCRIBE',
                    txHash: subscribeTx.hash,
                    planId: plan.id.toString(),
                    timestamp: serverTimestamp(),
                    status: 'success'
                });
            }
            setTxStatus("Successfully subscribed!");
            fetchAllData();
        } catch(e) { setError(e.reason || e.message); setTxStatus(''); }
    };

    // --- UPDATED: handleCancel with transaction recording ---
    const handleCancel = async (subId) => {
         if (!contract) return;
         setTxStatus(`Cancelling subscription #${subId}...`);
         try {
            const tx = await contract.cancel(subId);
            await tx.wait();

            setTxStatus("Recording transaction to your history...");
            const user = auth.currentUser;
            if (user) {
                const transactionsColRef = collection(db, "users", user.uid, "transactions");
                await addDoc(transactionsColRef, {
                    type: 'CANCEL',
                    txHash: tx.hash,
                    subscriptionId: subId.toString(),
                    timestamp: serverTimestamp(),
                    status: 'success'
                });
            }
            setTxStatus("Subscription cancelled!");
            fetchAllData();
         } catch(e) { setError(e.reason || e.message); setTxStatus(''); }
    };

     if (!account) {
        return (
            <div style={styles.wrapper}>
                 <div style={styles.container}>
                    <h2 style={styles.mainTitle}>Subscriber Dashboard</h2>
                    <p style={styles.infoText}>Please connect your wallet to manage your subscriptions.</p>
                    <button style={styles.button} onClick={connect}>Connect Wallet</button>
                    {error && <p style={styles.error}>{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
             <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.mainTitle}>Subscriber Dashboard</h2>
                    <div>
                        <p style={styles.accountInfo}>Connected: <strong>{`${account.slice(0, 6)}...${account.slice(-4)}`}</strong></p>
                        <Link to="/creator" style={styles.link}>Creator View</Link>
                        <Link to="/history" style={styles.link}>History</Link>
                        <button style={{...styles.secondaryButton, marginLeft: '1rem', marginRight: '10px'}} onClick={fetchAllData}>Refresh</button>
                        <button style={styles.secondaryButton} onClick={disconnect}>Disconnect</button>
                    </div>
                </div>
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    {txStatus && <div style={styles.status}><strong>Status:</strong> {txStatus}</div>}
                    {error && <div style={styles.error}>{error}</div>}
                    {loading && <p style={styles.infoText}>Loading blockchain data...</p>}

                    <h3 style={styles.subTitle}>My Active Subscriptions</h3>
                    {mySubscriptions.length > 0 ? (
                        mySubscriptions.map(sub => (
                             <div key={sub.id.toString()} style={styles.card}>
                                <h4 style={styles.cardTitle}>Subscription #{sub.id.toString()} (Plan #{sub.planId.toString()})</h4>
                                <p style={styles.cardText}><strong>Next Payment Due:</strong> {new Date(Number(sub.nextPaymentDue) * 1000).toLocaleString()}</p>
                                <button style={styles.dangerButton} onClick={() => handleCancel(sub.id)}>Cancel Subscription</button>
                            </div>
                        ))
                    ) : !loading && <p style={styles.infoText}>You have no active subscriptions.</p>}
                    
                    <hr style={styles.hr} />
                    <h3 style={styles.subTitle}>Available Plans</h3>
                    {allPlans.filter(p => p.active).length > 0 ? (
                        allPlans.filter(p => p.active).map(plan => (
                             <PlanCard key={plan.id.toString()} plan={plan} styles={styles}>
                                {subscribedPlanIds.has(plan.id.toString()) ? (
                                    <button style={styles.disabledButton} disabled>Subscribed</button>
                                ) : (
                                    <button style={styles.button} onClick={() => handleSubscribe(plan)}>Subscribe</button>
                                )}
                            </PlanCard>
                        ))
                    ) : !loading && <p style={styles.infoText}>No active plans available to subscribe to right now.</p>}
                </div>
            </div>
        </div>
    );
}

