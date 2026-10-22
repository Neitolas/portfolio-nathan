# Retrato ASCII

O titular forneceu a fotografia `1708200412422.jpg` em **22/10/2026** e autorizou usá-la para o retrato em texto. O arquivo de 400 × 400 px foi visualizado antes da conversão. A imagem não foi obtida do LinkedIn, que havia exigido cadastro nas tentativas anteriores.

## Conversão

`scripts/Gerar-Retrato.ps1` usa System.Drawing do Windows para reduzir a foto a **160 colunas e 88 linhas**, compensando a proporção dos caracteres monoespaçados. A luminância é convertida em dez níveis usando a sequência ` .:-=+*#%@`, com ajuste de contraste e tons intermediários. Um contorno manual específico desta fotografia preserva cabelo, rosto e paletó e transforma o cenário externo em espaços. Para usar outra foto, o contorno no gerador precisa ser ajustado.

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

O tamanho da fonte acompanha a largura do quadro. A altura das linhas considera as 160 colunas e 88 linhas e a largura dos caracteres, para o bloco acompanhar a mesma proporção quadrada da foto e da borda, com margem interna uniforme. Os caracteres usam lavanda claro sobre preto puro, com contorno branco e sem legendas visíveis. A verificação de navegador confirma o conteúdo inteiro e a proporção em 360, 768 e 1440 px. O retrato é estático; as animações de fundo e cursor respeitam movimento reduzido.

Fontes e autorização: `evidencias/retrato-fontes.json`. Resultados do navegador: `evidencias/retrato-browser.json`. Captura em celular: `evidencias/retrato-360.png`.
