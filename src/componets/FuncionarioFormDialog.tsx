import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Divider, Typography } from '@mui/material';

export interface Funcionario {
    id: number;
    created_at: string | null;
    nome: string;
    cargo: string | null;
    data_admissao: string | null;
    status: string;
    credito: number;
}

interface FuncionarioFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Funcionario> & { email?: string; senha?: string }) => void;
    funcionario: Partial<Funcionario> | null;
}

export const FuncionarioFormDialog: React.FC<FuncionarioFormDialogProps> = ({ open, onClose, onSave, funcionario }) => {
    const [formData, setFormData] = useState<Partial<Funcionario> & { email?: string; senha?: string }>({});

    useEffect(() => {
        const initialState = { nome: '', cargo: '', status: 'Ativo', credito: 0, email: '', senha: '' };
        setFormData(funcionario || initialState);
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

                {!formData.id && (
                    <>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="overline">Credenciais de Acesso</Typography>
                        </Divider>
                        <TextField
                            margin="dense"
                            name="email"
                            label="E-mail de Acesso"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="senha"
                            label="Senha de Acesso"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={formData.senha || ''}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};