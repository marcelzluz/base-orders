"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { OrderTable } from "@/components/OrderTable";
import { OrderForm } from "@/components/OrderForm";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useOrderStore } from "@/store/orderStore";
import { MswInitializer } from "@/components/MswInitializer";
import { CircularProgress } from "@mui/material";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["700", "800"],
});

export default function HomePage() {
    const [mounted, setMounted] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [mswReady, setMswReady] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (mswReady) {
            useOrderStore.getState().fetchOrders();
        }
    }, [mswReady]);

    if (!mounted) return null;

    if (!mswReady) {
        return (
            <>
                <MswInitializer onReady={() => setMswReady(true)} />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        minHeight: "100vh",
                        alignItems: "center",
                        bgcolor: "background.default",
                    }}>
                    <CircularProgress color="primary" />
                </Box>
            </>
        );
    }

    return (
        <>
            <MswInitializer onReady={() => setMswReady(true)} />
            <Box
                sx={{
                    bgcolor: "customColors.bgMain",
                    minHeight: "100vh",
                    py: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 4,
                    }}>
                    <Typography
                        variant="h2"
                        sx={{
                            color: "customColors.base",
                            fontWeight: 800,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            fontFamily: "Montserrat, Arial, sans-serif",
                            lineHeight: 1,
                            fontSize: 36,
                            mb: 0,
                        }}>
                        BASE
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: "customColors.base",
                            fontWeight: 700,
                            letterSpacing: 1,
                            fontFamily: "Montserrat, Arial, sans-serif",
                            lineHeight: 1,
                            fontSize: 20,
                        }}>
                        EXCHANGE
                    </Typography>
                </Box>
                <Box
                    sx={{
                        border: "2px solid",
                        borderColor: "customColors.base",
                        borderRadius: 2,
                        p: 3,
                        bgcolor: "customColors.bgPaper",
                        minWidth: 1280,
                        minHeight: 720,
                        position: "relative",
                        width: 600,
                        boxShadow: 5,
                    }}>
                    {/* Botão Criar Ordem */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowForm(true)}
                        sx={{
                            fontWeight: "bold",
                            color: "customColors.bgPaper",
                            backgroundColor: "customColors.base",
                            position: "absolute",
                            right: 32,
                            top: 20,
                            px: 3,
                            py: 1,
                            borderRadius: 1,
                            boxShadow: 2,
                        }}>
                        CRIAR ORDEM
                    </Button>

                    {/* Container da tabela */}
                    <Box
                        sx={{
                            mt: 7,
                            border: "2px solid",
                            borderColor: "customColors.accent",
                            borderRadius: 2,
                            background: "#fff",
                            p: 1.5,
                            minHeight: 520,
                            minWidth: 440,
                            mx: "auto",
                        }}>
                        <OrderTable />
                    </Box>
                </Box>

                {/* Modal Criar Ordem */}
                {showForm && (
                    <OrderForm
                        open={showForm}
                        onClose={() => setShowForm(false)}
                    />
                )}
            </Box>
        </>
    );
}
