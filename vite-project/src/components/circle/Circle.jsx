import React from 'react';
import './Circle.css';

export default function Circle({ color = 'grey', text = '' ,onClick}) {
    return (
        <div onClick={onClick} className="circle-icon" style={{ backgroundColor: color }}>
            <span className="circle-text">{text}</span>
        </div>
    );
}
