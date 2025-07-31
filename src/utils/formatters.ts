export function formatCompactNumber(num: number): string {
    if (!num) {
        return '0';
    }

    if (num < 1000) {
        return num.toString();
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    });

    return formatter.format(num);
}

export function formatCompactCurrency(num: number): string {
    if (!num) {
        return 'R$ 0';
    }

    const compactValue = formatCompactNumber(num);

    return `R$ ${compactValue}`;
}