import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { ContaComCliente, ContaInsert } from '../pages/ContasAReceberPage';
import { supabase } from '../supabaseClient';

interface ClienteSimples {
    id: number;
    nome: string | null;
}

interface ContasAReceberFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (conta: ContaInsert) => void;
    initialData: ContaComCliente | null;
}

const emptyConta: ContaInsert = {
    descricao: '',
    valor: 0,
    data_vencimento: new Date().toISOString().slice(0, 10),
    status: 'Pendente',
    cliente_id: 0,
    data_recebimento: null,
};

export const ContasAReceberFormDialog: React.FC<ContasAReceberFormDialogProps> = ({ open, onClose, onSave, initialData }) => {
    const [conta, setConta] = useState<ContaInsert>(emptyConta);
    const [clientes, setClientes] = useState<ClienteSimples[]>([]);

    useEffect(() => {
        if (open) {
            const fetchClientes = async () => {
                const { data, error } = await supabase.from('Clientes').select('id, nome').order('nome');
                if (error) console.error("Erro ao buscar clientes:", error);
                else setClientes(data || []);
            };
            fetchClientes();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                const formData: ContaInsert = {
                    descricao: initialData.descricao,
                    valor: initialData.valor,
                    data_vencimento: initialData.data_vencimento,
                    data_recebimento: initialData.data_recebimento,
                    status: initialData.status,
                    cliente_id: initialData.cliente_id,
                };
                setConta(formData);
            } else {
                setConta(emptyConta);
            }
        }
    }, [open, initialData]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>) => {
        const { name, value } = event.target;
        setConta(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSave = () => {
        if (!conta.cliente_id) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        onSave({ ...conta, valor: Number(conta.valor) || 0 });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Conta' : 'Adicionar Conta a Receber'}</DialogTitle>
            <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField autoFocus margin="dense" name="descricao" label="Descrição" fullWidth value={conta.descricao || ''} onChange={handleChange} required />
                <FormControl fullWidth margin="dense" required>
                    <InputLabel>Cliente</InputLabel>
                    <Select name="cliente_id" value={conta.cliente_id || ''} label="Cliente" onChange={handleChange}>
                        <MenuItem value="" disabled><em>Selecione um cliente</em></MenuItem>
                        {clientes.map((cliente) => (
                            <MenuItem key={cliente.id} value={cliente.id}>
                                {cliente.nome ?? 'Cliente sem nome'}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField margin="dense" name="valor" label="Valor (R$)" type="number" fullWidth value={conta.valor || ''} onChange={handleChange} required />
                <TextField
                    margin="dense"
                    name="data_vencimento"
                    label="Data de Vencimento"
                    type="date"
                    fullWidth
                    value={conta.data_vencimento || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={conta.status} label="Status" onChange={handleChange}>
                        <MenuItem value={'Pendente'}>Pendente</MenuItem>
                        <MenuItem value={'Recebido'}>Recebido</MenuItem>
                        <MenuItem value={'Vencido'}>Vencido</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};