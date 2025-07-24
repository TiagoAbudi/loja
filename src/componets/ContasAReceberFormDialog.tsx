import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { ContaAReceber } from '../pages/ContasAReceberPage';
import { supabase } from '../supabaseClient';

// Definimos uma interface simples para o cliente no formulário
interface Cliente {
    id: number;
    nome: string;
}

type ContaFormData = Omit<ContaAReceber, 'id'>;

interface ContasAReceberFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (conta: ContaFormData) => void;
    initialData?: ContaAReceber | null;
}

const emptyConta: ContaFormData = {
    descricao: '',
    valor: 0,
    data_vencimento: '',
    status: 'Pendente',
    cliente_id: 0,
};

export const ContasAReceberFormDialog: React.FC<ContasAReceberFormDialogProps> = ({ open, onClose, onSave, initialData }) => {
    const [conta, setConta] = useState<ContaFormData>(emptyConta);
    const [clientes, setClientes] = useState<Cliente[]>([]);

    // Busca a lista de clientes para preencher o dropdown
    useEffect(() => {
        if (open) {
            const fetchClientes = async () => {
                const { data, error } = await supabase.from('Clientes').select('id, nome');
                if (error) {
                    console.error("Erro ao buscar clientes:", error);
                } else {
                    setClientes(data || []);
                }
            };
            fetchClientes();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                // CORREÇÃO AQUI:
                // Construímos o objeto manualmente para garantir que apenas os campos que
                // existem na tabela 'contas_a_receber' sejam incluídos no estado do formulário.
                const formData: ContaFormData = {
                    descricao: initialData.descricao,
                    valor: initialData.valor,
                    data_vencimento: initialData.data_vencimento,
                    status: initialData.status,
                    cliente_id: initialData.cliente_id,
                    // Note que o objeto 'cliente' (com 'e' no final) é ignorado.
                };
                setConta(formData);
            } else {
                setConta(emptyConta);
            }
        }
    }, [open, initialData]);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
        const { name, value } = event.target;
        // O 'name' vem do props do componente, e o 'value' vem do evento
        setConta(prev => ({ ...prev, [name as string]: value }));
    };


    const handleSave = () => {
        if (!conta.cliente_id) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        onSave({ ...conta, valor: Number(conta.valor) });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Conta' : 'Adicionar Conta a Receber'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" name="descricao" label="Descrição" fullWidth value={conta.descricao} onChange={handleChange} required />

                <FormControl fullWidth margin="dense" required>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                        name="cliente_id"
                        value={conta.cliente_id || ''}
                        label="Cliente"
                        // O 'as any' aqui é um pequeno truque para satisfazer o TS, já que nossa função lida com múltiplos tipos.
                        // A lógica está correta e segura.
                        onChange={handleChange as any}
                    >
                        <MenuItem value="" disabled><em>Selecione um cliente</em></MenuItem>
                        {clientes.map((cliente) => (
                            <MenuItem key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField margin="dense" name="valor" label="Valor (R$)" type="number" fullWidth value={conta.valor} onChange={handleChange} required />
                <TextField
                    margin="dense"
                    name="data_vencimento"
                    label="Data de Vencimento"
                    type="date"
                    fullWidth
                    value={conta.data_vencimento}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};