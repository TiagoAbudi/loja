import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { IMaskInput } from 'react-imask';
import { Fornecedor } from '../pages/FornecedoresPage';

interface TextMaskCustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const TelefoneMaskAdapter = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
    (props, ref) => {
        const { onChange, ...other } = props;
        return <IMaskInput {...other} mask="(00) 00000-0000" inputRef={ref} onAccept={(value: any) => onChange({ target: { name: props.name, value } })} overwrite />;
    }
);

const CnpjMaskAdapter = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
    (props, ref) => {
        const { onChange, ...other } = props;
        return <IMaskInput {...other} mask="00.000.000/0000-00" inputRef={ref} onAccept={(value: any) => onChange({ target: { name: props.name, value } })} overwrite />;
    }
);

interface FornecedorFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (fornecedor: Omit<Fornecedor, 'id' | 'created_at'>) => void;
    initialData: Fornecedor | null;
}

const emptyFornecedor: Omit<Fornecedor, 'id' | 'created_at'> = {
    nome_fantasia: '',
    razao_social: null,
    cnpj: null,
    telefone: null,
    email: null
};

export const FornecedorFormDialog: React.FC<FornecedorFormDialogProps> = ({ open, onClose, onSave, initialData }) => {
    const [fornecedor, setFornecedor] = useState(emptyFornecedor);

    useEffect(() => {
        if (open) {
            if (initialData) {
                const { id, created_at, ...dadosDoFormulario } = initialData;
                setFornecedor(dadosDoFormulario);
            } else {
                setFornecedor(emptyFornecedor);
            }
        }
    }, [open, initialData]);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFornecedor(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const fornecedorParaSalvar = {
            ...fornecedor,
            cnpj: fornecedor.cnpj?.replace(/\D/g, '') || null,
            telefone: fornecedor.telefone?.replace(/\D/g, '') || null,
        };
        onSave(fornecedorParaSalvar);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" name="nome_fantasia" label="Nome Fantasia" fullWidth value={fornecedor.nome_fantasia} onChange={handleChange} required />
                <TextField margin="dense" name="razao_social" label="Razão Social" fullWidth value={fornecedor.razao_social || ''} onChange={handleChange} />
                <TextField
                    margin="dense"
                    name="cnpj"
                    label="CNPJ"
                    fullWidth
                    value={fornecedor.cnpj || ''}
                    onChange={handleChange}
                    InputProps={{ inputComponent: CnpjMaskAdapter as any }}
                />
                <TextField
                    margin="dense"
                    name="telefone"
                    label="Telefone"
                    fullWidth
                    value={fornecedor.telefone || ''}
                    onChange={handleChange}
                    InputProps={{ inputComponent: TelefoneMaskAdapter as any }}
                />
                <TextField margin="dense" name="email" label="E-mail" type="email" fullWidth value={fornecedor.email || ''} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};