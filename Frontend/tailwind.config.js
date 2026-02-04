/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "rgb(var(--border))",
                input: "rgb(var(--input))",
                ring: "rgb(var(--ring))",
                background: "rgb(var(--background))",
                foreground: "rgb(var(--foreground))",
                primary: {
                    DEFAULT: "rgb(var(--primary))",
                    dark_blue: "rgb(var(--dark-blue-primary))",
                    foreground: "rgb(var(--primary-foreground))",
                    hover: "rgb(var(--primary-hover))",
                },
                secondary: {
                    DEFAULT: "rgb(var(--secondary))",
                    foreground: "rgb(var(--secondary-foreground))",
                    hover: "rgb(var(--secondary-hover))",
                },
                gray: {
                    DEFAULT: "rgb(var(--grey-standard))",
                    blue: "rgb(var(--gray-blue))",
                    light: "rgb(var(--gray-light))",
                },
                outline: {
                    dark: "rgb(var(--outline-dark-blue))",
                    foreground: "rgb(var(--outline-dark-foreground))",
                },
                destructive: {
                    DEFAULT: "rgb(var(--destructive))",
                    foreground: "rgb(var(--destructive-foreground))",
                    outline: "rgb(var(--destructive-outline))",
                    hover: "rgb(var(--destructive-hover))",
                },
                success: {
                    DEFAULT: "rgb(var(--success))",
                    foreground: "rgb(var(--success-foreground))",
                },
                muted: {
                    DEFAULT: "rgb(var(--muted))",
                    foreground: "rgb(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent))",
                    foreground: "rgb(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "rgb(var(--card))",
                    foreground: "rgb(var(--card-foreground))",
                },
                secondary_card: {
                    DEFAULT: "rgb(var(--secondary-card))",
                    foreground: "rgb(var(--secondary-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            maxWidth: {
                card: "28rem",
                '2xs_card': "16rem",
                xs_card: "24rem",
                xl_card: "45.65rem",
                half: "50%"
            },
            minWidth: {
                xl_card: "48rem",
            },

            fontSize: {
                '4.5xl': '2.70rem',
                '2xs': '0.6rem',
            },

            backgroundImage: {
                'grid-pattern': `
                linear-gradient(to right, rgb(226 232 240 / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(226 232 240 / 0.3) 1px, transparent 1px)`,
            },

            backgroundSize: {
                'grid': '24px 24px',
            }

        },
    },
    plugins: [require("tailwindcss-animate")],
}