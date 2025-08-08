import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, ListSubheader, CssBaseline } from '@mui/material';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import { supabase } from '../supabaseClient';
import { ColorModeContext } from '../contexts/ThemeContext';
import myLogo from '../assets/logo.png';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Groups2Icon from '@mui/icons-material/Groups2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 300;

export const DashboardLayout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuSections = [
    {
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Venda', icon: <AddShoppingCartIcon />, path: '/venda' },
      ]
    },
    {
      title: 'Cadastros',
      items: [
        { text: 'Produtos', icon: <ShoppingCartIcon />, path: '/produtos' },
        { text: 'Entrada Produtos', icon: <ShoppingBasketIcon />, path: '/entrada' },
        { text: 'Fornecedores', icon: <RecentActorsIcon />, path: '/fornecedores' },
        { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
        { text: 'Funcionários', icon: <Groups2Icon />, path: '/funcionarios' },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { text: 'Contas a Pagar', icon: <PaymentsIcon />, path: '/contas-a-pagar' },
        { text: 'Contas a Receber', icon: <PaidIcon />, path: '/contas-a-receber' },
        { text: 'Caixa', icon: <AccountBalanceWalletIcon />, path: '/caixa' },
      ]
    },
    {
      title: 'Fiscal',
      items: [
        { text: 'Notas Fiscais (NF-e)', icon: <ReceiptLongIcon />, path: '/notas-fiscais' },
      ]
    },
    {
      title: 'Relatórios',
      items: [
        { text: 'Relatório de Vendas', icon: <SummarizeIcon />, path: '/relatorio-vendas' },
        { text: 'Relatório de Compras', icon: <ShoppingCartCheckoutIcon />, path: '/relatorio-compras' },
        { text: 'Relatório de Caixas', icon: <AccountBalanceIcon />, path: '/relatorio-caixa' },
        { text: 'Relatório Itens Clientes', icon: <PersonSearchIcon />, path: '/relatorio-item-cliente' },
        { text: 'Relatório Lucratividade', icon: <SsidChartIcon />, path: '/relatorio-lucratividade' },
      ]
    }
  ];

  const visibleMenuSections = useMemo(() => {
    if (!profile) return [];
    if (profile.role === 'admin') return menuSections;

    const funcionarioPaths = [
      '/',
      '/venda',
      '/produtos',
      '/clientes',
      '/caixa',
      '/relatorio-vendas'
    ];

    return menuSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => funcionarioPaths.includes(item.path)),
      }))
      .filter(section => section.items.length > 0);

  }, [profile, menuSections]);

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List component="nav">
        {visibleMenuSections.map((section, index) => (
          <React.Fragment key={section.title || `section-${index}`}>
            {section.title && <ListSubheader component="div">{section.title}</ListSubheader>}
            {section.items.map((item) => (
              <ListItemButton
                key={item.text}
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={handleDrawerClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </React.Fragment>
        ))}
      </List>
    </>
  );


  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ marginRight: '10px' }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box component="img" sx={{ height: 30, mr: 2 }} alt="Logo da sua empresa" src={myLogo} />
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Meu App
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: theme.palette.action.hover, borderRadius: '4px' },
            '&::-webkit-scrollbar-thumb:hover': { background: theme.palette.action.selected },
            ...(!isMobile && {
              position: 'relative',
              whiteSpace: 'nowrap',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7)
              }),
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', height: '100vh' }}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;