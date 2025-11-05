import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import './config/awsConfig';

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login'); // 'login', 'signup', or 'dashboard'

    // This effect can be used to check for an existing session when the app loads
    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                // console.log(currentUser);
                setPage('dashboard');
            } catch (error) {
                // No user signed in
                setUser(null);
                setPage('login');
            }
        };
        checkUser();
    }, []);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setPage('dashboard');
    };

    const handleSignup = (signedUpUser) => {
        setUser(signedUpUser);
        setPage('dashboard');
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            setPage('login');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    // Simple router
    switch (page) {
        case 'signup':
            return <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setPage('login')} />;
        case 'dashboard':
            return user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} />;
        case 'login':
        default:
            return <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} />;
    }
}