"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewOrderForm } from "@/types/orderForm";
import { newOrderSchema } from "@/types/orderFormSchema";
import { useOrderStore } from "@/store/orderStore";
import { symbolList } from "@/mocks/symbols";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    TextField,
    Alert,
} from "@mui/material";
import { z } from "zod";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function OrderForm({ open, onClose }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<z.input<typeof newOrderSchema>>({
        resolver: zodResolver(newOrderSchema),
        defaultValues: {
            symbol: "PETR4",
            quantity: "",
            price: "",
            side: undefined,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (!open) {
            reset({
                symbol: "PETR4",
                quantity: "",
                price: "",
                side: undefined,
            });
        }
    }, [open, reset]);

    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState<NewOrderForm | null>(null);
    const toast = useToast();
    const createOrder = useOrderStore((s) => s.createOrder);

    const onSubmit = async (data: NewOrderForm) => {
        setPendingData(data);
        setShowConfirm(true);
    };
    const handleConfirm = async () => {
        if (!pendingData) return;
        try {
            await createOrder(pendingData);
            toast.dispatch({
                status: "success",
                title: "Ordem criada com sucesso!",
            });
            reset({
                symbol: "PETR4",
                quantity: "",
                price: "",
                side: undefined,
            });
            onClose();
        } catch (e: any) {
            toast.dispatch({
                status: "error",
                title: e.message || "Erro ao criar ordem",
            });
            onClose();
        }
        setShowConfirm(false);
        setPendingData(null);
    };

    const inputProps = {
        step: 100,
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle
                    sx={{ bgcolor: "#fff", color: "#222", fontWeight: 700 }}>
                    Nova Ordem
                </DialogTitle>
                <form
                    onSubmit={handleSubmit(onSubmit as any)}
                    autoComplete="off">
                    <DialogContent
                        dividers
                        sx={{
                            bgcolor: "#fff",
                            color: "#222",
                        }}>
                        <Controller
                            name="symbol"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Símbolo"
                                    fullWidth
                                    margin="normal"
                                    value={field.value || ""}
                                    error={!!errors.symbol}
                                    helperText={errors.symbol?.message}
                                    required>
                                    <MenuItem value="">Selecione...</MenuItem>
                                    {symbolList.map((symbol) => (
                                        <MenuItem key={symbol} value={symbol}>
                                            {symbol}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="side"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Lado"
                                    fullWidth
                                    margin="normal"
                                    value={field.value || ""}
                                    error={!!errors.side}
                                    helperText={errors.side?.message}
                                    required>
                                    <MenuItem value="">Selecione...</MenuItem>
                                    <MenuItem
                                        value="buy"
                                        sx={{ color: "#16a34a" }}>
                                        Compra
                                    </MenuItem>
                                    <MenuItem
                                        value="sell"
                                        sx={{ color: "#dc2626" }}>
                                        Venda
                                    </MenuItem>
                                </TextField>
                            )}
                        />
                        <Controller
                            name="quantity"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="Quantidade"
                                    fullWidth
                                    margin="normal"
                                    slotProps={{
                                        htmlInput: inputProps,
                                    }}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (
                                            val === "" ||
                                            (Number(val) >= 1 &&
                                                !val.startsWith("-"))
                                        ) {
                                            field.onChange(
                                                val === ""
                                                    ? undefined
                                                    : Number(val),
                                            );
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            ["e", "E", "+", "-", "."].includes(
                                                e.key,
                                            )
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={!!errors.quantity}
                                    helperText={errors.quantity?.message}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Preço"
                                    fullWidth
                                    margin="normal"
                                    type="text"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        val = val.replace(/[^0-9.,]/g, "");
                                        const parts = val.split(/[.,]/);
                                        if (parts.length > 2) {
                                            val =
                                                parts[0] +
                                                "," +
                                                parts.slice(1).join("");
                                        }

                                        val = val.replace(
                                            /^(\d+)([.,])(\d{0,2}).*$/,
                                            "$1$2$3",
                                        );

                                        field.onChange(val);
                                    }}
                                    error={!!errors.price}
                                    helperText={
                                        errors.price?.message ?? "Ex: 10,00"
                                    }
                                    required
                                />
                            )}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#fff" }}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            color="error">
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            sx={{
                                backgroundColor: "customColors.base",
                                color: "customColors.bgPaper",
                            }}>
                            Criar Ordem
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <ConfirmationModal
                open={showConfirm}
                title="Criar Ordem"
                description="Deseja criar uma ordem?"
                onCancel={() => {
                    setShowConfirm(false);
                    setPendingData(null);
                }}
                onConfirm={handleConfirm}
                loading={isSubmitting}
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
            />
        </>
    );
}
