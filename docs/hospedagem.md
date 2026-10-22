# Hospedagem gratuita e versionamento

Opções consultadas em **22/10/2026** em documentação oficial. O código fica versionado no GitHub, independentemente de onde o site for hospedado. Não foi configurado deploy de site nesta entrega; o pedido atual é publicar o repositório e sugerir provedores.

| Opção | Integração com versões | Adequação ao portfólio |
| --- | --- | --- |
| **Cloudflare Pages — recomendação** | Deploy por push; prévias por branch/commit e rollback de produção | Bom fluxo para revisar mudanças antes de publicar. Plano Free com até 500 builds/mês na documentação consultada |
| **GitHub Pages** | Código e deploy no mesmo serviço; build/publicação por GitHub Actions | Caminho simples para site estático em repositório público, disponível no GitHub Free. Voltar uma versão pode ser feito por revert/redeploy do commit desejado |
| **Vercel Hobby** | Integração Git e prévias automáticas de deploys | Adequado a portfólio pessoal. Plano Hobby restrito a uso pessoal não comercial |

Para Cloudflare/Vercel, importar `Neitolas/portfolio-nathan`, usar Node 24, build `npm run build`, saída `dist` e branch `main`. O lockfile permite instalação com `npm ci`. Domínio do provedor pode ser usado; domínio próprio não foi comprado nem configurado.

GitHub Pages exige configurar a fonte de publicação e um workflow que envie `dist`. O workflow `ci.yml` atual apenas valida. Não confundir a URL do repositório com a URL de um site hospedado.

## Fontes oficiais

- [GitHub Pages: disponibilidade e tipos de site](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Cloudflare Pages: integração Git](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Cloudflare Pages: previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Cloudflare Pages: rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- [Cloudflare Pages: limites](https://developers.cloudflare.com/pages/platform/limits/)
- [Vercel: integração Git](https://vercel.com/docs/git)
- [Vercel: plano Hobby](https://vercel.com/docs/plans/hobby)
