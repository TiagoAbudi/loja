# Sistema de Gerenciamento para Lojas

Uma aplicação web completa para controle de estoque e gerenciamento de produtos, vendas e clientes construída com React e utilizando Supabase como backend.

[![Acessar Demonstração Online](https://img.shields.io/badge/Acessar-Demo%20Online-brightgreen?style=for-the-badge&logo=github)](https://tiagoabudi.github.io/loja/)

---

## ✨ Principais Funcionalidades

- **Autenticação Completa:** Sistema de Login, Cadastro e Recuperação de Senha com confirmação por e-mail, gerenciado pelo Supabase.
- **Gerenciamento de Produtos (CRUD):** Funcionalidades completas para Criar, Ler, Atualizar e Deletar produtos do inventário.
- **Tabela de Dados Interativa:** Visualização dos produtos em uma tabela com paginação, ordenação e ações rápidas (editar, deletar, ativar/desativar).
- **Controle de Estado:** Ativação e desativação de produtos com feedback visual imediato.
- **Tema Dinâmico:** Interface com suporte a modo Claro (Light) e Escuro (Dark), com a preferência do usuário salva no navegador.
- **Deploy Contínuo:** Publicado como uma Single-Page Application (SPA) no GitHub Pages, com um fluxo de deploy simplificado.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - [**React**](https://reactjs.org/) (com TypeScript)
  - [**Material-UI (MUI)**](https://mui.com/) para componentes de UI
  - [**MUI X Data Grid**](https://mui.com/x/react-data-grid/) para a tabela de dados
  - [**React Router**](https://reactrouter.com/) para roteamento de páginas

- **Backend & Banco de Dados:**
  - [**Supabase**](https://supabase.com/) (Autenticação, Banco de Dados PostgreSQL, APIs)

- **Deployment:**
  - [**GitHub Pages**](https://pages.github.com/)

---

## 🧠 Stack Principal
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Material-UI](https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o projeto na sua máquina.

### 1. Clone o repositório

```bash
git clone https://github.com/TiagoAbudi/loja.git
cd loja
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

A estrutura de variáveis de ambiente do projeto está separada por ambientes. Utilize os arquivos conforme necessário:

- `.env.example`: Arquivo base com todas as chaves disponíveis como referência.
- `.env.local`: Para desenvolvimento local (não é versionado).
- `.env.development`: Configurações específicas de desenvolvimento.
- `.env.production`: Usado para produção (ex: em builds do GitHub Pages ou outros ambientes).

#### Para rodar localmente:

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais Supabase:

```env
# Variáveis de ambiente locais
REACT_APP_SUPABASE_URL=SUA_URL_DO_SUPABASE
REACT_APP_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE

# URL base para links de redirecionamento em ambiente local
REACT_APP_SITE_URL=http://localhost:3000/loja
```

Você pode usar o comando abaixo para criar a partir do exemplo:

```bash
cp .env.example .env.local
```

### 4. Rode a aplicação

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000/loja`.

---

## 📜 Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera a versão de produção otimizada na pasta `build`.
- `npm run deploy`: Executa o `build` e publica o conteúdo da pasta `build` no GitHub Pages.
- `npm test`: Roda os testes da aplicação.

---

## 🧾 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](https://github.com/TiagoAbudi/loja/blob/main/LICENSE) para mais detalhes.

---

Feito por **Tiago Abudi**  
[GitHub](https://github.com/TiagoAbudi)
