import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

export type TipoMovimentacao = 'SANGRIA' | 'SUPRIMENTO';

interface MovimentacaoDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (dados: { descricao: string; valor: number }) => void;
    tipo: TipoMovimentacao;
}

export const MovimentacaoDialog: React.FC<MovimentacaoDialogProps> = ({ open, onClose, onConfirm, tipo }) => {
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        if (!open) {
            setValor('');
            setDescricao('');
        }
    }, [open]);

    const handleConfirm = () => {
        const valorNumerico = parseFloat(valor);
        if (descricao.trim() === '') {
            alert('A descrição é obrigatória.');
            return;
        }
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Por favor, insira um valor positivo válido.');
            return;
        }
        onConfirm({ descricao, valor: valorNumerico });
    };

    const title = tipo === 'SANGRIA' ? 'Registrar Sangria (Retirada)' : 'Registrar Suprimento (Adição)';
    const label = tipo === 'SANGRIA' ? 'Motivo da Retirada' : 'Origem do Suprimento';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="descricao"
                    label={label}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                />
                <TextField
                    margin="dense"
                    name="valor"
                    label="Valor"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    InputProps={{ startAdornment: 'R$' }}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
};