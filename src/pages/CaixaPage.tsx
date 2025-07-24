import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider } from '@mui/material';
import { supabase } from '../supabaseClient';
import { FecharCaixaDialog } from '../componets/FecharCaixaDialog';
import { AbrirCaixaDialog } from '../componets/AbrirCaixaDialog';
import { MovimentacoesCaixaList } from '../componets/MovimentacoesCaixaList';
import { MovimentacaoDialog, TipoMovimentacao } from '../componets/MovimentacaoDialog';

interface Caixa {
    id: number;
    data_abertura: string;
    valor_inicial: number;
    status: string;
}

interface Movimentacao {
    id: number;
    data_movimentacao: string;
    tipo: string;
    descricao: string;
    valor: number;
}


const CaixaPage: React.FC = () => {
    const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [abrirCaixaDialogOpen, setAbrirCaixaDialogOpen] = useState(false);
    const [fecharCaixaDialogOpen, setFecharCaixaDialogOpen] = useState(false);
    const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false);
    const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacao>('SUPRIMENTO');

    const fetchCaixaAberto = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('caixas')
            .select('*')
            .eq('status', 'Aberto')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar caixa:', error);
            setLoading(false);
            return;
        }

        setCaixaAtual(data);

        if (data) {
            // 2. Ajuste a busca para trazer todos os campos necessários
            const { data: movsData, error: movsError } = await supabase
                .from('caixa_movimentacoes')
                .select('id, data_movimentacao, tipo, descricao, valor')
                .eq('caixa_id', data.id)
                .order('created_at', { ascending: false }); // Ordena da mais recente para a mais antiga

            if (movsError) console.error('Erro ao buscar movimentações:', movsError);
            else setMovimentacoes(movsData || []);
        }

        setLoading(false);
    }, []);


    useEffect(() => {
        fetchCaixaAberto();
    }, [fetchCaixaAberto]);

    const handleAbrirCaixa = async (valorInicial: number) => {
        const { data: caixaJaAberto, error: checkError } = await supabase
            .from('caixas')
            .select('id')
            .eq('status', 'Aberto')
            .maybeSingle();

        if (checkError) {
            console.error("Erro ao verificar caixa existente:", checkError);
            alert("Ocorreu um erro. Tente novamente.");
            return;
        }

        if (caixaJaAberto) {
            alert("Já existe um caixa aberto. Por favor, feche o caixa atual antes de abrir um novo.");
            setAbrirCaixaDialogOpen(false); // Fecha o diálogo
            return;
        }

        const { data: novoCaixa, error: caixaError } = await supabase
            .from('caixas')
            .insert({ valor_inicial: valorInicial, status: 'Aberto' })
            .select()
            .single();

        if (caixaError || !novoCaixa) {
            console.error("Erro ao abrir caixa:", caixaError);
            return;
        }

        const { error: movError } = await supabase
            .from('caixa_movimentacoes')
            .insert({
                caixa_id: novoCaixa.id,
                tipo: 'ABERTURA',
                descricao: 'Abertura de Caixa',
                valor: valorInicial
            });

        if (movError) console.error("Erro ao registrar movimentação de abertura:", movError);

        setAbrirCaixaDialogOpen(false);
        fetchCaixaAberto();
    };

    const handleFecharCaixa = async (valorInformado: number) => {
        if (!caixaAtual) return;

        const valorCalculado = movimentacoes.reduce((acc, mov) => acc + Number(mov.valor), 0);
        const diferenca = valorInformado - valorCalculado;

        const { error } = await supabase
            .from('caixas')
            .update({
                status: 'Fechado',
                data_fechamento: new Date().toISOString(),
                valor_final_calculado: valorCalculado,
                valor_final_informado: valorInformado,
                diferenca: diferenca,
            })
            .eq('id', caixaAtual.id);

        if (error) {
            console.error("Erro ao fechar o caixa:", error);
        } else {
            setFecharCaixaDialogOpen(false);
            fetchCaixaAberto();
        }
    };

    const handleOpenMovimentacaoDialog = (tipo: TipoMovimentacao) => {
        setTipoMovimentacao(tipo);
        setMovimentacaoDialogOpen(true);
    };

    // 4. Crie a função para registrar a nova movimentação
    const handleRegistrarMovimentacao = async (dados: { descricao: string; valor: number }) => {
        if (!caixaAtual) return;

        // O valor da Sangria deve ser negativo
        const valorFinal = tipoMovimentacao === 'SANGRIA' ? -Math.abs(dados.valor) : Math.abs(dados.valor);

        const { error } = await supabase
            .from('caixa_movimentacoes')
            .insert({
                caixa_id: caixaAtual.id,
                tipo: tipoMovimentacao,
                descricao: dados.descricao,
                valor: valorFinal
            });

        if (error) {
            console.error(`Erro ao registrar ${tipoMovimentacao}:`, error);
            alert(`Falha ao registrar ${tipoMovimentacao}.`);
        } else {
            setMovimentacaoDialogOpen(false);
            fetchCaixaAberto(); // Recarrega os dados para mostrar a nova movimentação
        }
    };

    const valorCalculado = caixaAtual ? movimentacoes.reduce((acc, mov) => acc + Number(mov.valor), 0) : 0;

    if (loading) {
        return <CircularProgress />;
    }

    if (!caixaAtual) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <Typography variant="h4" gutterBottom>Caixa Fechado</Typography>
                <Button variant="contained" size="large" onClick={() => setAbrirCaixaDialogOpen(true)}>
                    Abrir Caixa
                </Button>
                <AbrirCaixaDialog
                    open={abrirCaixaDialogOpen}
                    onClose={() => setAbrirCaixaDialogOpen(false)}
                    onConfirm={handleAbrirCaixa}
                />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Caixa Aberto</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Abertura: {new Date(caixaAtual.data_abertura).toLocaleString('pt-BR')}</Typography>
            <Typography variant="h6">Valor Inicial: {caixaAtual.valor_inicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
            <Typography variant="h5" sx={{ mt: 1, color: 'primary.main' }}>
                Total em Caixa (Sistema): {valorCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" color="warning" onClick={() => handleOpenMovimentacaoDialog('SANGRIA')}>Registrar Sangria</Button>
                <Button variant="contained" color="info" onClick={() => handleOpenMovimentacaoDialog('SUPRIMENTO')}>Registrar Suprimento</Button>
                <Button variant="contained" color="error" sx={{ ml: 'auto' }} onClick={() => setFecharCaixaDialogOpen(true)}>
                    Fechar Caixa
                </Button>
            </Box>

            <Box mt={4}>
                <Typography variant="h5">Últimas Movimentações</Typography>
                <MovimentacoesCaixaList movimentacoes={movimentacoes} />
            </Box>

            <FecharCaixaDialog
                open={fecharCaixaDialogOpen}
                onClose={() => setFecharCaixaDialogOpen(false)}
                onConfirm={handleFecharCaixa}
                valorCalculado={valorCalculado}
            />

            <MovimentacaoDialog
                open={movimentacaoDialogOpen}
                onClose={() => setMovimentacaoDialogOpen(false)}
                onConfirm={handleRegistrarMovimentacao}
                tipo={tipoMovimentacao}
            />
        </Paper>
    );
};

export default CaixaPage;