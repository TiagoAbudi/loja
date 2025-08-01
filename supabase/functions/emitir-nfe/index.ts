import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const API_FISCAL_KEY = Deno.env.get('API_FISCAL_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { vendaId } = await req.json()
    if (!vendaId) {
      throw new Error("O ID da venda é obrigatório.")
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: vendaData, error: vendaError } = await supabaseAdmin
      .from('vendas')
      .select(`
        id,
        valor_liquido,
        cliente:Clientes (*),
        venda_itens:venda_itens (
          quantidade,
          preco_unitario,
          produto:Produtos (*)
        )
      `)
      .eq('id', vendaId)
      .single()

    if (vendaError) throw vendaError
    if (!vendaData) throw new Error("Venda não encontrada.")

    const nfePayload = {
      naturezaOperacao: 'Venda de mercadoria',
      cliente: {
        nome: vendaData.cliente.nome,
        cpfCnpj: vendaData.cliente.cpf_cnpj,
      },
      itens: vendaData.venda_itens.map(item => ({
        descricao: item.produto.nome,
        quantidade: item.quantidade,
        valorUnitario: item.preco_unitario,
      })),
    }

    const fiscalApiResponse = await fetch('https://api.seuservicofiscal.com/v2/nfe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_FISCAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nfePayload)
    })

    if (!fiscalApiResponse.ok) {
      const errorData = await fiscalApiResponse.json()
      throw new Error(`Erro da API Fiscal: ${JSON.stringify(errorData)}`)
    }

    const nfeResult = await fiscalApiResponse.json()
    const { error: rpcError } = await supabaseAdmin.rpc('registrar_nfe_emitida', {
      p_venda_id: vendaData.id,
      p_status_nfe: nfeResult.status,
      p_chave_acesso: nfeResult.chaveAcesso,
      p_url_xml: nfeResult.urlXml,
      p_url_danfe: nfeResult.urlDanfe
    })

    if (rpcError) throw rpcError
    return new Response(JSON.stringify({ message: "NF-e emitida com sucesso!", data: nfeResult }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })

  } catch (err) {

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})