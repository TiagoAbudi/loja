export const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return '';
  }
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return 'Data inválida';
  }
};

export const formatCompactNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

export const formatCompactCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
};