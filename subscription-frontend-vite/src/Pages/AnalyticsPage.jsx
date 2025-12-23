import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.11.1/ethers.min.js";
// --- NEW: Import the charting components from recharts ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Constants, ABI, and Styles ---
// Note: We are duplicating these here for now. In a larger app, you would move these to a shared config file.
const SUBSCRIPTION_MANAGER_ABI = [{"type":"constructor","inputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"cancel","inputs":[{"name":"subscriptionId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"createPlan","inputs":[{"name":"tokenAddr","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"interval","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"function","name":"isActive","inputs":[{"name":"user","type":"address","internalType":"address"},{"name":"planId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"nextPlanId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"nextSubscriptionId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"plans","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"creator","type":"address","internalType":"address"},{"name":"token","type":"address","internalType":"contract IERC20"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"interval","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"renew","inputs":[{"name":"subscriptionId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setPlanStatus","inputs":[{"name":"planId","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"subscribe","inputs":[{"name":"planId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"function","name":"subscriptions","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"subscriber","type":"address","internalType":"address"},{"name":"planId","type":"uint256","internalType":"uint256"},{"name":"nextPaymentDue","type":"uint256","internalType":"uint256"},{"name":"lastPaid","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"}];
const SUBSCRIPTION_MANAGER_ADDRESS = "0x7c488e429e2b9a014df5fdccc32076ae513f7861";
function getSubscriptionManagerContract(s){return new ethers.Contract(ethers.getAddress(SUBSCRIPTION_MANAGER_ADDRESS),SUBSCRIPTION_MANAGER_ABI,s);}
const styles = { wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '4rem 1rem', boxSizing: 'border-box' }, container: { width: '100%', maxWidth: '800px', border: '1px solid #374151', borderRadius: '0.75rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', color: '#d1d5db' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 1.5rem 0 1.5rem' }, mainTitle: { color: '#ffffff', margin: '0' }, infoText: { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' }, link: { color: '#818cf8', textDecoration: 'none', marginLeft: '1rem' }, chartContainer: { height: '400px', marginTop: '2rem' } };

export default function AnalyticsPage() {
    const [account, setAccount] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsData = useCallback(async (walletAddress) => {
        if (!walletAddress) return;
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = getSubscriptionManagerContract(provider);

            // 1. Fetch all plans and all subscriptions from the blockchain
            const nextPlanId = await contract.nextPlanId();
            const plansPromises = [];
            for (let i = 1; i < Number(nextPlanId); i++) {
                plansPromises.push(contract.plans(i).then(p => ({ creator: p[0], id: BigInt(i) })));
            }
            const allPlans = await Promise.all(plansPromises);

            const nextSubId = await contract.nextSubscriptionId();
            const subsPromises = [];
            for (let i = 1; i < Number(nextSubId); i++) {
                 subsPromises.push(contract.subscriptions(i).then(s => ({ planId: s[1], isActive: s[4], nextPaymentDue: s[2] })));
            }
            const allSubs = await Promise.all(subsPromises);

            // 2. Filter for plans created by the current user
            const myPlans = allPlans.filter(p => p.creator.toLowerCase() === walletAddress.toLowerCase());
            const myPlanIds = new Set(myPlans.map(p => p.id.toString()));

            // 3. Calculate active subscribers for each of the user's plans
            const counts = new Map();
            allSubs.forEach(sub => {
                const planIdStr = sub.planId.toString();
                // Check if this subscription is for one of the creator's plans and is active
                if (myPlanIds.has(planIdStr) && sub.isActive && (Number(sub.nextPaymentDue) * 1000 > Date.now())) {
                    counts.set(planIdStr, (counts.get(planIdStr) || 0) + 1);
                }
            });

            // 4. Format the data for the chart
            const chartData = myPlans.map(plan => ({
                name: `Plan #${plan.id.toString()}`,
                subscribers: counts.get(plan.id.toString()) || 0,
            }));
            
            setAnalyticsData(chartData);

        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Simple connect to get the wallet address
        const getAccount = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const addr = await signer.getAddress();
                setAccount(addr);
                fetchAnalyticsData(addr);
            }
        };
        getAccount();
    }, [fetchAnalyticsData]);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.mainTitle}>Creator Analytics</h2>
                    <div>
                        <Link to="/creator" style={styles.link}>Creator Dashboard</Link>
                    </div>
                </div>
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    {loading && <p style={styles.infoText}>Loading analytics data...</p>}
                    {!loading && analyticsData.length === 0 && <p style={styles.infoText}>You have no plans with active subscribers to analyze.</p>}
                    
                    {!loading && analyticsData.length > 0 && (
                        <div style={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analyticsData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis allowDecimals={false} stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                    <Legend />
                                    <Bar dataKey="subscribers" fill="#818cf8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}