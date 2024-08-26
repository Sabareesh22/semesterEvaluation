// Loading.js
import React from 'react';
import './Loading.css'; // Optional, for styling

const Loading = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-animation">
            <span className="loader"></span>
            </div>
        </div>
    );
};

export default Loading;
