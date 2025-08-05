import React, { useState, useEffect, forwardRef } from 'react';
import { Autocomplete, TextField, Box, Button } from '@mui/material';
import { supabase } from '../supabaseClient';
import { Product } from '../pages/ProductsPage';

interface BuscaProdutoProps {
    onAddProduto: (produto: Product) => void;
}

export const BuscaProduto = forwardRef<HTMLDivElement, BuscaProdutoProps>((props, ref) => {
    const { onAddProduto } = props;

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);

    const handleProdutoAdicionado = (produto: Product) => {
        onAddProduto(produto);
        setProdutoSelecionado(null);
        setInputValue('');
        setOptions([]);
        setOpen(false);
    };

    useEffect(() => {
        if (inputValue === '' || inputValue.length < 2) {
            setOptions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('Produtos')
                .select('*')
                .or(`nome.ilike.%${inputValue}%,sku.ilike.%${inputValue}%`)
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
            handleProdutoAdicionado(produtoSelecionado);
        }
    };

    const handleKeyDown = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (produtoSelecionado) {
                handleProdutoAdicionado(produtoSelecionado);
                return;
            }

            if (inputValue.trim() !== '') {
                setLoading(true);
                const { data, error } = await supabase
                    .from('Produtos')
                    .select('*')
                    .or(`nome.ilike.%${inputValue}%,sku.ilike.%${inputValue}%`)
                    .limit(2);
                setLoading(false);

                if (error) {
                    console.error("Erro na busca por Enter:", error);
                    return;
                }

                if (data && data.length === 1) {
                    handleProdutoAdicionado(data[0]);
                } else {
                    setOptions(data || []);
                    setOpen(true);
                }
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Autocomplete
                ref={ref}
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
                inputValue={inputValue}
                onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'input') {
                        setInputValue(newInputValue);
                    }
                }}
                filterOptions={(x) => x}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        onKeyDown={handleKeyDown}
                        label="Buscar Produto (Leitor ou Manual)"
                    />
                )}
            />
            <Button variant="contained" onClick={handleAddClick} disabled={!produtoSelecionado}>
                Adicionar
            </Button>
        </Box>
    );
});