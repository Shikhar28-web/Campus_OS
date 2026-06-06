import axios from 'axios';

// Use the current host's IP for network access
const getBaseURL = () => {
  // If running on localhost, use the network IP
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Use the same host IP but port 5000 for backend
  return `http://${window.location.hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

export default api;
