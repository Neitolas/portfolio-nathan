# Decisões visuais e técnicas

- **Isolamento:** a pasta original é um pacote REA, sem Git nem aplicação web. O portfólio está separado em `portfolio-nathan/`; os instaladores e testes originais permanecem intactos.
- **Identidade:** grafite, superfícies discretas e acento índigo do briefing. Monograma NN, tipografia de sistema e diagramas autorais em CSS/SVG. Nenhum retrato ou aparência foi inventado. As figuras dos projetos são composições conceituais, não capturas de produtos em produção.
- **Página única:** início, projetos, experiência, sobre/formação e contato. Âncoras nativas funcionam no acesso direto sem configuração especial de rotas. Nenhuma migração para Next.js nem backend novo.
- **Vite + JavaScript nativo:** duas dependências de desenvolvimento (Vite e ESLint), nenhuma biblioteca no runtime. Não havia stack de site a preservar no workspace. A stack da referência não foi copiada por suposição.
- **HTML completo:** um hook `transformIndexHtml` do Vite insere conteúdo de `src/content.js` por `src/render.js` no desenvolvimento e no build. Conteúdo e navegação funcionam sem JavaScript no cliente; JS aprimora apenas menu móvel e filtros.
- **Conteúdo:** fontes e pendências em `fontes-perfil.md`. Sem métricas, certificados ou demo não comprovados. Prever recebe descrição pública resumida; não há leitura ou publicação de código corporativo.
- **Interação:** filtros com botões e `aria-pressed`, contagem em região de status, detalhes nativos por projeto, menu de divulgação com Escape e retorno de foco. Sem animação contínua, timers, paint, chat simulado ou formulário sem backend.
- **Acessibilidade:** hierarquia de títulos, landmarks, skip link, foco visível, navegação sem JS e respeito a movimento reduzido. Testes automatizados complementam inspeção visual, sem alegação de certificação WCAG.
- **Publicação:** assets relativos (`base: './'`) e âncoras independentes da hospedagem. Domínio, canonical, `og:url` e imagem social absoluta aguardam destino real. O build é estático; `vite preview` serve apenas à validação local.
- **Licença:** nenhum código ou asset do repositório de referência foi reutilizado; a consulta a `LICENSE` na raiz não estabeleceu autorização de reutilização.
- **Ambiente:** Node 24.20.0 e npm 11.19.0 no Windows. Sem WSL, Docker ou mudanças de sistema. `npm.cmd` ficou pendente no wrapper desta sessão; quando necessário, foi usada a CLI npm oficial via `node.exe`.
- **Catálogo ampliado:** 11 projetos e estudos, com categorias derivadas dos dados, rótulos de estágio real e painéis próprios. A arte de estacionamento ficou restrita ao cartão correspondente; os demais usam conteúdo visual do próprio projeto.
- **Retrato solicitado:** o efeito ASCII será baseado na foto correta do titular. A foto LinkedIn está bloqueada por cadastro e não foi obtida; o monograma é mantido enquanto essa entrada estiver ausente.
