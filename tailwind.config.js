import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                display: ['"Cinzel"', 'serif'],
                sans: ['"Plus Jakarta Sans"', '"Poppins"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
                price: ['"Plus Jakarta Sans"', '"Poppins"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#FAF8F5',
                    100: '#F5EFEB',
                    200: '#EADFD7',
                    300: '#DECAC0',
                    400: '#D29D84',
                    500: '#C25E3E',
                    600: '#A94A2D',
                    700: '#88371E',
                    800: '#2C2523',
                    900: '#191413',
                },
                stoneAccent: {
                    100: '#F3EFEA',
                    200: '#E5DED5',
                    500: '#8C827A',
                    800: '#3D3835',
                }
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(44, 37, 35, 0.05)',
                'card': '0 12px 30px -4px rgba(44, 37, 35, 0.08), 0 4px 10px -2px rgba(44, 37, 35, 0.03)',
                'float': '0 20px 40px -10px rgba(194, 94, 62, 0.22)',
            }
        },
    },

    plugins: [
        forms,
        require('@tailwindcss/typography'),
    ],
};
