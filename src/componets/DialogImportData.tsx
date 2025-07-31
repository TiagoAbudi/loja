import React, { DragEvent, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography } from '@mui/material';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: []) => void;
}

export function FileDrop() {
    const [isOver, setIsOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Define the event handlers
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

        // Fetch the files
        const droppedFiles = Array.from(event.dataTransfer.files);
        setFiles(droppedFiles);

        // Use FileReader to read file content
        droppedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                console.log(reader.result);
            };

            reader.onerror = () => {
                console.error("There was an issue reading the file.");
            };

            reader.readAsDataURL(file);
            return reader;
        });
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50px",
                width: "300px",
                border: "1px dotted",
                backgroundColor: isOver ? "lightgray" : "white",
            }}
        >
            <Typography>
                Drag and drop some files here
            </Typography>
        </div>
    );
}


export const DialogImportData: React.FC<ImportDialogProps> = ({ open, onClose, onConfirm }) => {
    const [data, setData] = useState('');

    const handleConfirm = () => {
        console.log('teste');
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogContent>
                <FileDrop />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained">Confirmar Abertura</Button>
            </DialogActions>
        </Dialog>
    );
};