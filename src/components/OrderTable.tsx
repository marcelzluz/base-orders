"use client";
import { FC, useState } from "react";
import { useEffect, useRef } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useOrderStore } from "@/store/orderStore";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import { Divider, IconButton } from "@mui/material";
import formatMoney from "@/utils/formatters/formatMoney";
import { ConfirmationModal } from "./ConfirmationModal";
import { Order } from "@/types/order";
import { OrderDetailsDialog } from "./OrderDetailsModal";
import { formatDate } from "@/utils/formatters/formatDate";
import { OrderEditForm } from "./OrderEditForm";
import { useToast } from "./Toast";

const statusColor = {
    open: "warning",
    partial: "info",
    executed: "success",
    cancelled: "error",
} as const;

export const OrderTable: FC = () => {
    const orders = useOrderStore((s) => s.orders);
    const loading = useOrderStore((s) => s.loading);
    const cancelOrder = useOrderStore((s) => s.cancelOrder);
    const toast = useToast();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [orderIdToCancel, setOrderIdToCancel] = useState<number | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

    const handleEdit = (orderId: number) => {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            setOrderToEdit(order);
            setEditOpen(true);
        }
    };
    const handleDetails = (orderId: number) => {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setDetailsOpen(true);
        }
    };
    const handleCancel = (orderId: number) => {
        setOrderIdToCancel(orderId);
        setConfirmOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderIdToCancel) return;
        setConfirmLoading(true);
        try {
            await cancelOrder(orderIdToCancel);
            toast.dispatch({
                status: "success",
                title: `Ordem #${orderIdToCancel} cancelada com sucesso`,
            });
        } catch (e: any) {
            toast.dispatch({
                status: "error",
                title: e.message || "Erro ao cancelar ordem",
            });
        } finally {
            setConfirmLoading(false);
            setConfirmOpen(false);
            setOrderIdToCancel(null);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", align: "center", width: 100 },
        { field: "symbol", headerName: "SÍMBOLO", align: "center", width: 120 },
        {
            field: "side",
            headerName: "LADO",
            width: 120,
            renderCell: (params) =>
                params.value === "buy" ? (
                    <span style={{ fontWeight: 700, color: "#16a34a" }}>
                        Compra
                    </span>
                ) : (
                    <span style={{ fontWeight: 700, color: "#dc2626" }}>
                        Venda
                    </span>
                ),
        },
        {
            field: "quantity",
            headerName: "QUANTIDADE",
            width: 120,
        },
        {
            field: "pendingQuantity",
            headerName: "QTE PENDENTE",
            width: 140,
        },
        {
            field: "price",
            headerName: "PREÇO",
            width: 140,
            renderCell: ({ value }) => (value ? formatMoney(value) : "-"),
        },
        {
            field: "status",
            headerName: "STATUS",
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={
                        params.value === "open"
                            ? "Aberta"
                            : params.value === "partial"
                              ? "Parcial"
                              : params.value === "executed"
                                ? "Executada"
                                : "Cancelada"
                    }
                    color={
                        statusColor[params.value as keyof typeof statusColor]
                    }
                    sx={{ fontWeight: 600, letterSpacing: "1px" }}
                />
            ),
        },
        {
            field: "createdAt",
            headerName: "DT CRIAÇÃO",
            width: 140,
            renderCell: ({ value }) => (value ? formatDate(value, true) : "-"),
        },
        {
            field: "actions",
            headerName: "AÇÕES",
            align: "right",
            type: "actions",
            width: 180,
            renderCell: (params) => {
                const actions = [
                    <IconButton
                        key="details"
                        size="small"
                        color="primary"
                        onClick={() => handleDetails(params.row.id)}
                        aria-label="Visualizar">
                        <InfoIcon />
                    </IconButton>,
                ];

                if (
                    params.row.status === "open" ||
                    params.row.status === "partial"
                ) {
                    actions.push(
                        <IconButton
                            key="edit"
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(params.row.id)}
                            aria-label="Editar">
                            <EditIcon />
                        </IconButton>,
                    );
                    actions.push(
                        <IconButton
                            key="cancel"
                            size="small"
                            color="error"
                            onClick={() => handleCancel(params.row.id)}
                            aria-label="Cancelar">
                            <CancelIcon />
                        </IconButton>,
                    );
                }

                return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {actions.map((action, idx) => (
                            <Box
                                key={idx}
                                sx={{ display: "flex", alignItems: "center" }}>
                                {action}
                                {idx < actions.length - 1 && (
                                    <Divider
                                        orientation="vertical"
                                        flexItem
                                        sx={{
                                            mx: 1,
                                            bgcolor: "#eee",
                                            width: 2,
                                        }}
                                    />
                                )}
                            </Box>
                        ))}
                    </Box>
                );
            },
        },
    ];

    const ordersRef = useRef(orders);

    useEffect(() => {
        if (ordersRef.current !== orders) {
            ordersRef.current = orders;
        }
    }, [orders]);

    return (
        <Box
            sx={{
                minHeight: 500,
                width: "100%",
                background: "#fff",
                borderRadius: 3,
                boxShadow: 3,
                p: 2,
                border: "1px solid #eee",
                mt: 2,
            }}>
            <DataGrid
                rows={orders}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                disableColumnResize
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                    bgcolor: "#fff",
                    color: "#222",
                    border: "none",
                    fontFamily: '"Segoe UI", Arial, sans-serif',
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#fff !important",
                        color: "#222 !important",
                        fontWeight: 700,
                        borderBottom: "2px solid #ba94f2",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                        color: "#222 !important",
                        fontWeight: 700,
                        fontSize: 14,
                        width: "100%",
                        textAlign: "center",
                    },
                    "& .MuiDataGrid-cell": {
                        color: "#222",
                    },
                    "& .MuiDataGrid-row:hover": {
                        bgcolor: "#fafafa",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        bgcolor: "#fff",
                        color: "#222",
                        borderTop: "2px solid #ba94f2",
                    },
                }}
            />

            {selectedOrder && (
                <OrderDetailsDialog
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    order={selectedOrder}
                />
            )}

            {orderToEdit && (
                <OrderEditForm
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    order={orderToEdit}
                />
            )}

            {/* Modal de Confirmação */}
            <ConfirmationModal
                open={confirmOpen}
                title="Excluir Ordem"
                description="Deseja excluir esta ordem?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmCancel}
                loading={confirmLoading}
            />
        </Box>
    );
};
