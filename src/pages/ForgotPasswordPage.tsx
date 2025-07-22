// Nenhuma mudança aqui, este código já estava correto.
import React from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import myLogo from '../assets/logo.png';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.REACT_APP_SITE_URL}/update-password`,
        });
        setLoading(false);
        if (error) {
            setMessage('Erro: ' + error.message);
        } else {
            setMessage('Se uma conta com este e-mail existir, um link de recuperação foi enviado.');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container component="main" maxWidth="xs">
                <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
                    <Typography component="h1" variant="h5">Recuperar Senha</Typography>
                    {message && <Alert severity={message.startsWith('Erro') ? 'error' : 'success'} sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="normal" required fullWidth id="email" label="Seu e-mail" name="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                        <MuiLink component={RouterLink} to="/login" variant="body2">Voltar para o Login</MuiLink>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPasswordPage;