# Painel de Triagem QA

Demonstração de um fluxo de qualidade de software. A interface permite registrar defeitos, classificar severidade, buscar na fila e alterar o status. O banco contém três exemplos fictícios para explorar o fluxo na primeira abertura.

## Executar localmente

Use .NET SDK 10, Node.js 24.15 ou superior da série 24 e npm. Execute os comandos na pasta deste projeto.

Em um terminal, inicie a API.

```sh
dotnet restore backend/Triagem.Api.csproj --locked-mode
dotnet run --project backend/Triagem.Api.csproj --no-launch-profile
```

Em outro, inicie a interface.

```sh
cd frontend
npm ci
npm start
```

Abra [http://127.0.0.1:4200](http://127.0.0.1:4200). O servidor Angular encaminha chamadas da interface à API local na porta 5086. A API grava os dados em `backend/data/triagem.db`.

## Fluxo da API

| Método e caminho | Uso |
| --- | --- |
| GET /api/bugs | Listar defeitos |
| POST /api/bugs | Registrar título, descrição opcional e severidade |
| GET /api/bugs/{id} | Consultar um defeito |
| PATCH /api/bugs/{id}/status | Atualizar o status |

Severidades `low`, `medium` e `high`. Status `open`, `triage` e `resolved`. A API valida entradas e usa parâmetros SQL. É um laboratório local com dados fictícios e acesso pelo endereço de loopback.

## Testes

Encerre os servidores iniciados manualmente antes de rodar o Playwright.

```sh
cd frontend
npm ci
npx playwright install chromium
npm run build
npm test
```

A suíte inicia os dois servidores e usa um banco temporário separado. Ela cobre cadastro, mudança de status, leitura após recarga, filtros, validação de campos, retorno 404 e layout em tela pequena.

## Autoria

Projeto demonstrativo produzido para o portfólio de Nathan Nogueira Carrara com assistência do Codex na implementação, documentação e testes.
