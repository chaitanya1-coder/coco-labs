/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: '#FFD700',
                dark: '#1a1a1a',
            },
        },
    },
    plugins: [],
}
