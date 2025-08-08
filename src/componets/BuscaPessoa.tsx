import React, { useState, useEffect, forwardRef } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { supabase } from '../supabaseClient';

export interface Pessoa {
    id: number;
    nome: string;
    tipo: 'Cliente' | 'Funcionario';
    credito_disponivel: number;
}

interface BuscaPessoaProps {
    onPessoaChange: (pessoa: Pessoa | null) => void;
}

export const BuscaPessoa = forwardRef<HTMLDivElement, BuscaPessoaProps>((props, ref) => {
    const [options, setOptions] = useState<readonly Pessoa[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('pessoas_venda')
                .select('*')
                .ilike('nome', `%${inputValue}%`)
                .limit(10);

            if (data) {
                const validData = data.filter(
                    (p): p is Pessoa => p.id !== null && p.nome !== null && p.tipo !== null
                );
                setOptions(validData);
            } else {
                setOptions([]);
            }

            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const handleChange = (_: any, newValue: string | Pessoa | null) => {
        if (typeof newValue === 'object' && newValue !== null) {
            setSelectedPessoa(newValue);
            props.onPessoaChange(newValue);
        } else if (typeof newValue === 'string') {
            const novaPessoa: Pessoa = { id: 0, nome: newValue, tipo: 'Cliente', credito_disponivel: 0 };
            setSelectedPessoa(novaPessoa);
            props.onPessoaChange(novaPessoa);
        } else {
            setSelectedPessoa(null);
            props.onPessoaChange(null);
        }
    };

    return (
        <Autocomplete
            ref={ref}
            freeSolo
            options={options}
            loading={loading}
            value={selectedPessoa}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            onChange={handleChange}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome || '')}
            isOptionEqualToValue={(option, value) => option.id === value.id && option.tipo === value.tipo}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    {option.nome}
                    {option.tipo === 'Funcionario' && (
                        <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                            (Funcionário)
                        </Typography>
                    )}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Buscar Cliente ou Funcionário"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>{loading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>
                        ),
                    }}
                />
            )}
        />
    );
});