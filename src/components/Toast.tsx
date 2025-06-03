"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type ToastStatus = "success" | "warning" | "error";

interface ToastPayload {
    status: ToastStatus;
    title: string;
    autoHideDuration?: number;
}

interface ToastContextValue {
    dispatch: (payload: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor>("success");
    const [duration, setDuration] = useState<number>(3000);

    function dispatch({ status, title, autoHideDuration }: ToastPayload) {
        setMessage(title);
        setSeverity(status);
        setDuration(autoHideDuration ?? 4000);
        setOpen(true);
    }

    const handleClose = (
        _event?: React.SyntheticEvent | Event,
        reason?: string,
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <ToastContext.Provider value={{ dispatch }}>
            {children}

            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    sx={{ width: "100%" }}>
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}
