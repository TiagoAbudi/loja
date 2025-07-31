import React from 'react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface BotaoBaixarModeloProps {
  fileName: string;
  headers: string;
  exampleData?: string;
}

export const BotaoBaixarModelo: React.FC<BotaoBaixarModeloProps> = ({
  fileName,
  headers,
  exampleData
}) => {
  const handleDownload = () => {
    let csvContent = headers;
    if (exampleData) {
      csvContent += `\n${exampleData}`;
    }

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={<FileDownloadIcon />}
      onClick={handleDownload}
      sx={{ marginBottom: '10px' }}
    >
      Baixar Planilha Modelo
    </Button>
  );
};