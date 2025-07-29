import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography, Box } from '@mui/material';

interface FecharCaixaDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (valorInformado: number) => void;
    valorCalculado: number;
}

export const FecharCaixaDialog: React.FC<FecharCaixaDialogProps> = ({ open, onClose, onConfirm, valorCalculado }) => {
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
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogContent>
                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">Conferência de Valores</Typography>
                    <Typography variant="body1">
                        Valor esperado no sistema: <strong>{valorCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </Typography>
                </Box>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Valor Contado na Gaveta"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    InputProps={{ startAdornment: 'R$' }}
                    helperText="Insira o valor total em dinheiro que você contou fisicamente no caixa."
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" color="error">Confirmar Fechamento</Button>
            </DialogActions>
        </Dialog>
    );
};