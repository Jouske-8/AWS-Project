// --- MOCK DATA ---
// This data simulates what you might get back from an Athena query.
export const mockApiLogs = [
    { id: 1, timestamp: '2023-10-27 10:00:15', method: 'GET', path: '/api/v1/users', status: 200, latency: '120ms', ip: '192.168.1.1' },
    { id: 2, timestamp: '2023-10-27 10:01:22', method: 'POST', path: '/api/v1/users', status: 201, latency: '250ms', ip: '192.168.1.2' },
    { id: 3, timestamp: '2023-10-27 10:02:05', method: 'GET', path: '/api/v1/products/123', status: 200, latency: '80ms', ip: '192.168.1.1' },
    { id: 4, timestamp: '2023-10-27 10:03:10', method: 'GET', path: '/api/v1/products/999', status: 404, latency: '60ms', ip: '192.168.1.3' },
    { id: 5, timestamp: '2023-10-27 10:04:30', method: 'PUT', path: '/api/v1/users/5', status: 401, latency: '150ms', ip: '192.168.1.4' },
    { id: 6, timestamp: '2023-10-27 10:05:00', method: 'DELETE', path: '/api/v1/orders/789', status: 500, latency: '500ms', ip: '192.168.1.2' },
    { id: 7, timestamp: '2023-10-27 10:06:18', method: 'GET', path: '/api/v1/analytics', status: 200, latency: '320ms', ip: '192.168.1.5' },
];
