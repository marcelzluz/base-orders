"use client";
import { useState, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Alert,
    Box,
} from "@mui/material";
import { Order } from "@/types/order";
import { useOrderStore } from "@/store/orderStore";
import { getEditOrderSchema } from "@/types/editOrderSchema";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";

interface OrderEditFormProps {
    open: boolean;
    order: Order;
    onClose: () => void;
}

interface RawEditForm {
    quantity: string;
    price: string;
}

export function OrderEditForm({ open, order, onClose }: OrderEditFormProps) {
    const filledAmount = order.quantity - order.pendingQuantity;

    const editOrderSchema = useMemo(
        () => getEditOrderSchema(filledAmount),
        [filledAmount],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<RawEditForm>({
        resolver: zodResolver(editOrderSchema as any),
        defaultValues: {
            quantity: order.quantity.toString(),
            price: order.price.toFixed(2).replace(".", ","),
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (open) {
            reset({
                quantity: order.quantity.toString(),
                price: order.price.toFixed(2).replace(".", ","),
            });
        }
    }, [open, order, reset]);

    const updateOrder = useOrderStore((s) => s.updateOrder);
    const toast = useToast();
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState<RawEditForm | null>(null);

    const onSubmit = (data: RawEditForm) => {
        setPendingData(data);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        console.log("Confirming update, pendingData:", pendingData);
        if (!pendingData) return;

        const parsedQty = Number(pendingData.quantity);
        const rawPrice = pendingData.price;
        const parsedPrice =
            typeof rawPrice === "string"
                ? Number(rawPrice.replace(",", "."))
                : rawPrice; // já é número
        console.log("Parsed price:", parsedPrice);
        console.log("Order ID:", order.id);

        try {
            await updateOrder(order.id.toString(), {
                quantity: parsedQty,
                price: parsedPrice,
            });
            toast.dispatch({
                status: "success",
                title: `Ordem #${order.id} atualizada com sucesso!`,
            });
            setShowConfirm(false);
            setPendingData(null);
            onClose();
        } catch (e: any) {
            toast.dispatch({
                status: "error",
                title: "Erro ao atualizar ordem",
            });
            setShowConfirm(false);
            setPendingData(null);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle
                    sx={{ fontWeight: 700, bgcolor: "#fff", color: "#222" }}>
                    Editar Ordem — {order.id}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <DialogContent
                        dividers
                        sx={{ bgcolor: "#fff", color: "#222" }}>
                        {/* Símbolo (só leitura) */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Símbolo"
                                value={order.symbol}
                                fullWidth
                                margin="normal"
                                disabled
                            />
                        </Box>
                        {/* Lado (só leitura) */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Lado"
                                value={
                                    order.side === "buy" ? "Compra" : "Venda"
                                }
                                fullWidth
                                margin="normal"
                                disabled
                            />
                        </Box>
                        {/* Já Executado (informativo) */}
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary">
                                Já Executado
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}>
                                {filledAmount}
                            </Typography>
                        </Box>

                        {/* Campo Quantidade */}
                        <Controller
                            name="quantity"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="text"
                                    label="Quantidade"
                                    fullWidth
                                    margin="normal"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const onlyDigits =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                "",
                                            );
                                        field.onChange(onlyDigits);
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            ["e", "E", "+", "-", ","].includes(
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

                        {/* Campo Preço */}
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
                            sx={{
                                backgroundColor: "customColors.base",
                                color: "customColors.bgPaper",
                            }}
                            disabled={!isValid || isSubmitting}>
                            Salvar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal de confirmação */}
            <ConfirmationModal
                open={showConfirm}
                title="Confirmar Alterações"
                description="Deseja salvar as alterações nesta ordem?"
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
