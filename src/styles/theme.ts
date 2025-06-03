import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
    palette: {
        customColors: {
            base: "#ccf728", // Verde neon (usado só no título, botão, borda, etc)
            accent: "#ba94f2", // Lilás (bordas internas)
            bgMain: "#484615", // Fundo geral
            bgPaper: "#2c290a", // Card/painel
        },
    },
    typography: {
        fontFamily: ["Arial", "Helvetica", "sans-serif"].join(","),
    },
});

declare module "@mui/material/styles" {
    interface Palette {
        customColors?: {
            base: string;
            accent: string;
            bgMain: string;
            bgPaper: string;
        };
    }
    interface PaletteOptions {
        customColors?: {
            base: string;
            accent: string;
            bgMain: string;
            bgPaper: string;
        };
    }
}
