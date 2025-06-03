"use client";
import { muiTheme } from "@/styles/theme";
import { ThemeProvider, CssBaseline } from "@mui/material";

export function ClientThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
