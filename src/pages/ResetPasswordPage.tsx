import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, FormHelperText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
};

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMessage('Você agora pode definir uma nova senha.');
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!validatePassword(password)) {
            setError('A nova senha não atende aos requisitos de segurança.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setMessage('Senha alterada com sucesso! Redirecionando para o login...');
            setTimeout(async () => {
                await supabase.auth.signOut();
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container component="main" maxWidth="xs">
                <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
                    <Typography component="h1" variant="h5">Crie uma Nova Senha</Typography>
                    {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth name="password" label="Nova Senha"
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                        />
                        <TextField
                            margin="normal" required fullWidth name="confirmPassword" label="Confirmar Nova Senha"
                            type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
                        />
                        <FormHelperText>
                            Mín. 6 caracteres, com maiúscula, minúscula, número e símbolo (@$!%*?&).
                        </FormHelperText>
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPasswordPage;