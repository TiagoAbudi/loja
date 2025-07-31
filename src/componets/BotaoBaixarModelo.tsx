// src/components/BotaoBaixarModelo.tsx

import React from 'react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface BotaoBaixarModeloProps {
  fileName: string;       // Ex: "modelo_produtos.csv"
  headers: string;        // Ex: "SKU,Nome do Produto,Preço (R$)"
  exampleData?: string;   // Uma linha de exemplo opcional
}

export const BotaoBaixarModelo: React.FC<BotaoBaixarModeloProps> = ({
  fileName,
  headers,
  exampleData
}) => {
  const handleDownload = () => {
    // 1. Monta o conteúdo completo do CSV
    let csvContent = headers;
    if (exampleData) {
      csvContent += `\n${exampleData}`;
    }

    // Adiciona o BOM para garantir que o Excel abra o CSV com a codificação correta (UTF-8)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

    // 2. Cria o 'Blob' (o arquivo em memória)
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

    // 3. Cria um link temporário para iniciar o download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Libera a memória
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={<FileDownloadIcon />}
      onClick={handleDownload}
      sx={{marginBottom:'10px'}}
    >
      Baixar Planilha Modelo
    </Button>
  );
};