# Nathan Nogueira Carrara — Portfólio

[![Validar portfólio](https://github.com/Neitolas/portfolio-nathan/actions/workflows/ci.yml/badge.svg)](https://github.com/Neitolas/portfolio-nathan/actions/workflows/ci.yml)

Portfólio pessoal com **11 projetos e estudos**, experiência, formação e contato. Interface autoral em grafite e índigo, com conteúdo rastreável às fontes públicas e ao briefing fornecido.

![Início do portfólio](docs/evidencias/inicio-1440.png)

## Executar no Windows

Use **Node.js 24 LTS** (validado com 24.20.0) e npm. Abra o terminal nesta pasta:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abra a URL informada pelo Vite, normalmente `http://127.0.0.1:5173/`. Encerre o servidor com `Ctrl+C` antes de reinstalar dependências no Windows.

Para conferir o build de produção:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

A prévia de produção usa **http://127.0.0.1:4173/**. Se a porta estiver ocupada, encerre a prévia anterior. O site completo está em `dist/` após o build; `vite preview` é um servidor de teste local.

Caso o wrapper `npm.cmd` fique pendente, use a CLI oficial instalada com o Node:

```powershell
$portfolioNpmCli = Join-Path (Split-Path (Get-Command node.exe).Source) 'node_modules\npm\bin\npm-cli.js'
node.exe $portfolioNpmCli ci
node.exe $portfolioNpmCli run dev
```

## Estrutura e edição

| Arquivo | Responsabilidade |
| --- | --- |
| `src/content.js` | Identidade, links, experiências, formação, competências e projetos |
| `src/render.js` | HTML semântico, escape de conteúdo e validação de protocolos |
| `src/main.js` | Menu móvel e filtros acessíveis |
| `src/style.css` | Identidade visual, layout responsivo e movimento reduzido |
| `vite.config.js` | HTML completo no desenvolvimento/build e assets relativos |
| `tests/render.test.js` | Testes nativos de renderização e segurança do HTML |
| `tests/browser-checks.js` | Função de QA para executar com uma página Playwright existente |
| `.github/workflows/ci.yml` | Instalação, lint, testes e build em pushes/PRs |

Os textos principais são gerados no HTML pelo Vite. Identidade, projetos, navegação e contato continuam disponíveis sem JavaScript no navegador. Não há backend, formulário simulado, chat ou dependências de runtime.

## Fontes e validação

- [Fontes do perfil e pendências](docs/fontes-perfil.md)
- [Catálogo de projetos e escopo verificado](docs/catalogo-projetos.md)
- [Decisões visuais e técnicas](docs/decisoes.md)
- [Comandos e resultados de validação](docs/validacao.md)
- [Captura em celular](docs/evidencias/viewport-360.png) e [tablet](docs/evidencias/viewport-768.png)
- [Opções gratuitas de hospedagem](docs/hospedagem.md)

O LinkedIn não pôde ser lido nesta execução. O link do briefing foi preservado e sua divergência com o GitHub está registrada nas fontes. Datas e vínculos atuais devem ser confirmados antes de atualizar o conteúdo como atual. Nenhuma experiência, imagem ou infraestrutura da referência foi atribuída a Nathan.

O retrato ASCII com a foto do LinkedIn foi solicitado na revisão, mas o LinkedIn direcionou para uma tela de cadastro. A foto correta permanece pendente de fornecimento pelo titular; o site mantém o monograma até recebê-la.

## Versionamento e publicação

Este projeto foi preparado para um **repositório público independente**: `Neitolas/portfolio-nathan`. A branch principal é `main`. O workflow de CI valida os próximos pushes e pull requests; o histórico Git registra cada versão.

Para publicar o site em um serviço estático, use:

| Configuração | Valor |
| --- | --- |
| Diretório raiz | Raiz deste repositório |
| Versão do Node | 24 |
| Instalação | `npm ci` |
| Build | `npm run build` |
| Diretório de saída | `dist` |
| Branch de produção sugerida | `main` |

O `base: './'` permite servir os mesmos arquivos na raiz ou em subpasta. A navegação usa âncoras e não exige fallback de SPA para rotas. Após escolher o domínio, configurar canonical, `og:url` e imagem social absoluta com o endereço real. Não há deploy automático para nenhum host nesta versão; o workflow incluído executa verificações.
