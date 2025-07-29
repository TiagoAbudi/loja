import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { supabase } from '../supabaseClient';
import { Fornecedor } from '../pages/FornecedoresPage';

interface BuscaFornecedorProps {
    onFornecedorChange: (fornecedor: Fornecedor | null) => void;
}

export const BuscaFornecedor: React.FC<BuscaFornecedorProps> = ({ onFornecedorChange }) => {
    const [options, setOptions] = useState<Fornecedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const { data, error } = await supabase
                .from('fornecedores')
                .select('*')
                .ilike('nome_fantasia', `%${inputValue}%`)
                .limit(10);

            if (error) {
                console.error("Erro ao buscar fornecedores:", error);
                setOptions([]);
            } else {
                setOptions(data || []);
            }
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <Autocomplete
            freeSolo
            options={options}
            loading={loading}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            onChange={(_, value) => {
                if (typeof value === 'string') {
                    const novoFornecedor = {
                        id: 0,
                        nome_fantasia: value,
                        razao_social: value,
                        cnpj: null,
                        telefone: null,
                        email: null,
                        status: 'Ativo',
                        created_at: new Date().toISOString(),
                    } as Fornecedor;
                    onFornecedorChange(novoFornecedor);

                } else if (value) {
                    onFornecedorChange(value);
                } else {
                    onFornecedorChange(null);
                }
            }}
            getOptionLabel={(option) => typeof option === 'string' ? option : (option.nome_fantasia ?? '')}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Buscar ou Cadastrar Novo Fornecedor"
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
};