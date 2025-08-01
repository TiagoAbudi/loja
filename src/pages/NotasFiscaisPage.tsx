import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface NotaFiscal {
    id: number;
    numero: number;
    serie: number;
    cliente: string;
    dataEmissao: Date;
    valor: number;
    status: 'Enviada' | 'Cancelada' | 'Processando' | 'Rejeitada';
    urlDanfe: string;
    urlXml: string;
}

async function fetchNotasFiscais(): Promise<NotaFiscal[]> {
    return [
        { id: 1, numero: 101, serie: 1, cliente: 'Empresa Exemplo Ltda', dataEmissao: new Date(), valor: 1500.50, status: 'Enviada', urlDanfe: '#', urlXml: '#' },
        { id: 2, numero: 102, serie: 1, cliente: 'Cliente Teste S.A.', dataEmissao: new Date(), valor: 899.00, status: 'Cancelada', urlDanfe: '#', urlXml: '#' },
        { id: 3, numero: 103, serie: 1, cliente: 'Comércio de Parafusos', dataEmissao: new Date(), valor: 345.80, status: 'Processando', urlDanfe: '#', urlXml: '#' },
    ];
}

const NotasFiscaisPage: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotasFiscais().then(data => {
            setRows(data);
            setLoading(false);
        });
    }, []);

    const columns: GridColDef[] = [
        { field: 'numero', headerName: 'Número', width: 100 },
        { field: 'serie', headerName: 'Série', width: 80 },
        { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 200 },
        { field: 'dataEmissao', headerName: 'Data de Emissão', width: 150, type: 'date', valueGetter: (value) => new Date(value) },
        {
            field: 'valor',
            headerName: 'Valor (R$)',
            width: 130,
            type: 'number',
            valueFormatter: (value: number) => {
                if (typeof value !== 'number') {
                    return '';
                }
                return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                const status = params.value;
                let color: "success" | "error" | "warning" | "info" = 'info';
                if (status === 'Enviada') color = 'success';
                if (status === 'Cancelada' || status === 'Rejeitada') color = 'error';
                if (status === 'Processando') color = 'warning';
                return <Chip label={status} color={color} size="small" />;
            },
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton title="Baixar DANFE (PDF)" href={params.row.urlDanfe} target="_blank" disabled={params.row.status !== 'Enviada'}>
                        <PictureAsPdfIcon />
                    </IconButton>
                    <IconButton title="Baixar XML" href={params.row.urlXml} target="_blank" disabled={params.row.status !== 'Enviada'}>
                        <DownloadIcon />
                    </IconButton>
                </>
            ),
        }
    ];

    return (
        <Box sx={{ height: 'calc(100% - 64px)', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Gestão de Notas Fiscais (NF-e)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => alert('Abrir tela de emissão de NF-e')}
                >
                    Emitir Nova Nota
                </Button>
            </Box>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight={false}
                sx={{ backgroundColor: (theme) => theme.palette.background.paper }}
            />
        </Box>
    );
};

export default NotasFiscaisPage;