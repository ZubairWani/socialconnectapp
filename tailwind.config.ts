import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#97E4B1',
                primaryDark: '#8ddba7',
                secondary: '#EEEEEE',
                tertiary: '#12372A',
            },
            fontFamily: {
                handwriting: ['Caveat', 'cursive'], // Add this for the handwriting font
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite', // Add this for the slow spinning animation
            },
        },
    },
    plugins: [require('tailwind-scrollbar')],
};

export default config;