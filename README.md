<div align="center">

# Consulta CNPJ

Consulte dados cadastrais de empresas individualmente ou enriqueça uma lista de CNPJs a partir de um arquivo CSV.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://consultacnpj-react.vercel.app/)

[Acessar aplicação](https://consultacnpj-react.vercel.app/) · [Reportar problema](https://github.com/albertosena/consultacnpj-react/issues)

</div>

---

## Sobre o projeto

O **Consulta CNPJ** é uma aplicação web responsiva que consome a API pública [Minha Receita](https://minhareceita.org/) para simplificar a consulta de informações cadastrais de empresas brasileiras.

Além da busca individual, a aplicação processa arquivos CSV em lote: você escolhe os campos desejados, acompanha o progresso das consultas e baixa uma nova planilha com os dados enriquecidos.

## Funcionalidades

- **Consulta individual:** busca pelo CNPJ com ou sem máscara.
- **Dados organizados:** exibe situação cadastral, endereço, contatos, atividades, regime e capital social.
- **Resposta completa:** permite visualizar o JSON bruto retornado pela API.
- **Processamento em lote:** lê arquivos CSV que contenham uma coluna `cnpj`.
- **Seleção dinâmica:** permite pesquisar e escolher os campos incluídos no resultado.
- **Pré-visualização:** mostra as primeiras linhas antes de iniciar o processamento.
- **Acompanhamento:** indica o progresso das consultas em tempo real.
- **Exportação:** gera um novo CSV enriquecido para download.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| [React 19](https://react.dev/) | Construção da interface |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem e segurança no desenvolvimento |
| [Vite](https://vite.dev/) | Ambiente de desenvolvimento e build |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização responsiva |
| [Papa Parse](https://www.papaparse.com/) | Leitura e geração de arquivos CSV |
| [Minha Receita](https://minhareceita.org/) | Fonte pública dos dados de CNPJ |

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20.19+ ou 22.12+
- npm

### Instalação

```bash
git clone https://github.com/albertosena/consultacnpj-react.git
cd consultacnpj-react
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## Processamento de CSV

O arquivo deve ter um cabeçalho chamado exatamente `cnpj`. As demais colunas são preservadas no resultado.

```csv
cnpj,referencia
49752997000125,Cliente A
00000000000191,Cliente B
```

Na aplicação:

1. Selecione os campos que deseja adicionar ao arquivo.
2. Envie o CSV e confira a pré-visualização.
3. Clique em **Processar Arquivo**.
4. Ao final, baixe o CSV enriquecido.

> [!NOTE]
> As consultas são realizadas sequencialmente no navegador. Arquivos grandes podem levar mais tempo e estão sujeitos aos limites e à disponibilidade da API pública.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Valida o TypeScript e gera o build de produção |
| `npm run preview` | Executa localmente o build gerado |
| `npm run lint` | Analisa o código com ESLint |

## Estrutura

```text
consultacnpj-react/
├── public/                 # Arquivos públicos
├── src/
│   ├── assets/             # Recursos visuais
│   ├── App.tsx             # Interface e regras da aplicação
│   ├── index.css           # Estilos globais e Tailwind CSS
│   └── main.tsx            # Ponto de entrada
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API

A consulta utiliza o endpoint público:

```http
GET https://minhareceita.org/{CNPJ}
```

Não é necessário configurar chave de API. Como o serviço é externo, a aplicação depende de sua disponibilidade e de suas políticas de acesso.

## Deploy

O projeto está publicado na Vercel e disponível em:

**[consultacnpj-react.vercel.app](https://consultacnpj-react.vercel.app/)**

## Autor

Desenvolvido por [Alberto Sena](https://github.com/albertosena).
