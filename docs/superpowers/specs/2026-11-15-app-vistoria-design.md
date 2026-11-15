# App de Vistoria — Estação Nogueira II (design)

Data: 2026-11-15 · Status: aprovado em conversa, aguardando revisão do spec

## 1. Objetivo

Um app instalável pelo celular, via URL e sem loja de aplicativos, para usar na entrega das chaves de um apartamento "de meio com garden" do Estação Nogueira II. O app:

1. resume **o que deve ser entregue e por quem** (Construtora/Incorporadora, DKZA ou por conta do comprador);
2. guia a **vistoria** por ambiente, com marcação OK / Defeito / N.A. e anotação por item;
3. lista as **ferramentas** necessárias e o uso de cada uma;
4. gera um **laudo** com os defeitos, para compartilhar e imprimir.

Sucesso = o comprador consegue, só com o celular, conferir cada item na vistoria, saber se a cobrança é da construtora ou da DKZA, e sair com um laudo pronto para anexar ao termo de vistoria (promessa, cl. 11ª §4).

## 2. Restrições

- **Privacidade:** o repositório e o site são públicos. Não entram no repositório nem no app: documentos (PDF/JPEG), nome, CPF, renda, valores pagos, número de contrato, conta bancária, número da unidade. O `.gitignore` exclui `contratos/`, `servicos/`, `*.pdf`, `*.jpg` e `*.jpeg`.
- **Hospedagem:** GitHub Pages em `stuart-alt/estacao-nogueira`, branch `main`, raiz. URL: `https://stuart-alt.github.io/estacao-nogueira/`. O repositório precisa estar **público**; hoje está privado e vazio, e o dono troca a visibilidade.
- **Sem build e sem dependências em tempo de execução:** HTML, CSS e JS (ES modules) estáticos.
- **Sem servidor:** o estado fica só no aparelho (`localStorage`). Nada sai do aparelho, exceto o laudo que o usuário decide compartilhar.
- **Instalável:** `manifest.webmanifest`, ícones de 192 e 512 px e um service worker mínimo que faz cache dos arquivos do app. O offline completo não é requisito, mas o cache do shell vem de graça.
- **Mobile first:** largura de 360 px, alvos de toque de pelo menos 44 px, tema claro e escuro.

## 3. Fora do escopo (YAGNI)

Fotos por item, múltiplas rodadas de vistoria, sincronização entre aparelhos, login, backend, publicação dos documentos.

## 4. Arquitetura

```
index.html              shell + abas inferiores
manifest.webmanifest
sw.js                   cache do shell (network-first com fallback ao cache, versão no nome do cache)
icons/icon-192.png, icon-512.png, icon.svg
css/app.css
js/data.js              CONTEÚDO (somente dados, sem lógica)
js/state.js             estado puro: carregar/salvar/atualizar/progresso
js/report.js            puro: estado + dados -> texto do laudo
js/app.js               renderização, eventos e roteamento por hash
tests/state.test.mjs    node:test
tests/report.test.mjs   node:test
tests/data.test.mjs     integridade do conteúdo (ids únicos, campos obrigatórios)
```

Fronteiras:
- `data.js` só exporta constantes. Editar o conteúdo não exige mexer em lógica.
- `state.js` e `report.js` são funções puras, sem DOM e sem `localStorage` direto. O armazenamento entra como parâmetro (`storage` com `getItem`/`setItem`), o que permite testar no Node.
- `app.js` é a única camada que toca o DOM.

### Modelo de dados (`data.js`)

```js
export const SOURCES = { construtora, dkza, comprador }   // rótulo + cor
export const DELIVERY = [ { category, items: [ { id, text, source, ref, note? } ] } ]
export const CHECKLIST = [ { id, room, items: [ { id, what, how, source, tools?: [toolId] } ] } ]
export const TOOLS = [ { id, name, use, essential: bool } ]
export const REMINDERS = [ { id, title, detail, ref } ]
```

`ref` cita a origem: "Memorial Quadro VI", "Memorial Quadro VII", "Promessa cl. 11ª §4", "Contrato CEF cl. 37.2", "Pedidos DKZA" etc.

### Estado (`localStorage`, chave `en2-vistoria-v1`)

```js
{ version: 1, items: { [itemId]: { status: 'ok'|'defeito'|'na', note: string, updatedAt: ISO } }, startedAt: ISO }
```

- Um JSON corrompido ou de versão desconhecida é tratado como estado vazio, sem quebrar o app.
- Se `localStorage` não estiver disponível (exceção), o app funciona em memória e mostra o aviso "não será salvo".

### Laudo (`report.js`)

`buildReport(state, data, date) -> string` em texto puro:

- cabeçalho com empreendimento, data e totais;
- defeitos agrupados por ambiente, cada um com descrição, anotação e responsável (Construtora ou DKZA);
- itens pendentes (não verificados), em resumo;
- linha final lembrando que a construtora corrige "por força da garantia obrigatória" (cl. 11ª §4) e que a DKZA responde pelos itens dela.

Ações:
- **Compartilhar:** `navigator.share({ text })`. Sem suporte, copia para a área de transferência e avisa.
- **Imprimir/PDF:** abre a visão do laudo com CSS de impressão e chama `window.print()`.

## 5. Telas

1. **Início:** barra de progresso (verificados/total), contagem de defeitos, cartões de lembretes (`REMINDERS`), atalhos para Vistoria e Laudo.
2. **O que vem:** acordeão por categoria. Cada item tem um selo colorido de origem. Há um filtro por origem (Todos / Construtora / DKZA / Por sua conta).
3. **Vistoria:** lista de ambientes com progresso por ambiente. Ao tocar no ambiente, aparecem os itens, cada um com "o que", "como verificar", ferramentas, selo de responsável, botões OK / Defeito / N.A. e uma anotação que se expande ao marcar Defeito. O primeiro "ambiente" é **Documentos a receber**.
4. **Ferramentas:** lista com essenciais primeiro e para que serve cada uma.
5. **Laudo:** pré-visualização do texto, botões Compartilhar e Imprimir, e "Zerar vistoria" com confirmação.

Roteamento por hash (`#/inicio`, `#/entrega`, `#/vistoria`, `#/vistoria/<roomId>`, `#/ferramentas`, `#/laudo`), para o botão voltar do Android funcionar.

## 6. Conteúdo (fonte: documentos analisados)

### 6.1 O que vem — Construtora (Memorial Descritivo, Quadros VI e VII)
- **Elétrica:** quadro de disjuntores padrão DIN (Lorenzetti, Eletromar ou Siemens); fiação PVC 450/750 V (Megatron, Elofios ou Sig) conforme projeto; tomadas e interruptores Iluminim, Tramontina ou Alumbra, linha branca ou bege; eletrodutos de PVC flexível.
- **Iluminação:** apenas pontos de luz com fiação. Luminárias e lâmpadas não constam (comprador).
- **Hidráulica:** tubos Tigre, Fortlev ou Amanco; registros Docol, Fabrimar ou Deca. Água com medição coletiva (hidrômetros individuais depois, pelo condomínio, conforme a convenção).
- **Gás:** central GLP com cilindros (Supergasbras, Minasgás ou Ultragaz); tubulação de aço ou multicamada.
- **Esquadrias:** externas em alumínio anodizado branco (Alumasa, Ibrap ou Unicasa); internas de madeira pintada (Sulportas, Slink ou Eucatex); vidro comum liso.
- **Ferragens:** fechaduras Stam, Haga ou Aliança, cromadas, de alavanca; tipo tranqueta no banheiro.
- **Louças:** bacia com caixa acoplada e cuba de embutir em porcelana (Fiori, Icasa ou Logasa); tanque de mármore sintético sem coluna.
- **Metais:** cuba inox nº 1 (Tramontina, Tecnocuba ou Franke); torneira cromada (Japi, Esteves ou Imperatriz); sifão de PVC.
- **Sala:** piso laminado (Duraflor, Eucaflor ou Floorest), rodapé laminado, soleira de granito, paredes e teto em gesso liso com pintura, peitoril de granito.
- **Quartos e circulação:** piso e rodapé laminados, paredes e teto em gesso com pintura, peitoril de granito.
- **Banheiros:** piso e paredes em cerâmica esmaltada (Ceral, Incefra ou Eliane), soleira de granito, teto em gesso liso ou rebaixo com pintura.
- **Cozinha e área de serviço:** piso e paredes em cerâmica, soleira de granito, teto em gesso com pintura, bancada de granito (substituída pela DKZA).
- **Varanda:** piso cerâmico, rodapé cerâmico, paredes com textura, teto em gesso com pintura.
- **Garden:** grama natural e cerca viva (substituídos pela DKZA).
- **Entrega:** chaves, certidão do Habite-se e Manual do Proprietário (promessa cl. 11ª §4–5; CEF cl. 37.1-m); carnê do IPTU, se disponível (cl. 11ª §12).

### 6.2 O que vem — DKZA (pedidos e contrato de serviços DKZA); prazo: "junto com a entrega das chaves"
- **Garden:** 2 muros de divisa com os vizinhos, muro de divisa com o estacionamento, contrapiso, piso porcelanato até 0,75 × 0,75 (mão de obra), ponto de tomada, torneira no muro, 2 pontos de água e esgoto.
- **Cozinha:** remoção da parede (conceito aberto); tomada da bancada passando de 110 V para 220 V (cooktop de indução); bancada de quartzito Branco Estrelar até o tanque (até 3,20 m); peitoril de janela e soleira da porta de entrada em quartzito.
- **Aquecimento:** pontos de aquecedor a gás nos chuveiros social e suíte, sem aparelho.
- **Gás:** kit de medição do fogão.
- **Banheiros:** 2 boxes de vidro temperado 8 mm de correr com ferragem preta; 2 divisórias de box em pedra (Branco Pitaya); soleiras e bancadas em Branco Pitaya (suíte com 1,20 m; social com extensão sobre o vaso, até 1,45 m), com frontão de 15 cm.
- **Entrega:** Manual de Uso e Operação da DKZA, com prazos de garantia.

### 6.3 Por conta do comprador
Luminárias e lâmpadas, chuveiros e aquecedores (aparelhos), espelhos, armários, ar-condicionado (a convenção proíbe alterar a fachada), ligações definitivas de luz e gás e medidores individuais (promessa cl. 17ª, parágrafo único), averbação do Habite-se (cl. 11ª §9), transferências de titularidade em até 90 dias.

### 6.4 Lembretes (Início)
- O laudo de vistoria deve ser assinado; só o que constar nele será corrigido pela garantia (cl. 11ª §4).
- Em até 90 dias após as chaves, transferir titularidade de IPTU, condomínio e concessionárias e protocolar o comprovante na incorporadora, sob multa de R$ 500/dia (cl. 11ª §2).
- Averbar o Habite-se na matrícula, por conta do comprador (cl. 11ª §5a e §9).
- Taxa provisória de condomínio: 25% do salário mínimo até a 1ª assembleia (cl. 11ª §10).
- Pedir à construtora e à DKZA documento (projeto as-built ou ART) que comprove que a parede removida da cozinha não é estrutural (CEF cl. 23).
- Desempenho mínimo NBR 15.575 e vícios de construção: responsabilidade da construtora (CEF cl. 37.2).
- Prazo da obra: 36 meses após o contrato CEF, mais tolerância; se o atraso passar de 6 meses, os encargos da CEF passam a ser pagos pela construtora (CEF cl. 3.11 e 25).
- O termo de consentimento DKZA cita o número da unidade incompleto; pedir correção.

### 6.5 Checklist (ambientes)
- **Documentos a receber:** chaves (todas as cópias e controles), Habite-se, Manual do Proprietário, Manual DKZA, carnê do IPTU, comprovante as-built/ART da parede.
- **Geral / instalações:** quadro de distribuição (disjuntores identificados, DR/DPS se houver, aperto), todas as tomadas (tensão e polaridade com testador), tomada 220 V da bancada, interruptores, pontos de luz (com lâmpada de teste), campainha e interfone, se houver; pressão e vazão de água em todos os pontos, registros gerais, ausência de vazamentos; ponto de gás do fogão e kit de medição; pontos de aquecedor a gás; teste de ralos com balde.
- **Por ambiente** (Sala, Quarto, Suíte, Circulação, Banheiro social, Banheiro suíte, Cozinha e área de serviço, Varanda, Garden): piso (nível, peças ocas no teste do martelo de borracha, trincas, lascas, juntas e rejunte, caimento para ralos nas áreas molhadas), rodapés, paredes (prumo, esquadro, fissuras, manchas, umidade, pintura uniforme), teto (fissuras, manchas, acabamento do gesso), portas (abertura e fechamento, folgas, fechadura, chave, batente, prumo), janelas (correr, travar, vedação, vidros sem riscos, borrachas, teste de água), soleiras, peitoris e bancadas (nivelamento, rejunte e silicone, lascas, caimento), louças e metais (fixação, vazamentos, descarga, sifão), box (vidro, ferragem preta, correr, vedação), revestimentos cerâmicos (som cavo, alinhamento, recortes).
- **Garden:** muros (prumo, acabamento, trincas), contrapiso e porcelanato (caimento, drenagem, som cavo), torneira, tomada externa (protegida), pontos de água e esgoto.

### 6.6 Ferramentas
Essenciais: testador de tomada com indicação de tensão (ou multímetro), lâmpada de teste com bocal adaptador (ou soquete com lâmpada), trena de 5 m, nível de bolha de 60 cm ou mais, martelo de borracha (ou cabo de chave de fenda) para piso oco, balde ou garrafa de 2 L para testar ralos e caimento, lanterna, carregador de celular com USB (para testar tomadas), fita crepe e caneta para marcar defeitos, celular para fotos.
Úteis: nível a laser ou prumo de pedreiro, esquadro grande, régua de alumínio de 2 m (planicidade), detector de tensão sem contato, papel toalha, escada pequena.

## 7. Erros e casos-limite

- `localStorage` indisponível ou cheio: aviso e operação em memória.
- `navigator.share` ausente: cópia para a área de transferência; se também falhar, o texto fica selecionável.
- Atualização do app: o service worker usa cache versionado; uma versão nova apaga o cache antigo no `activate`. O conteúdo (`data.js`) muda sem perder as marcações, pois os ids são estáveis. Ids removidos são ignorados no laudo.

## 8. Testes

- `node --test tests/`:
  - estado: carregar vazio/corrompido, definir status, anotação e progresso;
  - laudo: só defeitos, agrupamento por ambiente, responsável, pendentes, estado vazio;
  - dados: ids únicos, campos obrigatórios, `source` válido, `tools` referenciando ferramentas existentes.
- Conferência manual num navegador a 360 px: abas, marcação persistindo após recarregar, laudo, impressão.
- Após publicar: a URL do Pages carrega, o manifest é válido e o service worker fica registrado.

## 9. Publicação

1. `git init` na raiz; o `.gitignore` já exclui os documentos; conferir com `git status` que nenhum PDF ou JPEG entra.
2. Commit e push para `main` em `stuart-alt/estacao-nogueira`.
3. O dono torna o repositório público e ativa o Pages (Settings → Pages → Deploy from branch → `main` / root).
4. Instalação: Android/Chrome → menu → "Instalar app"/"Adicionar à tela inicial"; iPhone/Safari → Compartilhar → "Adicionar à Tela de Início".
