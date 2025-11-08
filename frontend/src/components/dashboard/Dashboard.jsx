import React, { useState, useEffect } from 'react';
import { Search, Code, Filter, Calendar, LogOut } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import MethodBadge from '../common/MethodBadge';
import { fetchAuthSession } from 'aws-amplify/auth';

// --- 1. (VERIFIED) Your Query API's Invoke URL ---
const API_ENDPOINT = 'https://zs98gr5vh5.execute-api.ap-south-1.amazonaws.com/query';

// --- 2. (CRITICAL) YOUR ATHENA TABLE NAME ---
const ATHENA_TABLE_NAME = 'chronos_log_archive_2025'; 

const Dashboard = ({ user, onLogout }) => {
    // --- State for inputs ---
    const [pathKeyword, setPathKeyword] = useState('');
    const [statusCode, setStatusCode] = useState('');
    const [timeRange, setTimeRange] = useState('Last 1 hour');
    const [error, setError] = useState(null);
    
    // --- State for results ---
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to format timestamp from Epoch Seconds (bigint)
    const formatTimestamp = (epochSeconds) => {
        if (!epochSeconds) return 'N/A';
        const ts = Number(epochSeconds); 
        return new Date(ts * 1000).toLocaleString();
    }

    // --- 3. THE FINAL runQuery FUNCTION ---
    const runQuery = async () => {
        setIsLoading(true);
        setError(null);
        setLogs([]);

        let idToken;
        try {
            const session = await fetchAuthSession();
            idToken = session.tokens?.idToken?.toString();
            
            if (!idToken) { throw new Error("No ID token found. Please log in again."); }
        } catch (e) {
            setError("You must be logged in to run a query.");
            setIsLoading(false);
            return;
        }

        try {
            // --- Build the SQL Query String ---
            // Fetch ALL logs ordered by record_id for correct pairing
            let sql = `SELECT * FROM "${ATHENA_TABLE_NAME}"`;
            let whereClauses = [];
            
            // Status Code Filter
            if (statusCode) {
                const codes = statusCode.split(',').map(s => s.trim()).filter(s => s);
                if (codes.length > 0) {
                    whereClauses.push(`statusCode IN (${codes.map(c => `'${c}'`).join(',')})`);
                }
            }
            
            // Path/Keyword Filter
            if (pathKeyword) {
                whereClauses.push(`path LIKE '%${pathKeyword}%'`);
            }

            // Time Range Logic (correctly uses integer comparison)
            if (timeRange && timeRange !== 'All Time') {
                const now = new Date();
                let startTime;
                
                if (timeRange === 'Last 15 minutes') { startTime = new Date(now.getTime() - 15 * 60 * 1000); } 
                else if (timeRange === 'Last 1 hour') { startTime = new Date(now.getTime() - 60 * 60 * 1000); } 
                else if (timeRange === 'Last 24 hours') { startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); } 
                else if (timeRange === 'Last 7 days') { startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); }

                if (startTime) {
                    const startTimeInSeconds = Math.floor(startTime.getTime() / 1000);
                    whereClauses.push(`"timestamp" > ${startTimeInSeconds}`);
                }
            }

            if (whereClauses.length > 0) { sql += ` WHERE ${whereClauses.join(' AND ')}`; }

            // CRITICAL: Order by record_id and then timestamp (DESC) to keep pairs together
            sql += ' ORDER BY record_id, "timestamp" DESC LIMIT 100'; 

            console.log("Running SQL:", sql);

            const requestBody = { query: sql };

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(`Query FAILED: ${errorJson.error || errorText}`);
                } catch (e) {
                    throw new Error(`API Gateway error: ${response.status} ${errorText}`);
                }
            }

            const data = await response.json();
            const allLogs = data.Rows || [];
            
            // --- CRITICAL FIX: LOG PAIRING LOGIC ---
            const requests = new Map();
            const finalDisplayLogs = [];
            
            // 1. Map all requests first (to get their method/path)
            allLogs.forEach(log => {
                if (log.type === 'request') {
                    requests.set(log.record_id, log);
                }
            });

            // 2. Iterate over all logs and only process the 'response' records
            // 2. Iterate over all logs and only process the 'response' records
            allLogs.forEach(resLog => {
                if (resLog.type === 'response') {
                    const reqLog = requests.get(resLog.record_id);
                    
                    if (reqLog) { 
                        // Calculate latency (Response time - Request time) in seconds
                        const latencySeconds = Number(resLog.timestamp) - Number(reqLog.timestamp);
    //                     console.log('Request timestamp:', reqLog.timestamp);
    // console.log('Response timestamp:', resLog.timestamp);
    // // const latencySeconds = Number(resLog.timestamp) - Number(reqLog.timestamp);
    // console.log('Latency (seconds):', latencySeconds);
    // console.log('Latency (ms):', latencySeconds * 1000);
                        
                        finalDisplayLogs.push({
                            record_id: resLog.record_id,
                            timestamp: reqLog.timestamp, // Use request timestamp for chronological order
                            method: reqLog.method, // Pulled from the Request log
                            path: reqLog.path,     // Pulled from the Request log
                            statusCode: resLog.statuscode, // Status comes from the Response log
                            latency: `${latencySeconds * 1000}ms` 
                        });
                    }
                }
            });
            // --- END CRITICAL FIX ---
            
            setLogs(finalDisplayLogs); 

        } catch (err) {
            console.error("Query failed:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial data on mount
    useEffect(() => {
        runQuery();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-900 text-gray-200 font-sans">
            {/* --- Header JSX --- */}
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Chronos</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">Welcome</span>
                        <button onClick={onLogout} className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- Main Content & Query Builder JSX --- */}
            <main className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">API Log Explorer</h2>
                    <p className="text-gray-400">Query and inspect historical API request-response traffic.</p>
                </div>

                {/* Query Builder (Wired up to state) */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Code size={14} className="mr-2" />Path or Keyword</label>
                            <input 
                                type="text" 
                                placeholder="/user/profile" 
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={pathKeyword}
                                onChange={(e) => setPathKeyword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Filter size={14} className="mr-2" />Status Code</label>
                            <input 
                                type="text" 
                                placeholder="200, 404" 
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={statusCode}
                                onChange={(e) => setStatusCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Calendar size={14} className="mr-2" />Time Range</label>
                            <select 
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option>Last 15 minutes</option>
                                <option>Last 1 hour</option>
                                <option>Last 24 hours</option>
                                <option>Last 7 days</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <button onClick={runQuery} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-bold py-2 px-6 rounded-md transition flex items-center justify-center ml-auto">
                            <Search size={16} className="mr-2" />
                            {isLoading ? 'Running...' : 'Run Query'}
                        </button>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-800/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8">
                        <strong>Error:</strong> {error}
                    </div>
                )}


                {/* Results Display */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Path</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                                {isLoading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400">Loading results...</td>
                                    </tr>
                                )}
                                {!isLoading && logs.length === 0 && !error && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400">No logs found. Try adjusting your query.</td>
                                    </tr>
                                )}
                                
                                {/* --- 4. (FINAL TABLE BODY) --- */}
                                {!isLoading && logs.map((log) => (
                                    <tr key={log.record_id} className="hover:bg-gray-700/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{formatTimestamp(log.timestamp)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><MethodBadge method={log.method} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{log.path}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={Number(log.statusCode)} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{log.latency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;