import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

interface AbrirCaixaDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (valorInicial: number) => void;
}

export const AbrirCaixaDialog: React.FC<AbrirCaixaDialogProps> = ({ open, onClose, onConfirm }) => {
    const [valor, setValor] = useState('');

    const handleConfirm = () => {
        const valorNumerico = parseFloat(valor);
        if (!isNaN(valorNumerico) && valorNumerico >= 0) {
            onConfirm(valorNumerico);
            setValor('');
        } else {
            alert('Por favor, insira um valor válido.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Valor Inicial (Troco)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    InputProps={{ startAdornment: 'R$' }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained">Confirmar Abertura</Button>
            </DialogActions>
        </Dialog>
    );
};