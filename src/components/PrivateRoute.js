import React from 'react';
import { Navigate } from 'react-router-dom';

// Checks if the user is logged in
const PrivateRoute = ({ children }) => {
    const authToken = localStorage.getItem('authToken');

    return authToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
