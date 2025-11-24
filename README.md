🧾 Consulta CNPJ React

Aplicação React + Vite + Tailwind CSS para consultar dados de CNPJs em tempo real via API Minha Receita
.
Permite tanto consultas individuais quanto enriquecimento em massa via CSV, com filtros personalizados de campos.

🌐 Deploy Online:
👉 https://consultacnpj-react.vercel.app/

🚀 Funcionalidades

✅ Consulta individual de CNPJ

Busca dados cadastrais, fiscais e de contato diretamente da API.

Exibe informações de forma visual e organizada.

Mostra JSON bruto opcionalmente.

✅ Upload e processamento de CSV

Faz upload de um arquivo CSV contendo uma coluna cnpj.

Consulta automaticamente todos os CNPJs e gera um novo CSV enriquecido.

Permite selecionar quais campos incluir (todos os campos disponíveis da API).

✅ Filtros dinâmicos

Todos os campos do JSON da API são carregados automaticamente.

Permite buscar, marcar todos, limpar todos e selecionar individualmente.

Interface moderna, leve e responsiva.

✅ Interface elegante

Design escuro moderno com Tailwind CSS.

Cartões com transparência e sombra suave (glassmorphism).

Progresso de processamento em tempo real.

🧠 Stack utilizada
Tecnologia	Função
⚛️ React 18	Framework principal
⚡ Vite	Build rápido e leve
🎨 Tailwind CSS	Estilização moderna e responsiva
🧮 PapaParse	Leitura e escrita de CSV
🌐 Minha Receita API	Fonte dos dados do CNPJ


⚙️ Instalação local

Clone o repositório:

git clone https://github.com/albertosena/consultacnpj-react.git
cd consultacnpj-react


Instale as dependências:

npm install


Inicie o servidor de desenvolvimento:

npm run dev


Acesse:

http://localhost:5173

🧩 Build para produção
npm run build


Os arquivos finais ficarão na pasta dist/.

☁️ Deploy na Vercel

Este projeto está hospedado na Vercel com deploy contínuo a partir do GitHub.
A cada novo commit na branch main, o site é automaticamente atualizado.

🔗 Acesse em:
👉 https://consultacnpj-react.vercel.app/

🧱 Estrutura do projeto
consultacnpj-react/
├── src/
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Ponto de entrada
│   ├── index.css           # Estilos globais (Tailwind)
│   └── assets/             # Imagens, ícones, etc
├── public/                 # Arquivos estáticos
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts

🧠 API utilizada

A aplicação consome a API pública Minha Receita
:

GET https://minhareceita.org/{CNPJ}


Exemplo de resposta:

{
  "razao_social": "A S RIBEIRO",
  "nome_fantasia": "",
  "cnae_fiscal_descricao": "Desenvolvimento de programas de computador sob encomenda",
  "municipio": "BELO HORIZONTE",
  "uf": "MG",
  "situacao_cadastral": 2,
  "descricao_situacao_cadastral": "ATIVA",
  "data_inicio_atividade": "2023-02-28"
}


⚠️ Observação: se a API bloquear por CORS, é possível usar um proxy no backend (Node, .NET, etc.).

🛠️ Scripts disponíveis
Script	Descrição
npm run dev	Inicia o servidor local
npm run build	Gera o build para produção
npm run preview	Testa o build localmente
npm run lint	(opcional) Verifica o código com ESLint
📜 Licença

Este projeto está sob a licença MIT — sinta-se livre para usar, modificar e compartilhar.
Veja o arquivo LICENSE
 para mais detalhes.

💬 Autor

👤 Alberto Sena
💼 LinkedIn

💻 GitHub

🌐 App Online

Desenvolvido com ❤️ utilizando React, Tailwind e curiosidade por aprendizado contínuo.
