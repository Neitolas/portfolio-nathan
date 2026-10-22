# Retrato ASCII

O titular forneceu a fotografia `1708200412422.jpg` em **22/10/2026** e autorizou usá-la para o retrato em texto. O arquivo de 400 × 400 px foi visualizado antes da conversão. A imagem não foi obtida do LinkedIn, que havia exigido cadastro nas tentativas anteriores.

## Conversão

`scripts/Gerar-Retrato.ps1` usa System.Drawing do Windows para reduzir a foto a **110 colunas e 61 linhas**, compensando a proporção dos caracteres monoespaçados. A luminância é convertida em dez níveis usando a sequência ` .:-=+*#%@`, com ajuste de contraste e tons intermediários.

O resultado fica em `src/portrait.js`: dimensões, hash SHA256 do arquivo de origem e texto. Não há síntese de aparência ou uso do retrato da referência. A fotografia original permanece fora do repositório; seus metadados não são copiados para o site.

Para gerar novamente, abra PowerShell na raiz do projeto com a sua foto disponível:

```powershell
$geradorRetrato = Get-Content -LiteralPath .\scripts\Gerar-Retrato.ps1 -Raw -Encoding UTF8
& ([scriptblock]::Create($geradorRetrato)) -Imagem 'CAMINHO_DA_SUA_FOTO.jpg'
npm.cmd run build
```

Essa foi a forma executada nesta sessão, sem alterar a política de execução de scripts do computador. O gerador é uma ferramenta local para Windows; o site gerado é estático e não precisa de PowerShell ou da fotografia original.

## Renderização e acessibilidade

O Vite insere os caracteres no HTML por `src/render.js`, escapando o conteúdo. Uma figura com nome acessível descreve o retrato de Nathan; o `pre` com milhares de caracteres tem `aria-hidden="true"` para evitar leitura individual dos símbolos. O retrato funciona com JavaScript desativado e não faz requisição de imagem nem consulta ao LinkedIn.

O tamanho da fonte acompanha a largura do quadro. A verificação de navegador confirma que o texto permanece inteiro, sem colidir com as legendas em 360, 768 e 1440 px. Não há animação contínua; o modo de movimento reduzido mantém a mesma apresentação.

Fontes e autorização: `evidencias/retrato-fontes.json`. Resultados do navegador: `evidencias/retrato-browser.json`. Captura em celular: `evidencias/retrato-360.png`.
