import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    MenuItem, FormControl, InputLabel, Select, Button, SelectChangeEvent
} from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const CurrencyFormatAdapter = React.forwardRef<NumericFormatProps, CustomProps>(
    function CurrencyFormatAdapter(props, ref) {
        const { onChange, ...other } = props;
        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: { name: props.name, value: values.value },
                    });
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
            />
        );
    },
);

interface Product {
    id?: number;
    sku: string;
    nome: string;
    preco: number | string;
    estoque: number | string;
    status: 'Ativo' | 'Inativo';
}

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'>) => void;
    initialData?: Product | null;
}

const initialProductState: Product = { sku: '', nome: '', preco: '', estoque: '', status: 'Ativo' };

export const ProductFormDialog = React.memo(({ open, onClose, onSave, initialData }: ProductFormDialogProps) => {
    const [product, setProduct] = useState<Product>(initialProductState);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setProduct(initialData);
            } else {
                setProduct(initialProductState);
            }
        }
    }, [open, initialData]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = event.target;
        setProduct({ ...product, [name as string]: value });
    };

    const handleSaveClick = () => {
        onSave(product);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" name="sku" label="SKU" type="text" fullWidth variant="outlined" value={product.sku} onChange={handleInputChange} />
                <TextField margin="dense" name="nome" label="Nome do Produto" type="text" fullWidth variant="outlined" value={product.nome} onChange={handleInputChange} />
                <TextField
                    label="Preço"
                    value={product.preco}
                    onChange={handleInputChange}
                    name="preco"
                    InputProps={{ inputComponent: CurrencyFormatAdapter as any }}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                />
                <TextField margin="dense" name="estoque" label="Estoque" type="number" fullWidth variant="outlined" value={product.estoque} onChange={handleInputChange} />
                
                {!initialData && (
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={product.status} label="Status" onChange={handleInputChange}>
                            <MenuItem value={'Ativo'}>Ativo</MenuItem>
                            <MenuItem value={'Inativo'}>Inativo</MenuItem>
                        </Select>
                    </FormControl>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSaveClick} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
});