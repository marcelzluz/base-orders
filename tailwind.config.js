module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base: "#ccf728", // Título e principal
                "background-main": "#484615", // Background principal
                "background-sec": "#2c290a", // Background secundário
                accent: "#ba94f2", // Secundário visuais/subtítulos
                highlight: "#ccf728", // Principal para subtítulos/layout
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
