import React from 'react';

const Loader = () => {
    return (
        <div className="loader">
            <div className="circle">
                <div className="dot" />
                <div className="outline" />
            </div>
            <div className="circle">
                <div className="dot" />
                <div className="outline" />
            </div>
            <div className="circle">
                <div className="dot" />
                <div className="outline" />
            </div>
            <div className="circle">
                <div className="dot" />
                <div className="outline" />
            </div>
        </div>
    );
}

export default Loader;
