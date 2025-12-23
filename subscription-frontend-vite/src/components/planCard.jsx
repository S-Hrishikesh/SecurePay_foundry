import React from 'react';
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.11.1/ethers.min.js";

// Note: The 'styles' object is passed in as a prop from the parent page.
export default function PlanCard({ plan, children, isMyPlan, onToggleStatus, subscriberCount, styles }) {
    const formatPrice = (price, tokenAddress) => {
        try {
            // Use 6 decimals for the known Amoy USDC address, otherwise default to 18.
            const decimals = tokenAddress.toLowerCase() === '0x41e94eb019c0762f9bfc45459c829f8f3a7b823b' ? 6 : 18;
            return ethers.formatUnits(price || 0, decimals);
        } catch { return "0.0"; }
    };
    const formatInterval = (interval) => {
        const days = Number(interval) / 86400;
        return days === 1 ? '1 day' : `${days.toFixed(2)} days`;
    };

    return (
        <div style={styles.card}>
            <h4 style={styles.cardTitle}>Plan #{plan.id.toString()} {plan.active ? <span style={styles.activePill}>Active</span> : <span style={styles.inactivePill}>Inactive</span>}</h4>
            {isMyPlan && <p style={styles.cardText}><strong>Active Subscribers:</strong> {subscriberCount}</p>}
            <p style={styles.cardText}><strong>Price:</strong> {formatPrice(plan.price, plan.token)} Tokens / {formatInterval(plan.interval)}</p>
            <p style={styles.cardText}><strong>Token:</strong> <code style={styles.code}>{plan.token}</code></p>
            <p style={styles.cardText}><strong>Creator:</strong> <code style={styles.code}>{plan.creator}</code></p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                {isMyPlan && (
                     <button style={styles.secondaryButton} onClick={() => onToggleStatus(plan.id, !plan.active)}>
                        {plan.active ? 'Deactivate' : 'Activate'}
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
