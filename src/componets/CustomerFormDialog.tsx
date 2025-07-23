import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, TextField,
    DialogActions, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Customer } from '../pages/CustomersPage';
import { IMaskInput } from 'react-imask';

interface TextMaskCustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const TextMaskAdapter = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
    function TextMaskCustom(props, ref) {
        const { onChange, ...other } = props;
        return (
            <IMaskInput
                {...other}
                mask="(00) 00000-0000"
                inputRef={ref}
                onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
                overwrite
            />
        );
    },
);

const CpfCnpjMaskAdapter = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
    function CpfCnpjMaskCustom(props, ref) {
        const { onChange, ...other } = props;
        return (
            <IMaskInput
                {...other}
                mask={[
                    {
                        mask: '000.000.000-00',
                        maxLength: 11
                    },
                    {
                        mask: '00.000.000/0000-00'
                    }
                ]}
                inputRef={ref}
                onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
                overwrite
            />
        );
    },
);

type CustomerFormData = Omit<Customer, 'id' | 'created_at'>;

interface CustomerFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (customer: CustomerFormData) => void;
    initialData?: Customer | null;
}

const emptyCustomer: CustomerFormData = {
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    status: 'Ativo',
};

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
    open,
    onClose,
    onSave,
    initialData,
}) => {
    const [customer, setCustomer] = useState<CustomerFormData>(emptyCustomer);

    useEffect(() => {
        if (open) {
            if (initialData) {
                const formattedPhone = initialData.telefone ? formatarTelefoneDeNumero(Number(initialData.telefone)) : '';
                setCustomer({ ...initialData, telefone: formattedPhone });
            } else {
                setCustomer(emptyCustomer);
            }
        }
    }, [open, initialData]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setCustomer(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSave = () => {
        const customerToSave = {
            ...customer,
            telefone: customer.telefone.replace(/\D/g, ''),
            cpf_cnpj: customer.cpf_cnpj.replace(/\D/g, ''),

        };
        onSave(customerToSave);
    };

    const formatarTelefoneDeNumero = (telefone: number): string => {
        const s = String(telefone);
        if (s.length === 11) return `(${s.substring(0, 2)}) ${s.substring(2, 7)}-${s.substring(7)}`;
        if (s.length === 10) return `(${s.substring(0, 2)}) ${s.substring(2, 6)}-${s.substring(6)}`;
        return s;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="nome"
                    label="Nome Completo"
                    fullWidth
                    value={customer.nome}
                    onChange={handleChange}
                    required
                />
                <TextField margin="dense" name="email" label="E-mail" fullWidth value={customer.email} onChange={handleChange} />

                <TextField
                    margin="dense"
                    name="telefone"
                    label="Telefone"
                    fullWidth
                    value={customer.telefone}
                    onChange={handleChange}
                    InputProps={{
                        inputComponent: TextMaskAdapter as any,
                    }}
                />

                <TextField
                    margin="dense"
                    name="cpf_cnpj"
                    label="CPF ou CNPJ"
                    fullWidth
                    value={customer.cpf_cnpj}
                    onChange={handleChange}
                    InputProps={{
                        inputComponent: CpfCnpjMaskAdapter as any,
                    }}
                />
                <TextField margin="dense" name="endereco" label="Endereço" fullWidth value={customer.endereco} onChange={handleChange} />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={customer.status} label="Status" onChange={handleChange as any}>
                        <MenuItem value="Ativo">Ativo</MenuItem>
                        <MenuItem value="Inativo">Inativo</MenuItem>
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