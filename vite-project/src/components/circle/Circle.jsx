import React from 'react';
import './Circle.css';

export default function Circle({ color = 'grey', text = '' }) {
    return (
        <div className="circle-icon" style={{ backgroundColor: color }}>
            <span className="circle-text">{text}</span>
        </div>
    );
}
