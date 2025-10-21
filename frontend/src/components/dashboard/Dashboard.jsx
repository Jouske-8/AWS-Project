import React, { useState, useEffect } from 'react';
import { Search, Code, Filter, Calendar, LogOut } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import MethodBadge from '../common/MethodBadge';
import { mockApiLogs } from '../../data/mockData';

const Dashboard = ({ user, onLogout }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const runQuery = () => {
        setIsLoading(true);
        // MOCK: Simulate fetching data
        setTimeout(() => {
            setLogs(mockApiLogs);
            setIsLoading(false);
        }, 1500);
        // REAL IMPLEMENTATION:
        // This would involve making an authenticated API call to your
        // "Query & Analytics Module" which then runs the Athena query.
    };

    useEffect(() => {
        // Load initial data on mount
        runQuery();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-900 text-gray-200 font-sans">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Chronos</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">Welcome, {user.username}</span>
                        <button onClick={onLogout} className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">API Log Explorer</h2>
                    <p className="text-gray-400">Query and inspect historical API request-response traffic.</p>
                </div>

                {/* Query Builder */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Code size={14} className="mr-2" />Path or Keyword</label>
                            <input type="text" placeholder="/api/v1/users or 'error'" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Filter size={14} className="mr-2" />Status Code</label>
                            <input type="text" placeholder="200, 404, 5xx" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 flex items-center mb-2"><Calendar size={14} className="mr-2" />Time Range</label>
                            <select className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none">
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
                                {!isLoading && logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400">No logs found. Try adjusting your query.</td>
                                    </tr>
                                )}
                                {!isLoading && logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-700/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{log.timestamp}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><MethodBadge method={log.method} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{log.path}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={log.status} /></td>
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
