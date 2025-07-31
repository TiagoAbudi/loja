import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ImportadorDeRegistros } from './ImportadorDeRegistros';
import { Database } from '../lib/database.types';

type TableName = keyof Database['public']['Tables'];

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    tableName: TableName;
    mapeamentoColunas: (linha: any) => any;
    csvExemplo: string;
    onImportSuccess?: () => void;
}

export const DialogImportData: React.FC<ImportDialogProps> = ({
    open,
    onClose,
    title,
    tableName,
    mapeamentoColunas,
    csvExemplo,
    onImportSuccess
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Importar {title}</DialogTitle>
            <DialogContent>
                <ImportadorDeRegistros
                    tableName={tableName}
                    mapeamentoColunas={mapeamentoColunas}
                    csvExemplo={csvExemplo}
                    onImportSuccess={onImportSuccess}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};