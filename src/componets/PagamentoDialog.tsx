import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
    Select, MenuItem, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, SelectChangeEvent
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

export type MetodoPagamento = 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'A Prazo' | 'Crédito Funcionário';

export interface Pagamento {
    metodo: MetodoPagamento;
    valor: number;
}

interface PagamentoDialogProps {
    open: boolean;
    onClose: () => void;
    valorTotal: number;
    onFinalizarVenda: (pagamentos: Pagamento[]) => void;
    isFuncionario: boolean;
    creditoDisponivel: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const PagamentoDialog: React.FC<PagamentoDialogProps> = ({
    open,
    onClose,
    valorTotal,
    onFinalizarVenda,
    isFuncionario,
    creditoDisponivel
}) => {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [metodoAtual, setMetodoAtual] = useState<MetodoPagamento>('Dinheiro');
    const [valorAtual, setValorAtual] = useState('');

    const totais = useMemo(() => {
        const valorPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0);
        const restante = valorTotal - valorPago;
        const troco = valorPago > valorTotal ? valorPago - valorTotal : 0;
        return { valorPago, restante, troco };
    }, [pagamentos, valorTotal]);

    useEffect(() => {
        if (open) {
            setPagamentos([]);
            setValorAtual(valorTotal > 0 ? valorTotal.toFixed(2) : '');
            setMetodoAtual('Dinheiro');
        }
    }, [open, valorTotal]);

    const metodosDisponiveis = useMemo(() => {
        const base: MetodoPagamento[] = ['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Pix', 'A Prazo'];
        if (isFuncionario && creditoDisponivel > 0) {
            return ['Crédito Funcionário', ...base];
        }
        return base;
    }, [isFuncionario, creditoDisponivel]);

    useEffect(() => {
        if (metodoAtual === 'Crédito Funcionário') {
            const valorAplicavel = Math.min(totais.restante, creditoDisponivel);
            setValorAtual(valorAplicavel > 0 ? valorAplicavel.toFixed(2) : '');
        } else {
            setValorAtual(totais.restante > 0 ? totais.restante.toFixed(2) : '');
        }
    }, [metodoAtual, totais.restante, creditoDisponivel]);


    const handleAddPagamento = () => {
        const valorNum = parseFloat(valorAtual);
        if (isNaN(valorNum) || valorNum <= 0) {
            alert("Valor inválido!");
            return;
        }

        if (metodoAtual === 'Crédito Funcionário' && valorNum > creditoDisponivel) {
            alert(`O valor não pode exceder o crédito disponível de ${formatCurrency(creditoDisponivel)}.`);
            return;
        }

        const novoPagamento: Pagamento = { metodo: metodoAtual, valor: valorNum };
        setPagamentos([...pagamentos, novoPagamento]);
    };

    const handleRemovePagamento = (index: number) => {
        const novosPagamentos = pagamentos.filter((_, i) => i !== index);
        setPagamentos(novosPagamentos);
    };

    const handleMetodoChange = (e: SelectChangeEvent<MetodoPagamento>) => {
        setMetodoAtual(e.target.value as MetodoPagamento);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography variant="h6">Total a Pagar</Typography>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                        {formatCurrency(valorTotal)}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Select value={metodoAtual} onChange={handleMetodoChange} sx={{ flex: 1 }}>
                        {/* --- 6. MAPEIA A LISTA DINÂMICA DE MÉTODOS --- */}
                        {metodosDisponiveis.map(metodo => (
                            <MenuItem key={metodo} value={metodo}>
                                {metodo}
                                {metodo === 'Crédito Funcionário' && ` (Disp: ${formatCurrency(creditoDisponivel)})`}
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField
                        label="Valor"
                        type="number"
                        value={valorAtual}
                        onChange={(e) => setValorAtual(e.target.value)}
                        sx={{ flex: 1 }}
                        InputProps={{ startAdornment: 'R$' }}
                    />
                    <IconButton color="primary" onClick={handleAddPagamento}>
                        <AddCircleIcon />
                    </IconButton>
                </Box>

                <Typography variant="subtitle1">Pagamentos Adicionados:</Typography>
                <List dense>
                    {pagamentos.map((pag, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}>
                            <ListItemText primary={pag.metodo} secondary={formatCurrency(pag.valor)} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleRemovePagamento(index)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'right' }}>
                    <Typography>Total Pago: {formatCurrency(totais.valorPago)}</Typography>
                    {totais.restante > 0 && <Typography color="error">Falta: {formatCurrency(totais.restante)}</Typography>}
                    {totais.troco > 0 && <Typography color="success.main" variant="h6">Troco: {formatCurrency(totais.troco)}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar Venda</Button>
                <Button
                    onClick={() => onFinalizarVenda(pagamentos)}
                    variant="contained"
                    disabled={totais.restante > 0}
                    size="large"
                >
                    Confirmar Venda
                </Button>
            </DialogActions>
        </Dialog>
    );
};