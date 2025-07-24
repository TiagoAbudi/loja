// src/components/ContasAPagarFormDialog.tsx

import React, { useState, useEffect } from 'react';
// 1. Importe os componentes necessários do Material-UI
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { ContaAPagar } from '../pages/ContasAPagarPage';
import { supabase } from '../supabaseClient';

// 2. Defina uma interface para o fornecedor
interface Fornecedor {
    id: number;
    nome_fantasia: string;
}

type ContaFormData = Omit<ContaAPagar, 'id'>;

interface ContasAPagarFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (conta: ContaFormData) => void;
    initialData?: ContaAPagar | null;
}

const emptyConta: ContaFormData = {
    descricao: '',
    valor: 0,
    data_vencimento: '',
    status: 'Pendente',
    fornecedor_id: undefined, // Começa como indefinido
};

export const ContasAPagarFormDialog: React.FC<ContasAPagarFormDialogProps> = ({ open, onClose, onSave, initialData }) => {
    const [conta, setConta] = useState<ContaFormData>(emptyConta);
    // 3. Crie um estado para armazenar a lista de fornecedores
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

    // 4. Efeito para buscar os fornecedores quando o diálogo abrir
    useEffect(() => {
        if (open) {
            const fetchFornecedores = async () => {
                const { data, error } = await supabase.from('fornecedores').select('id, nome_fantasia');
                if (error) {
                    console.error("Erro ao buscar fornecedores:", error);
                } else {
                    setFornecedores(data || []);
                }
            };
            fetchFornecedores();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                // CORREÇÃO AQUI:
                // Simplesmente usamos a string de data que vem do banco de dados,
                // sem convertê-la para um objeto Date e de volta para string.
                const formData: ContaFormData = {
                    descricao: initialData.descricao,
                    valor: initialData.valor,
                    data_vencimento: initialData.data_vencimento, // <-- MUDANÇA AQUI
                    status: initialData.status,
                    fornecedor_id: initialData.fornecedor_id,
                };
                setConta(formData);
            } else {
                setConta(emptyConta);
            }
        }
    }, [open, initialData]);



    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>) => {
        const { name, value } = event.target;
        setConta(prev => ({ ...prev, [name as string]: value === '' ? undefined : value }));
    };

    const handleSave = () => {
        onSave({ ...conta, valor: Number(conta.valor) });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Conta' : 'Adicionar Conta a Pagar'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" name="descricao" label="Descrição" fullWidth value={conta.descricao} onChange={handleChange} required />

                {/* 5. Adicione o campo de seleção para o fornecedor */}
                <FormControl fullWidth margin="dense">
                    <InputLabel>Fornecedor (Opcional)</InputLabel>
                    <Select
                        name="fornecedor_id"
                        value={conta.fornecedor_id || ''}
                        label="Fornecedor (Opcional)"
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Nenhum / Despesa Geral</em></MenuItem>
                        {fornecedores.map((fornecedor) => (
                            <MenuItem key={fornecedor.id} value={fornecedor.id}>
                                {fornecedor.nome_fantasia}
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