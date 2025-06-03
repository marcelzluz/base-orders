import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Divider,
} from "@mui/material";

interface ConfirmationModalProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onCancel,
    onConfirm,
    loading = false,
}) => (
    <Dialog
        open={open}
        onClose={loading ? undefined : onCancel}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
            {title}
            {description && (
                <>
                    <Divider sx={{ my: 1 }} />
                </>
            )}
        </DialogTitle>
        {description && (
            <DialogContent>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {description}
                </Typography>
            </DialogContent>
        )}
        <DialogActions>
            <Button
                variant="outlined"
                color="error"
                onClick={onCancel}
                disabled={loading}>
                {cancelLabel}
            </Button>
            <Button
                variant="contained"
                color="primary"
                sx={{
                    backgroundColor: "customColors.bgPaper",
                }}
                onClick={onConfirm}
                disabled={loading}
                startIcon={
                    loading ? <CircularProgress size={18} /> : undefined
                }>
                {confirmLabel}
            </Button>
        </DialogActions>
    </Dialog>
);
