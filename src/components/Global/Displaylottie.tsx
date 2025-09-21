import React from 'react';
import Lottie from 'react-lottie-player';

export const DisplayLottie = ({ animationData }) => {
    return (
        <Lottie
            loop
            animationData={animationData}
            play
            style={{ width: '100%', height: '100%' }}
            rendererSettings={{
                preserveAspectRatio: 'xMidYMid slice',
                // Apply color change to all fill layers
                colorFilters: [
                    {
                        keypath: '**.Fill',  // Matches all fill layers
                        value: '#E52248' // New color (red)
                    }
                ]
            }}
        />
    );
};
