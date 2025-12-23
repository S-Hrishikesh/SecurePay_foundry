import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- FIXED: Corrected the import path to be more explicit ---
import { auth } from '../firebase.js'; 
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// --- Styles for the Landing Page ---
const styles = {
    wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem', boxSizing: 'border-box' },
    container: { width: '100%', maxWidth: '500px', padding: '2.5rem', border: '1px solid #374151', borderRadius: '0.75rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#1f2937', color: '#d1d5db', textAlign: 'center' },
    mainTitle: { color: '#ffffff', margin: '0 0 1rem 0' },
    infoText: { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem', marginBottom: '2rem' },
    buttonContainer: { display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' },
    button: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
    error: { padding: '1rem', backgroundColor: '#991b1b', color: '#fecaca', borderRadius: '0.5rem', marginTop: '1.5rem', wordBreak: 'break-all' },
};

// --- Google Icon SVG ---
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 488 512">
        <path fill="#ffffff" d="M488 261.8C488 403.3 381.5 512 244 512S0 403.3 0 261.8S106.6 8 244 8s244 106.6 244 243.8zM88 256c0-9.6 1.4-19.1 4-28.4L244 376v109.8c-23.3 0-45.3-4.2-65.4-11.8L88 297.2zm316-25.4l-112-167.8c21.2 5 41.6 12.3 60.2 21.7L404 230.6zM244 65.5L142.2 228.3l-55.8-132.2c27.1-18.7 58.7-29.6 92.4-32.5V65.5zM244 280.9L108.8 67.3c-20.9 22.4-36.8 49.3-46.8 79.5L244 280.9zm244-19.1c-14.2-44.5-40.4-81-74.8-109.5L244 246.3v111.4l112-167.8c1.3-2 2.5-4 3.7-6.1z"/>
    </svg>
);


export default function LandingPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (role) => {
        const provider = new GoogleAuthProvider();
        try {
            setError(''); // Clear previous errors
            await signInWithPopup(auth, provider);
            // After successful sign-in, redirect to the chosen dashboard
            if (role === 'subscriber') {
                navigate('/subscriber');
            } else if (role === 'creator') {
                navigate('/creator');
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
            setError(error.message || "Failed to sign in with Google. Please try again.");
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.mainTitle}>Welcome to SecurePay</h2>
                <p style={styles.infoText}>Your decentralized subscription platform. Please sign in to continue.</p>
                <div style={styles.buttonContainer}>
                    <button style={styles.button} onClick={() => handleLogin('subscriber')}>
                        <GoogleIcon />
                        Sign In as a Subscriber
                    </button>
                    <button style={styles.button} onClick={() => handleLogin('creator')}>
                        <GoogleIcon />
                        Sign In as a Creator
                    </button>
                </div>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
}