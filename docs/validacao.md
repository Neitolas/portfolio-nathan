# Validação

Data: **22/10/2026**, referência America/Sao_Paulo. Execução no Windows com Node **24.20.0**, npm **11.19.0**, Vite **8.3.5** e ESLint **10.13.0**.

## Instalação, lint, testes e build

Nesta sessão, a CLI npm foi executada diretamente com `node.exe`, pois o wrapper `npm.cmd` demorou a responder. Os scripts de `package.json` também foram executados; comandos equivalentes diretos são mostrados abaixo para reprodução.

| Comando executado | Resultado |
| --- | --- |
| CLI npm `install --cache .npm-cache --no-fund --no-audit` | Sucesso; 92 pacotes e lockfile gerado |
| `node --test tests/*.test.js` antes da implementação | Falha esperada por ausência de `src/content.js` |
| `node --test tests/*.test.js` após implementação | **4 testes aprovados**, 0 falhas |
| `npm run lint` / `node node_modules/eslint/bin/eslint.js .` | Exit 0, sem erros |
| `npm run build` / `node node_modules/vite/bin/vite.js build` | Exit 0; HTML completo e assets em `dist/` |
| CLI npm `ci --offline --cache .npm-cache --no-fund --no-audit` | **Sucesso**, reinstalação de 92 pacotes com lockfile |
| CLI npm `install --package-lock-only --offline --ignore-scripts --cache .npm-cache --no-fund --no-audit` | Sucesso; `engines` alinhado ao ESLint sem alterar dependências |

Uma primeira tentativa de `npm ci` falhou com EPERM porque a prévia mantinha o binding nativo do Rolldown aberto no Windows. A prévia foi encerrada e a mesma instalação concluiu. A consulta inicial ao registro npm também exigiu liberação do sandbox (EACCES); nenhuma configuração de segurança do computador foi alterada.

O build observado gerou `index.html` de aproximadamente 17,77 kB, CSS de 21,68 kB e JavaScript de 1,79 kB antes de gzip. Esses tamanhos não equivalem a medições de Lighthouse ou Core Web Vitals.

## Navegador real

Build servido por `vite preview` em **http://127.0.0.1:4173/**. QA em Chromium via Playwright, função em `tests/browser-checks.js` (expressão assíncrona recebendo `page`; opcionalmente `artifactDirectory` para capturas).

| Verificação | 360 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Sem rolagem horizontal | Passou | Passou | Passou |
| Identidade e três projetos | Passou | Passou | Passou |
| Filtros Todos / Full Stack / Backend e contagem acessível | Passou | Passou | Passou |
| Detalhes do projeto abrem por teclado | Passou | Passou | Passou |
| Acesso direto às quatro âncoras; títulos fora do cabeçalho | Passou | Passou | Passou |
| `prefers-reduced-motion`: scroll auto e transições zeradas | Passou | Passou | Passou |
| Menu abre, fecha, responde a Escape e devolve foco | Passou | Navegação desktop | Navegação desktop |
| Menu oculto fora da sequência de Tab | Passou | Não se aplica | Não se aplica |

- Contexto adicional com **JavaScript desabilitado** em 360 px: identidade, três projetos, navegação e e-mail disponíveis.
- **Zero erros de página**, zero requisições de recursos malsucedidas e nenhuma resposta HTTP >=400 durante o roteiro principal.
- Todas as requisições da página permaneceram na origem local. Nenhuma requisição para Wallace ou serviço de chat.
- Inspeção visual das capturas nas três larguras; captura adicional da primeira tela no celular para conferir legibilidade.
- Build servido também em `http://127.0.0.1:4174/portfolio-test/#projetos`: JavaScript, CSS e favicon carregaram sob a subpasta, sem erros HTTP. Servidor auxiliar encerrado após a conferência.
- Links internos, destinos de repositórios e protocolos de contato conferidos. Não houve envio de e-mail ou mensagem de teste.

Evidências: `evidencias/viewport-360.png`, `viewport-768.png`, `viewport-1440.png` e `browser.json`.

## REA 6.7.0

1. Consultada ajuda geral de `rea-agents@6.7.0` e de `analyze-javascript-application`.
2. A ajuda desta versão indica **`--format json`**, usado em vez de presumir a flag `--json` mencionada no briefing.
3. Executado `rea analyze-javascript-application <caminho-absoluto-para-src> --format json`, usando a CLI via Node. Escopo: `content.js`, `main.js`, `render.js`, sem cache, dependências ou código corporativo.
4. A primeira execução retornou exit 1 e evidência parcial: autoteste nativo bloqueado pelo sandbox ao abrir o caminho pai Windows.
5. A execução autorizada fora do sandbox retornou **exit 0**. O grafo da aplicação informou `coverage.status: complete`, `truncated: false`, `omitted_count: 0`.
6. O **grafo semântico informa `status: unknown`**, com famílias parciais e relações dinâmicas não resolvidas. Isso não comprova cobertura integral de comportamento. Análise estática não executou o site e não substitui os testes de navegador.

Os JSON brutos imutáveis foram preservados localmente e excluídos do Git público por conterem caminhos do computador. `evidencias/rea-resumo.json` contém o resumo público, com resultados e limites. Não foi necessário automatizar CDP da referência para implementar o portfólio; a referência foi inspecionada pelo navegador comum.

## Revisão e limites

- Revisão independente de código: nenhum problema relevante de renderização, menu, filtros ou caminhos. Detectada divergência em `engines`, corrigida de `>=22.12.0` para `^22.13.0 || >=24.0.0`, conforme requisito real do ESLint instalado.
- O revisor executou os quatro testes nativos; o perfil de navegador já em uso impediu uma segunda sessão dele. O roteiro Chromium acima foi executado pelo implementador.
- Testes em emulação de viewport, sem dispositivos físicos, Safari/WebKit, Firefox ou leitor de tela. Não há certificação WCAG nem medição Lighthouse/CWV.
- LinkedIn atual não lido; vínculo atual da Prever e detalhes históricos têm pendências em `fontes-perfil.md`.
- Publicação do **código público no GitHub** autorizada após a prévia local. A hospedagem do site ainda depende da escolha do provedor; o CI incluído valida código e não faz deploy.
- Repositório criado via API autenticada: [Neitolas/portfolio-nathan](https://github.com/Neitolas/portfolio-nathan), resposta `private: false`, branch padrão `main`. As próximas execuções de CI ficam disponíveis na [página de Actions](https://github.com/Neitolas/portfolio-nathan/actions).
- O pacote REA original não foi modificado; seus testes de instalação Windows/Linux não fazem parte da validação deste novo site.
