import * as React from "react";
import { styled } from "@mui/material/styles";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Button,
    Box,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import formatMoney from "@/utils/formatters/formatMoney";
import { Order } from "@/types/order";
import { formatDate } from "@/utils/formatters/formatDate";
import { DataGrid } from "@mui/x-data-grid";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.primary,
    boxShadow: "none",
    border: "1px solid #eee",
    minHeight: 56,
}));

type OrderDetailsDialogProps = {
    open: boolean;
    onClose: () => void;
    order: Order;
};

export function OrderDetailsDialog({
    open,
    onClose,
    order,
}: OrderDetailsDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: "#222" }}>
                Detalhes da ordem - {order.id}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3, px: 3 }}>
                <Box sx={{ width: "100%", mb: 3, mt: 1 }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={{ xs: 2, sm: 3 }}>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Data de Criação
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {formatDate(order.createdAt, true)}
                                </Typography>
                            </Item>
                        </Grid>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Símbolo
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {order.symbol}
                                </Typography>
                            </Item>
                        </Grid>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Lado
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {order.side === "buy" ? "Compra" : "Venda"}
                                </Typography>
                            </Item>
                        </Grid>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Quantidade
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {order.quantity}
                                </Typography>
                            </Item>
                        </Grid>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Preço
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {formatMoney(order.price)}
                                </Typography>
                            </Item>
                        </Grid>
                        <Grid size={6}>
                            <Item>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary">
                                    Status
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}>
                                    {order.status === "open"
                                        ? "Aberta"
                                        : order.status === "partial"
                                          ? "Parcial"
                                          : order.status === "executed"
                                            ? "Executada"
                                            : "Cancelada"}
                                </Typography>
                            </Item>
                        </Grid>
                    </Grid>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ py: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Histórico de Transação
                    </Typography>
                    <Box sx={{ width: "100%", height: 200 }}>
                        {order.transactions && order.transactions.length > 0 ? (
                            <DataGrid
                                disableColumnResize
                                rows={order.transactions.map((tx) => ({
                                    ...tx,
                                    id: tx.id,
                                }))}
                                columns={[
                                    { field: "id", headerName: "#", width: 70 },
                                    {
                                        field: "orderId",
                                        headerName: "Ordem Contraparte",
                                        width: 200,
                                    },
                                    {
                                        field: "quantity",
                                        headerName: "Quantidade",
                                        width: 180,
                                    },
                                    {
                                        field: "price",
                                        headerName: "Preço",
                                        width: 180,
                                        renderCell: ({ value }) =>
                                            formatMoney(value),
                                    },
                                    {
                                        field: "executedAt",
                                        headerName: "Data Execução",
                                        width: 200,
                                        renderCell: ({ value }) =>
                                            formatDate(value, true),
                                    },
                                ]}
                                getRowId={(row) => row.id}
                                disableRowSelectionOnClick
                                hideFooter
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
                                }}
                                autoHeight
                            />
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{ color: "text.secondary", mt: 2 }}>
                                Nenhuma transação realizada ainda.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#fff" }}>
                <Button onClick={onClose} variant="outlined" color="primary">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
