import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText
} from '@mui/material';
import { supabase } from '../supabaseClient';

interface DialogEmissaoNFeProps {
    open: boolean;
    onClose: () => void;
    vendaId: number | null;
    onSuccess: () => void;
}

interface VendaParaEmissao {
    id: number;
    cliente: { nome: string; cpf_cnpj: string };
    itens: { nome: string; quantidade: number; preco_unitario: number }[];
    valor_liquido: number;
}

export const DialogEmissaoNFe: React.FC<DialogEmissaoNFeProps> = ({ open, onClose, vendaId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [isEmitting, setIsEmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [venda, setVenda] = useState<VendaParaEmissao | null>(null);

    useEffect(() => {
        if (open && vendaId) {
            setLoading(true);
            setError(null);
            const fetchVendaDetails = async () => {
                const { data, error } = await supabase
                    .from('vendas')
                    .select('id, valor_liquido, Clientes ( nome, cpf_cnpj ), venda_itens ( quantidade, preco_unitario, Produtos ( nome ) )')
                    .eq('id', vendaId)
                    .single();

                if (error) {
                    setError('Falha ao carregar dados da venda.');
                    console.error(error);
                } else if (data) {
                    const formattedVenda = {
                        id: data.id,
                        valor_liquido: data.valor_liquido,
                        cliente: {
                            nome: data.Clientes?.nome ?? 'Consumidor Final',
                            cpf_cnpj: String(data.Clientes?.cpf_cnpj ?? 'N/A')
                        },

                        itens: data.venda_itens.map((vi: any) => ({
                            nome: vi.Produtos.nome,
                            quantidade: vi.quantidade,
                            preco_unitario: vi.preco_unitario
                        }))
                    };
                    setVenda(formattedVenda);
                } else {
                    setError(`Venda com ID ${vendaId} não foi encontrada.`);
                }
                setLoading(false);
            };
            fetchVendaDetails();
        } else {
            setVenda(null);
        }
    }, [open, vendaId]);

    const handleConfirmarEmissao = async () => {
        if (!vendaId) return;

        setIsEmitting(true);
        setError(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                throw new Error('Falha ao obter a sessão do usuário.');
            }

            if (!session?.access_token) {
                throw new Error('Usuário não autenticado. Faça o login novamente.');
            }

            const response = await fetch(
                `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/emitir-nfe`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ vendaId: vendaId }),
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Ocorreu um erro na emissão da nota.');
            }

            alert('NF-e emitida com sucesso!');
            onSuccess();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsEmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Confirmar Emissão de NF-e</DialogTitle>
            <DialogContent dividers>
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {venda && !loading && (
                    <Box>
                        <Typography variant="h6">Destinatário</Typography>
                        <Typography gutterBottom>{venda.cliente.nome} ({venda.cliente.cpf_cnpj})</Typography>

                        <Typography variant="h6" sx={{ mt: 2 }}>Itens da Venda</Typography>
                        <List dense>
                            {venda.itens.map((item, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemText
                                        primary={item.nome}
                                        secondary={`${item.quantidade} x R$ ${item.preco_unitario.toFixed(2)}`}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Typography variant="h5" align="right" sx={{ mt: 2 }}>
                            Valor Total: {venda.valor_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isEmitting}>Cancelar</Button>
                <Button
                    onClick={handleConfirmarEmissao}
                    variant="contained"
                    color="primary"
                    disabled={isEmitting || loading || !venda}
                >
                    {isEmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar e Emitir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}