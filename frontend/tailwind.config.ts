import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                'midnight-blue': '#0F172A', // Slate 900
                'champagne-gold': '#C5A059',
                'warm-white': '#F8FAFC',
                'bg-primary': '#0f172a',
                'bg-secondary': '#1e293b',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
                'accent': '#C5A059',
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                serif: ['var(--font-playfair)'],
            },
        },
    },
    plugins: [],
};
export default config;
