import React from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';

const DashboardPaper = (props: { children: React.ReactNode }) => (
    <Paper
        elevation={3}
        sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
        }}
    >
        {props.children}
    </Paper>
);

const HomePage: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
            <Typography variant="h4" gutterBottom>
                Bem-vindo ao seu Dashboard!
            </Typography>

            <Grid container spacing={1} sx={{ flexGrow: 1 }}>

                <Grid size={{ xs: 12, lg: 3, sm: 6 }}>
                    <DashboardPaper>
                        <Typography>Card 1</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <DashboardPaper>
                        <Typography>Card 2</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
                    <DashboardPaper>
                        <Typography>Card 3</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                    <DashboardPaper>
                        <Typography>Card 4</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                    <DashboardPaper>
                        <Typography>Card 5</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                    <DashboardPaper>
                        <Typography>Card 6</Typography>
                    </DashboardPaper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <DashboardPaper>
                        <Typography>Card 7</Typography>
                    </DashboardPaper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default HomePage;