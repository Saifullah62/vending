import React, { useState } from 'react';
import axios from 'axios';

function PurchasePage() {
    const [message, setMessage] = useState('');

    const handlePurchase = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.post('http://localhost:3000/api/purchase', {}, config);
            setMessage(`Congratulations! You received: ${response.data.share.cardName} (${response.data.share.percentage}%)`);
        } catch (error) {
            console.error('Error making purchase:', error);
            setMessage('Error making purchase. Please try again.');
        }
    };

    return (
        <div>
            <h2>Purchase a Share</h2>
            <button onClick={handlePurchase}>Buy a Share Pack</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default PurchasePage;
