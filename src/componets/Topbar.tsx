import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useTheme } from '@mui/material';
import { supabase } from '../supabaseClient';
import { ColorModeContext } from '../contexts/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Loja
        </Typography>

        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Button color="inherit" onClick={handleLogout}>Sair</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;