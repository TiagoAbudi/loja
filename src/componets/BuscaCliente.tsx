import React, { useState, useEffect, forwardRef } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { supabase } from '../supabaseClient';

export interface Cliente {
    id: number;
    nome: string | null;
}

interface BuscaClienteProps {
    onClienteChange: (cliente: Cliente | null) => void;
}

export const BuscaCliente = forwardRef<HTMLDivElement, BuscaClienteProps>((props, ref) => {
    const { onClienteChange } = props;

    const [options, setOptions] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('Clientes')
                .select('id, nome')
                .ilike('nome', `%${inputValue}%`)
                .limit(10);
            setOptions(data || []);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <Autocomplete
            ref={ref}
            freeSolo
            options={options}
            loading={loading}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            onChange={(_, value) => {
                if (typeof value === 'string') {
                    onClienteChange({ id: 0, nome: value });
                } else {
                    onClienteChange(value);
                }
            }}
            getOptionLabel={(option) => {
                if (typeof option === 'string') {
                    return option;
                }
                return option.nome ?? '';
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Buscar ou Cadastrar Cliente"
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