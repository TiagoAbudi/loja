import React, { DragEvent, useState, useRef, ChangeEvent } from "react";
import { Typography, Box, Button, CircularProgress, Alert, Chip, AlertTitle } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse';
import { supabase } from "../supabaseClient";
import { Database } from "../lib/database.types";

type TableName = keyof Database['public']['Tables'];

interface ImportadorProps<T extends TableName> {
    tableName: T;
    mapeamentoColunas: (linha: any) => Database['public']['Tables'][T]['Insert'];
    csvExemplo: string;
    onImportSuccess?: () => void;
}


export function ImportadorDeRegistros<T extends TableName>({
    tableName,
    mapeamentoColunas,
    csvExemplo,
    onImportSuccess
}: ImportadorProps<T>) {

    const [file, setFile] = useState<File | null>(null);
    const [isOver, setIsOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string; } | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            setImportResult(null);
        }
    };

    const handleImport = () => {
        if (!file) return;
        setProcessing(true);
        setImportResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const registrosParaInserir = results.data.map(mapeamentoColunas).filter(r => r);

                    if (registrosParaInserir.length === 0) {
                        throw new Error("Nenhum registro válido encontrado no arquivo.");
                    }

                    const { error } = await supabase.from(tableName).insert(registrosParaInserir as any);

                    if (error) throw error;

                    setImportResult({ success: true, message: `${registrosParaInserir.length} registros importados com sucesso!` });
                    setFile(null);
                    onImportSuccess?.();

                } catch (error: any) {
                    setImportResult({ success: false, message: `Erro: ${error.message}` });
                } finally {
                    setProcessing(false);
                }
            }
        });
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsOver(false);
        const droppedFile = event.dataTransfer.files[0] || null;
        handleFileSelect(droppedFile);
    };

    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        handleFileSelect(selectedFile);
    };

    const handleBoxClick = () => {
        inputRef.current?.click();
    };

    return (
        <Box sx={{ width: '100%', minWidth: { sm: '500px' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
                <AlertTitle>Formato Esperado do Arquivo CSV</AlertTitle>
                A primeira linha do arquivo deve conter os seguintes cabeçalhos: <br />
                <strong>{csvExemplo}</strong>
            </Alert>

            <Box onClick={handleBoxClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                sx={{
                    display: "flex",
                    flexDirection: 'column',
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                    gap: 1,
                    borderRadius: 2,
                    border: "2px dashed",
                    borderColor: 'divider',
                    backgroundColor: isOver ?
                        'action.hover' :
                        'transparent',
                    cursor: 'pointer',
                    transition: (theme) =>
                        theme.transitions.create('background-color', {
                            duration: theme.transitions.duration.short,
                        }),
                }}>
                <input type="file" ref={inputRef} onChange={handleFileInputChange} accept=".csv" style={{ display: 'none' }} />
                <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                    Arraste um arquivo CSV ou clique para selecionar
                </Typography>
            </Box>

            {importResult &&
                <Alert severity={importResult.success ? "success" : "error"}>{importResult.message}</Alert>
            }

            {file && (
                <Box>
                    <Chip label={file.name} onDelete={() => setFile(null)} sx={{ mb: 2 }} />
                    <Button variant="contained" onClick={handleImport} disabled={processing} startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null} fullWidth>
                        {processing ? 'Importando...' : `Importar ${file.name}`}
                    </Button>
                </Box>
            )}
        </Box>
    );
}