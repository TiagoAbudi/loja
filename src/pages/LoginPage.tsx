import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button,
    Link, Grid, Paper, Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import myLogo from '../assets/logo.png';

const supabaseErrorMap: { [key: string]: string } = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: any) {
            const errorMessage = supabaseErrorMap[error.message] || 'Ocorreu um erro. Tente novamente.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <Box component="img" sx={{ height: 64, mb: 2 }} alt="Logo da sua empresa" src={myLogo} />
                    <Typography component="h1" variant="h5">Login</Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                        <TextField
                            margin="normal" required fullWidth id="email"
                            label="E-mail" name="email" value={email}
                            onChange={(e) => setEmail(e.target.value)} disabled={loading}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                        <TextField
                            margin="normal" required fullWidth name="password"
                            label="Senha" type="password" id="password" value={password}
                            onChange={(e) => setPassword(e.target.value)} disabled={loading}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                        <Button
                            type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, mb: 2, borderRadius: 3 }}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <Grid container justifyContent="space-between">
                            <Grid><Link component={RouterLink} to="/forgot-password" variant="body2">Esqueceu a senha?</Link></Grid>
                            <Grid><Link component={RouterLink} to="/signup" variant="body2">
                                {"Não tem uma conta? Cadastre-se"}
                            </Link></Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginPage;