import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Paper, Alert, FormHelperText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import myLogo from '../assets/logo.png';

const signUpErrorMap: { [key: string]: string } = {
    'User already registered': 'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
};

const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
};

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!validatePassword(password)) {
            setError('A senha não atende aos requisitos de segurança.');
            return;
        }

        setLoading(true);
        setSuccessMessage(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: `${process.env.REACT_APP_SITE_URL}/login`,
                }
            });

            if (error) throw error;
            setSuccessMessage('Conta criada! Por favor, verifique seu e-mail para confirmar o cadastro.');
        } catch (error: any) {
            const errorMessage = signUpErrorMap[error.message] || 'Ocorreu um erro ao criar a conta.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container component="main" maxWidth="xs">
                <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
                    <Box component="img" sx={{ height: 64, mb: 2 }} alt="Logo" src={myLogo} />
                    <Typography component="h1" variant="h5">Criar Conta</Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                        {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                        <TextField margin="normal" required fullWidth id="email" label="E-mail" name="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                        <TextField
                            margin="normal" required fullWidth name="password" label="Senha" type="password"
                            id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                        />
                        <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirmar Senha" type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                        <FormHelperText>
                            Mín. 6 caracteres, com maiúscula, minúscula, número e símbolo (@$!%*?&).
                        </FormHelperText>
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, borderRadius: 3 }} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid>
                                <MuiLink component={RouterLink} to="/login" variant="body2">
                                    Já tem uma conta? Faça login
                                </MuiLink>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpPage;