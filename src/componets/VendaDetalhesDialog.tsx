import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { Venda } from '../pages/RelatorioVendasPage';

interface VendaDetalhesDialogProps {
    venda: Venda | null;
    open: boolean;
    onClose: () => void;
}

export const VendaDetalhesDialog: React.FC<VendaDetalhesDialogProps> = ({ venda, open, onClose }) => {
    if (!venda) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes da Venda #{venda.id}</DialogTitle>
            <DialogContent>
                <Typography variant="h6">Cliente: {venda.cliente?.nome || 'Consumidor Final'}</Typography>
                <Typography variant="body2" color="text.secondary">
                    Data: {venda.data_venda ? new Date(venda.data_venda).toLocaleString('pt-BR') : 'Data não informada'}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold">Itens Vendidos:</Typography>
                <List dense>
                    {venda.venda_itens.map(item => (
                        <ListItem key={item.id} disableGutters>
                            <ListItemText
                                primary={`${item.quantidade}x ${item.produto?.nome || 'Produto não encontrado'}`}
                                secondary={`Unit: ${(item.preco_unitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                            />
                            <Typography variant="body2" fontWeight="bold">
                                {(item.preco_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold">Pagamentos:</Typography>
                <List dense>
                    {venda.venda_pagamentos.map(pag => (
                        <ListItem key={pag.id} disableGutters>
                            <ListItemText primary={pag.metodo} />
                            <Typography variant="body2" fontWeight="bold">
                                {(pag.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Typography>Subtotal: {(venda.valor_bruto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    <Typography color="error">Desconto: -{(Number(venda.desconto) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Total: {(venda.valor_liquido || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};