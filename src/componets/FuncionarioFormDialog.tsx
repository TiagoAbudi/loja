import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

export interface Funcionario {
    id: number;
    created_at: string | null;
    nome: string;
    cargo: string | null;
    data_admissao: string | null;
    status: string;
    credito: number;
}

export const FuncionarioFormDialog = ({ open, onClose, onSave, funcionario }: {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Funcionario>) => void;
    funcionario: Partial<Funcionario> | null;
}) => {
    const [formData, setFormData] = useState<Partial<Funcionario>>({});

    useEffect(() => {
        setFormData(funcionario || { nome: '', cargo: '', status: 'Ativo', credito: 0 });
    }, [funcionario, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{formData.id ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="nome"
                    label="Nome Completo"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.nome || ''}
                    onChange={handleChange}
                    required
                />
                <TextField
                    margin="dense"
                    name="cargo"
                    label="Cargo"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.cargo || ''}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    name="credito"
                    label="Crédito (R$)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.credito || 0}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};
