import React, { useState, useEffect } from 'react';
// import { Amplify } from 'aws-amplify';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import { cognitoConfig } from './config/awsConfig';

// Uncomment the line below when you have your actual Cognito details
// Amplify.configure(cognitoConfig);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login'); // 'login', 'signup', or 'dashboard'

    // This effect can be used to check for an existing session when the app loads
    useEffect(() => {
        const checkUser = async () => {
            try {
                // REAL IMPLEMENTATION:
                // const currentUser = await Auth.currentAuthenticatedUser();
                // setUser(currentUser);
                // setPage('dashboard');
            } catch (error) {
                // No user signed in
                setUser(null);
                setPage('login');
            }
        };
        // checkUser();
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
        // MOCK:
        setUser(null);
        setPage('login');
        // REAL IMPLEMENTATION:
        // try {
        //     await Auth.signOut();
        //     setUser(null);
        //     setPage('login');
        // } catch (error) {
        //     console.error('Error signing out: ', error);
        // }
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