import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { funcionarioData } = await req.json()
    const { nome, cargo, credito, email, senha } = funcionarioData;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: senha,
      email_confirm: true,
      user_metadata: { display_name: nome }
    })
    if (authError) throw authError

    const newUserId = authData.user.id

    const { data: funcData, error: funcError } = await supabaseAdmin
      .from('funcionarios')
      .insert({ nome, cargo, credito, status: 'Ativo' })
      .select('id')
      .single()
    if (funcError) throw funcError
    
    const newFuncionarioId = funcData.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ funcionario_id: newFuncionarioId, full_name: nome })
      .eq('id', newUserId)
    if (profileError) throw profileError

    return new Response(JSON.stringify({ message: "Usuário e funcionário criados com sucesso!" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erro na Edge Function:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})