// API Configuration for Production and Development
// This file centralizes all API endpoint URLs

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
    analyze: `${API_BASE_URL}/analyze`,
    explain: `${API_BASE_URL}/explain`,
    scan: `${API_BASE_URL}/scan`,
    root: `${API_BASE_URL}/`,
};

export { API_BASE_URL };
