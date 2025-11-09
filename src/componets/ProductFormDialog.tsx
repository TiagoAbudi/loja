import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    MenuItem, FormControl, InputLabel, Select, Button, Box,
    SelectChangeEvent
} from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Product } from '../pages/ProductsPage';
import { supabase } from '../supabaseClient';

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
                    onChange({ target: { name: props.name, value: values.value } });
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

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'created_at'>) => void;
    initialData: Product | null;
}

const initialProductState: Omit<Product, 'id' | 'created_at'> = {
    sku: '',
    nome: '',
    preco: null,
    valor_de_custo: null,
    estoque: null,
    status: 'Ativo',
    fornecedor_id: null
};

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ open, onClose, onSave, initialData }) => {
    const [product, setProduct] = useState(initialProductState);
    const [fornecedores, setFornecedores] = useState<{ id: number; nome_fantasia: string; }[]>([]);
    const [, setLoadingFornecedores] = useState(false);

    useEffect(() => {
        if (open) {
            setLoadingFornecedores(true);
            const fetchFornecedores = async () => {
                const { data, error } = await supabase
                    .from('fornecedores')
                    .select('id, nome_fantasia');

                if (error) {
                    console.error("Erro ao buscar fornecedores:", error);
                } else if (data) {
                    setFornecedores(data);
                }
                setLoadingFornecedores(false);
            };

            fetchFornecedores();
        }
    }, [open]);

    useEffect(() => {
        if (initialData) {
            setProduct(initialData);
        } else {
            setProduct(initialProductState);
        }
    }, [initialData, open]);

    useEffect(() => {
        if (open) {
            setLoadingFornecedores(true);
            supabase.from('fornecedores').select('id, nome_fantasia').eq('status', 'Ativo')
                .then(({ data }) => {
                    setFornecedores(data || []);
                    setLoadingFornecedores(false);
                });
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            setProduct(initialData || initialProductState);
        }
    }, [open, initialData]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>) => {
        const { name, value } = event.target;
        setProduct({ ...product, [name as string]: value });
    };

    const handleChangeSelect = (event: SelectChangeEvent<number | string>) => {
        const { name, value } = event.target;
        setProduct(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveClick = () => {
        const productDataToSave = {
            ...product,
            preco: Number(product.preco) || 0,
            valor_de_custo: Number(product.valor_de_custo) || null,
            estoque: Number(product.estoque) || 0,
            fornecedor_id: product.fornecedor_id ? Number(product.fornecedor_id) : null,
        };
        onSave(productDataToSave);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
                <TextField name="nome" label="Nome do Produto" fullWidth value={product.nome} onChange={handleInputChange} required />
                <TextField name="sku" label="SKU (Código)" fullWidth value={product.sku} onChange={handleInputChange} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Preço de Venda" value={product.preco} onChange={handleInputChange} name="preco" InputProps={{ inputComponent: CurrencyFormatAdapter as any }} variant="outlined" fullWidth required />
                    <TextField label="Valor de Custo" value={product.valor_de_custo} onChange={handleInputChange} name="valor_de_custo" InputProps={{ inputComponent: CurrencyFormatAdapter as any }} variant="outlined" fullWidth />
                </Box>

                <FormControl fullWidth>
                    <InputLabel id="fornecedor-select-label">Fornecedor</InputLabel>
                    <Select
                        name="fornecedor_id"
                        labelId="fornecedor-select-label"
                        value={product.fornecedor_id || ''}
                        label="Fornecedor"
                        onChange={handleChangeSelect}
                    >
                        <MenuItem value=""><em>Nenhum</em></MenuItem>
                        {fornecedores.map((fornecedor) => (
                            <MenuItem key={fornecedor.id} value={fornecedor.id}>
                                {fornecedor.nome_fantasia}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField name="estoque" label="Estoque" type="number" fullWidth value={product.estoque || ''} onChange={handleInputChange} required />

                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={product.status} label="Status" onChange={handleInputChange}>
                        <MenuItem value={'Ativo'}>Ativo</MenuItem>
                        <MenuItem value={'Inativo'}>Inativo</MenuItem>
                    </Select>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSaveClick} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};