import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Button } from '@mui/material';
import { supabase } from '../supabaseClient';
import { Product } from '../pages/ProductsPage';

interface BuscaProdutoProps {
    onAddProduto: (produto: Product) => void;
}

export const BuscaProduto: React.FC<BuscaProdutoProps> = ({ onAddProduto }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);

    useEffect(() => {
        if (inputValue === '' || inputValue.length < 2) {
            setOptions([]);
            return;
        }

        setLoading(true);

        const timer = setTimeout(async () => {
            const { data, error } = await supabase
                .from('Produtos')
                .select('*')
                .ilike('nome', `%${inputValue}%`)
                .limit(10);

            if (error) {
                console.error('Erro ao buscar produtos:', error);
            } else {
                setOptions(data || []);
            }
            setLoading(false);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    const handleAddClick = () => {
        if (produtoSelecionado) {
            onAddProduto(produtoSelecionado);
            setProdutoSelecionado(null);
            setInputValue('');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Autocomplete
                sx={{ flexGrow: 1 }}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => `${option.nome} - (R$ ${Number(option.preco).toFixed(2)})`}
                options={options}
                loading={loading}
                value={produtoSelecionado}
                onChange={(event, newValue) => {
                    setProdutoSelecionado(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Buscar Produto por Nome ou SKU"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
            <Button variant="contained" onClick={handleAddClick} disabled={!produtoSelecionado}>
                Adicionar
            </Button>
        </Box>
    );
};