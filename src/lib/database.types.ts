export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      caixa_movimentacoes: {
        Row: {
          caixa_id: number
          created_at: string | null
          data_movimentacao: string
          descricao: string
          id: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          valor: number
        }
        Insert: {
          caixa_id: number
          created_at?: string | null
          data_movimentacao?: string
          descricao: string
          id?: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          valor: number
        }
        Update: {
          caixa_id?: number
          created_at?: string | null
          data_movimentacao?: string
          descricao?: string
          id?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "caixa_movimentacoes_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixas"
            referencedColumns: ["id"]
          },
        ]
      }
      caixas: {
        Row: {
          created_at: string | null
          data_abertura: string
          data_fechamento: string | null
          diferenca: number | null
          id: number
          status: string
          valor_final_calculado: number | null
          valor_final_informado: number | null
          valor_inicial: number
        }
        Insert: {
          created_at?: string | null
          data_abertura?: string
          data_fechamento?: string | null
          diferenca?: number | null
          id?: number
          status?: string
          valor_final_calculado?: number | null
          valor_final_informado?: number | null
          valor_inicial: number
        }
        Update: {
          created_at?: string | null
          data_abertura?: string
          data_fechamento?: string | null
          diferenca?: number | null
          id?: number
          status?: string
          valor_final_calculado?: number | null
          valor_final_informado?: number | null
          valor_inicial?: number
        }
        Relationships: []
      }
      Clientes: {
        Row: {
          cpf_cnpj: number | null
          created_at: string
          email: string | null
          endereco: string | null
          id: number
          nome: string | null
          status: string
          telefone: number | null
        }
        Insert: {
          cpf_cnpj?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome?: string | null
          status?: string
          telefone?: number | null
        }
        Update: {
          cpf_cnpj?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome?: string | null
          status?: string
          telefone?: number | null
        }
        Relationships: []
      }
      compra_itens: {
        Row: {
          compra_id: number
          custo_unitario: number
          id: number
          produto_id: number
          quantidade: number
        }
        Insert: {
          compra_id: number
          custo_unitario: number
          id?: number
          produto_id: number
          quantidade: number
        }
        Update: {
          compra_id?: number
          custo_unitario?: number
          id?: number
          produto_id?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "compra_itens_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "Produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          created_at: string | null
          data_compra: string
          data_vencimento: string | null
          descricao: string | null
          fornecedor_id: number | null
          id: number
          status_pagamento: string
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          data_compra?: string
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor_id?: number | null
          id?: number
          status_pagamento: string
          valor_total: number
        }
        Update: {
          created_at?: string | null
          data_compra?: string
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor_id?: number | null
          id?: number
          status_pagamento?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_a_pagar: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id: number | null
          id: number
          status: Database["public"]["Enums"]["status_pagamento"] | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id?: number | null
          id?: number
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor_id?: number | null
          id?: number
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_a_receber: {
        Row: {
          cliente_id: number
          created_at: string | null
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          id: number
          status: Database["public"]["Enums"]["status_recebimento"] | null
          valor: number
        }
        Insert: {
          cliente_id: number
          created_at?: string | null
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          id?: number
          status?: Database["public"]["Enums"]["status_recebimento"] | null
          valor: number
        }
        Update: {
          cliente_id?: number
          created_at?: string | null
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: number
          status?: Database["public"]["Enums"]["status_recebimento"] | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "Clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          created_at: string | null
          email: string | null
          id: number
          nome_fantasia: string
          razao_social: string | null
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          nome_fantasia: string
          razao_social?: string | null
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          nome_fantasia?: string
          razao_social?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      Produtos: {
        Row: {
          estoque: number | null
          fornecedor_id: number | null
          id: number
          nome: string | null
          preco: number | null
          sku: string | null
          status: string | null
          valor_de_custo: number | null
        }
        Insert: {
          estoque?: number | null
          fornecedor_id?: number | null
          id?: number
          nome?: string | null
          preco?: number | null
          sku?: string | null
          status?: string | null
          valor_de_custo?: number | null
        }
        Update: {
          estoque?: number | null
          fornecedor_id?: number | null
          id?: number
          nome?: string | null
          preco?: number | null
          sku?: string | null
          status?: string | null
          valor_de_custo?: number | null
        }
        Relationships: []
      }
      venda_itens: {
        Row: {
          id: number
          preco_total: number
          preco_unitario: number
          produto_id: number
          quantidade: number
          venda_id: number
        }
        Insert: {
          id?: number
          preco_total: number
          preco_unitario: number
          produto_id: number
          quantidade: number
          venda_id: number
        }
        Update: {
          id?: number
          preco_total?: number
          preco_unitario?: number
          produto_id?: number
          quantidade?: number
          venda_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "Produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_pagamentos: {
        Row: {
          id: number
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          valor: number
          venda_id: number
        }
        Insert: {
          id?: number
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          valor: number
          venda_id: number
        }
        Update: {
          id?: number
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          valor?: number
          venda_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "venda_pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          cliente_id: number | null
          created_at: string | null
          data_venda: string
          desconto: number | null
          id: number
          status: string
          status_nfe: string | null
          valor_bruto: number
          valor_liquido: number
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string | null
          data_venda?: string
          desconto?: number | null
          id?: number
          status?: string
          status_nfe?: string | null
          valor_bruto: number
          valor_liquido: number
        }
        Update: {
          cliente_id?: number | null
          created_at?: string | null
          data_venda?: string
          desconto?: number | null
          id?: number
          status?: string
          status_nfe?: string | null
          valor_bruto?: number
          valor_liquido?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "Clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_contas_vencidas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      finalizar_venda: {
        Args: { id_da_venda: number }
        Returns: undefined
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_produtos: number
          valor_total_estoque: number
          produtos_estoque_baixo: number
          produtos_sem_estoque: number
        }[]
      }
      get_lucratividade_periodo: {
        Args: { data_inicio: string; data_fim: string }
        Returns: {
          id_venda: number
          data_da_venda: string
          cliente: string
          valor_da_venda: number
          custo_da_venda: number
          lucro: number
        }[]
      }
      get_or_create_cliente: {
        Args: { nome_cliente: string }
        Returns: number
      }
      get_or_create_fornecedor: {
        Args: { nome_fornecedor: string }
        Returns: number
      }
      get_vendas_ultimos_7_dias: {
        Args: Record<PropertyKey, never>
        Returns: {
          dia: string
          vendas: number
        }[]
      }
      processar_entrada_de_produto: {
        Args: { id_da_compra: number }
        Returns: undefined
      }
    }
    Enums: {
      metodo_pagamento:
        | "Dinheiro"
        | "Cartão de Crédito"
        | "Cartão de Débito"
        | "Pix"
        | "A Prazo"
      status_pagamento: "Pendente" | "Pago" | "Vencido"
      status_recebimento: "Pendente" | "Recebido" | "Vencido"
      tipo_movimentacao:
        | "ABERTURA"
        | "SUPRIMENTO"
        | "SANGRIA"
        | "VENDA"
        | "PAGAMENTO_CONTA"
        | "RECEBIMENTO_CONTA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      metodo_pagamento: [
        "Dinheiro",
        "Cartão de Crédito",
        "Cartão de Débito",
        "Pix",
        "A Prazo",
      ],
      status_pagamento: ["Pendente", "Pago", "Vencido"],
      status_recebimento: ["Pendente", "Recebido", "Vencido"],
      tipo_movimentacao: [
        "ABERTURA",
        "SUPRIMENTO",
        "SANGRIA",
        "VENDA",
        "PAGAMENTO_CONTA",
        "RECEBIMENTO_CONTA",
      ],
    },
  },
} as const
