# App de Vistoria (PWA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA estático, instalável por URL, com resumo do que é entregue e por quem, checklist de vistoria com OK/Defeito/N.A. e anotação, ferramentas e geração de laudo.

**Architecture:** HTML/CSS/JS (ES modules) sem build, servido pelo GitHub Pages na raiz da branch `main`. O conteúdo fica isolado em `js/data.js`. Estado e laudo são módulos puros testados com `node:test`. `js/app.js` é a única camada que toca o DOM. O estado fica no `localStorage`.

**Tech Stack:** HTML5, CSS, JavaScript ES2022 modules, Web App Manifest, Service Worker, Node 24 (`node --test`) apenas para testes.

**Spec:** `docs/superpowers/specs/2026-11-15-app-vistoria-design.md`

## Global Constraints

- Zero dependências de runtime e zero build; `package.json` só com `"type": "module"` e o script `"test": "node --test tests/"`.
- Nada de dados pessoais no repositório ou no app: nome, CPF, renda, valores pagos, número de contrato, conta bancária, número da unidade. Pode citar empreendimento, cláusulas e marcas.
- Nenhum PDF/JPEG commitado; antes de cada commit, `git status` não pode listar `contratos/`, `servicos/`, `*.pdf`, `*.jpg` nem `*.jpeg`.
- Textos da interface em português do Brasil.
- Mobile first: funcionar a 360 px de largura sem scroll horizontal; alvos de toque ≥ 44 px; tema claro e escuro via `prefers-color-scheme`.
- Chave do `localStorage`: `en2-vistoria-v1`; formato do estado `{ version: 1, startedAt: ISO, items: { [id]: { status: 'ok'|'defeito'|'na', note: string, updatedAt: ISO } } }`.
- Todos os caminhos são relativos (`./`), pois o site é servido em `/estacao-nogueira/`.
- Origens válidas (`source`): `construtora`, `dkza`, `comprador`.

## Review Focus

1. `localStorage` com JSON corrompido ou `version` diferente de 1: o app abre com estado vazio, sem tela branca (teste em `state.test.mjs`).
2. `localStorage` que lança exceção (modo privado/cota): `loadState` devolve vazio e `saveState` devolve `false`, sem lançar; a UI mostra o aviso "não será salvo" (teste em `state.test.mjs`).
3. Estado com id que não existe mais em `data.js` (conteúdo editado depois): o laudo e o progresso ignoram o id (testes em `report.test.mjs` e `state.test.mjs`).
4. Anotação com quebras de linha ou espaços apenas: o laudo preserva o texto com recuo e omite anotações em branco (teste em `report.test.mjs`).
5. Item marcado como Defeito e depois como OK: some do laudo e a anotação é mantida no estado (teste em `state.test.mjs`).

---

### Task 1: Conteúdo (`js/data.js`) e teste de integridade

**Files:**
- Create: `package.json`, `js/data.js`, `tests/data.test.mjs`

**Interfaces:**
- Produces (exports de `js/data.js`):
  - `SOURCES: { construtora: {label:'Construtora', short:'Construtora'}, dkza: {label:'DKZA', short:'DKZA'}, comprador: {label:'Por sua conta', short:'Você'} }`
  - `DELIVERY: Array<{ id: string, category: string, items: Array<{ id: string, text: string, source: SourceKey, ref: string, note?: string }> }>`
  - `CHECKLIST: Array<{ id: string, room: string, items: Array<{ id: string, what: string, how: string, source: SourceKey, tools?: string[] }> }>`
  - `TOOLS: Array<{ id: string, name: string, use: string, essential: boolean }>`
  - `REMINDERS: Array<{ id: string, title: string, detail: string, ref: string }>`
  - `ALL_CHECK_ITEMS: Array<item & { roomId: string, room: string }>`, a lista achatada de CHECKLIST, derivada no próprio módulo.
  - `PROJECT = { name: 'Estação Nogueira II', subtitle: 'Vistoria de entrega — apartamento com garden' }`

- [ ] **Step 1: Write the failing test** `tests/data.test.mjs` com `node:test` e `node:assert/strict`:
  - `ids únicos`: todos os ids de `DELIVERY` (categorias e itens), `CHECKLIST` (salas e itens), `TOOLS` e `REMINDERS` são únicos dentro de cada coleção; ids de itens do checklist são únicos globalmente.
  - `campos obrigatórios`: cada item de DELIVERY tem `text`, `source` e `ref` não vazios; cada item do CHECKLIST tem `what`, `how` e `source` não vazios.
  - `source válido`: todo `source` está em `Object.keys(SOURCES)`.
  - `tools existem`: todo id em `item.tools` existe em `TOOLS`.
  - `primeira sala é documentos`: `CHECKLIST[0].id === 'documentos'`.
  - `salas obrigatórias`: os ids de CHECKLIST incluem `documentos, instalacoes, sala, quarto, suite, circulacao, banheiro-social, banheiro-suite, cozinha, varanda, garden`.
  - `ferramentas essenciais`: `TOOLS.filter(t=>t.essential).length >= 10`.
  - `sem dados pessoais`: `JSON.stringify` de todos os exports não casa com `/\d{3}\.\d{3}\.\d{3}-\d{2}/` (CPF) nem `/R\$\s?\d{1,3}(\.\d{3})+,\d{2}/` (valores em reais com milhar), nem com nenhum termo do arquivo local `tests/private-terms.local.json` (fora do Git; contém nome, unidade e números pessoais). A exceção permitida é `R$ 500` (multa), que não casa com o padrão.
  - `ALL_CHECK_ITEMS` tem o tamanho da soma dos itens e cada elemento tem `roomId`.

- [ ] **Step 2: Run** `node --test tests/` e confirmar que FALHA (módulo inexistente).

- [ ] **Step 3: Implement `package.json` e `js/data.js`.** O conteúdo vem integralmente do spec, seções 6.1–6.6:
  - DELIVERY: uma categoria por tópico do 6.1, com `source:'construtora'` e `ref` "Memorial Quadro VI" (equipamentos) ou "Memorial Quadro VII" (acabamentos); a categoria "Entrega de documentos" usa ref "Promessa cl. 11ª §4–5 / CEF cl. 37.1-m". Uma categoria "DKZA" por grupo do 6.2 (Garden, Cozinha, Aquecimento e gás, Banheiros, Manual), com `source:'dkza'` e ref "Pedidos DKZA — entrega junto com as chaves". A categoria "Por sua conta" vem do 6.3, com `source:'comprador'` e refs "Memorial (não consta)", "Promessa cl. 17ª par. único", "Promessa cl. 11ª §2/§9" e "Convenção — fachada". Itens substituídos pela DKZA (bancada de granito da cozinha, grama e cerca viva do garden, soleiras e peitoris de granito) recebem `note: 'Substituído pela DKZA'`.
  - REMINDERS: os 8 bullets do 6.4, cada um com seu `ref`.
  - CHECKLIST: as salas listadas no teste. Em `documentos`, os 6 itens do 6.5. Em `instalacoes`, os itens elétricos, hidráulicos e de gás do 6.5, um por ponto verificável (quadro, tomadas, tomada 220 V da bancada, interruptores, pontos de luz, pressão e vazão de água, registros, vazamentos, ponto de gás do fogão, kit de medição, pontos de aquecedor, ralos). Nos ambientes, um item por elemento aplicável ao cômodo (piso, rodapé, paredes, teto, porta, janela, soleira, peitoril, bancada, louças, metais, box, revestimento cerâmico), com `how` concreto (ex.: piso → "Bata com o martelo de borracha a cada peça; som oco = peça solta. Confira trincas, lascas, rejunte e nível."). `source` é `dkza` para os itens da 6.2 (box, bancadas de pedra, garden, parede da cozinha, tomada 220 V, pontos de aquecedor, kit de medição); o resto é `construtora`. `tools` aponta para os ids de TOOLS.
  - TOOLS: as listas do 6.6. ids em kebab-case: `testador-tomada, lampada-teste, trena, nivel-bolha, martelo-borracha, balde, lanterna, carregador-usb, fita-crepe, celular, nivel-laser, esquadro, regua-2m, detector-tensao, papel-toalha, escada`.

- [ ] **Step 4: Run** `node --test tests/` e confirmar que PASSA.

- [ ] **Step 5: Commit** com `git add package.json js/data.js tests/data.test.mjs`, depois `git status` (nenhum documento listado), depois `git commit -m "feat: conteúdo da vistoria e teste de integridade"`.

---

### Task 2: Estado (`js/state.js`)

**Files:**
- Create: `js/state.js`, `tests/state.test.mjs`

**Interfaces:**
- Consumes: `ALL_CHECK_ITEMS` de `js/data.js` (só nos testes e no `progress`, recebido por parâmetro).
- Produces:
  - `STORAGE_KEY = 'en2-vistoria-v1'`
  - `emptyState(now = new Date()): State`
  - `loadState(storage): State`: nunca lança; devolve `emptyState()` se o storage lançar, se a chave faltar, se o JSON for inválido ou se `version !== 1`.
  - `saveState(storage, state): boolean`: `false` se o storage lançar.
  - `setStatus(state, id, status, now = new Date()): State`: imutável; `status` ∈ `'ok'|'defeito'|'na'|null` (`null` limpa o status e mantém a nota se existir; com nota vazia, remove a entrada).
  - `setNote(state, id, note, now = new Date()): State`: imutável; mantém o status.
  - `progress(state, items): { total, done, ok, defeito, na }`: conta só os ids presentes em `items`.
  - `roomProgress(state, room): { total, done, defeito }` para `room = CHECKLIST[i]`.

- [ ] **Step 1: Write failing tests** em `tests/state.test.mjs`, com um storage fake `{ getItem, setItem }` em memória e um que lança em ambos:
  - `loadState vazio` → `items` = `{}`, `version` = 1.
  - `loadState JSON inválido` (`'{x'`) → vazio.
  - `loadState version 2` → vazio.
  - `loadState storage que lança` → vazio, sem exceção.
  - `saveState storage que lança` → `false`; com storage ok → `true` e `getItem(STORAGE_KEY)` reabre igual via `loadState`.
  - `setStatus não muta` o objeto original; `items.x.status === 'defeito'` e `updatedAt` é ISO.
  - `defeito → ok mantém a nota`: `setNote` com 'trinca', depois `setStatus 'ok'` → `note === 'trinca'`, `status === 'ok'`.
  - `setStatus null sem nota remove a entrada`.
  - `progress ignora id órfão`: o estado tem `'nao-existe'` e um id real com `defeito` → `{ total: items.length, done: 1, defeito: 1 }`.
  - `roomProgress` de `CHECKLIST[0]` após marcar 2 itens → `done === 2`.

- [ ] **Step 2: Run** `node --test tests/` → as novas FALHAM.
- [ ] **Step 3: Implement** `js/state.js` com as assinaturas acima.
- [ ] **Step 4: Run** `node --test tests/` → tudo PASSA.
- [ ] **Step 5: Commit** com a mensagem `"feat: estado da vistoria com persistência tolerante a falhas"`.

---

### Task 3: Laudo (`js/report.js`)

**Files:**
- Create: `js/report.js`, `tests/report.test.mjs`

**Interfaces:**
- Consumes: `CHECKLIST`, `SOURCES`, `PROJECT` de `js/data.js` (por parâmetro `data = { CHECKLIST, SOURCES, PROJECT }`); `progress` de `js/state.js`.
- Produces: `buildReport(state, data, date = new Date()): string`.

Formato fixo (texto puro, `\n`):
```
LAUDO DE VISTORIA — {PROJECT.name}
Data: {dd/mm/aaaa}
Verificados: {done}/{total} · Defeitos: {defeito} · Pendentes: {total-done}

== {room} ==
[ ] {what} — Responsável: {SOURCES[source].label}
    Obs.: {linha 1 da nota}
          {linha 2 da nota}
...
PENDENTES (não verificados): {n} itens — {room}: {k}; {room}: {k}
---
Pendências a corrigir pela Construtora por força da garantia obrigatória (Promessa cl. 11ª §4) e pela DKZA conforme pedidos contratados.
```
- Só ambientes com pelo menos um defeito aparecem em "== room ==".
- Sem nenhum defeito, no lugar dos blocos aparece a linha `Nenhum defeito registrado.`
- Notas vazias ou só com espaços omitem a linha `Obs.:`.
- A linha PENDENTES só aparece se houver pendentes.

- [ ] **Step 1: Write failing tests** em `tests/report.test.mjs`:
  - `cabeçalho`: com a data `new Date(2028,11,5)`, o texto contém `Data: 05/12/2028` e `LAUDO DE VISTORIA — Estação Nogueira II`.
  - `só defeitos`: um item ok e um item defeito → contém o `what` do defeito, não contém o `what` do ok.
  - `agrupado por ambiente`: defeitos em duas salas → `indexOf('== Sala ==') < indexOf('== Cozinha ...')`, seguindo a ordem do CHECKLIST.
  - `responsável`: defeito em item `source:'dkza'` → contém `Responsável: DKZA`.
  - `nota multilinha` `'a\nb'` → contém `Obs.: a` e uma linha seguinte com `b` recuado; nota `'   '` → não contém `Obs.:`.
  - `estado vazio` → contém `Nenhum defeito registrado.` e `PENDENTES`.
  - `id órfão ignorado`: estado com `'nao-existe': defeito` → não lança e `Defeitos: 0`.
- [ ] **Step 2: Run** → FALHAM.
- [ ] **Step 3: Implement** `buildReport` em `js/report.js`.
- [ ] **Step 4: Run** `node --test tests/` → PASSA.
- [ ] **Step 5: Commit** com a mensagem `"feat: geração do laudo de vistoria"`.

---

### Task 4: Interface (`index.html`, `css/app.css`, `js/app.js`)

**Files:**
- Create: `index.html`, `css/app.css`, `js/app.js`

**Interfaces:**
- Consumes: todos os exports de `js/data.js`; `loadState`, `saveState`, `setStatus`, `setNote`, `progress`, `roomProgress`, `emptyState` de `js/state.js`; `buildReport` de `js/report.js`.
- Produces: `index.html` com `<main id="view">`, `<nav class="tabs">` (5 abas: Início `#/inicio`, O que vem `#/entrega`, Vistoria `#/vistoria`, Ferramentas `#/ferramentas`, Laudo `#/laudo`), `<link rel="manifest" href="./manifest.webmanifest">`, `<meta name="theme-color">` e `<script type="module" src="./js/app.js">`. A Task 5 depende desses três elementos do `<head>`.

- [ ] **Step 1: Implement `index.html` + `css/app.css`.**
  - Tokens de cor em `:root`, redefinidos em `@media (prefers-color-scheme: dark)`.
  - Abas fixas embaixo, com `padding-bottom: env(safe-area-inset-bottom)`.
  - Selos `.badge-construtora` (azul), `.badge-dkza` (laranja) e `.badge-comprador` (cinza).
  - Botões de status em grupo segmentado, com cores ok (verde), defeito (vermelho) e na (cinza) quando ativos.
  - `@media print`: esconde abas e botões e imprime só `#report`.
  - Gutter lateral de 16 px.

- [ ] **Step 2: Implement `js/app.js`.**
  - Roteador por `hashchange`; o padrão é `#/inicio`.
  - Funções `render<Tela>()` que montam HTML com escape de texto (`esc(s)` para `& < > " '`).
  - Estado em memória `let state = loadState(localStorage)`. A cada alteração: `state = setX(...)`, depois `const ok = saveState(localStorage, state)`, e se `!ok` mostra o banner fixo "Não foi possível salvar neste navegador — as marcações não serão guardadas." (uma vez).
  - O acesso a `localStorage` vai dentro de `try`; se o próprio acesso lançar, passa `null` e as funções tratam como storage que lança.
  - Telas conforme o spec, seção 5:
    - **Início:** progresso, defeitos e cartões REMINDERS.
    - **O que vem:** `<details>` por categoria, filtro por origem com 4 botões, `note` em itálico.
    - **Vistoria:** lista de salas com `done/total` e defeitos; `#/vistoria/<roomId>` mostra os itens com selo, `how`, nomes das ferramentas e botões OK/Defeito/N.A. (tocar no ativo limpa via `null`). O `<textarea>` aparece quando o status é defeito ou já existe nota e salva no `input` com debounce de 400 ms.
    - **Ferramentas:** essenciais primeiro.
    - **Laudo:** `<pre id="report">` com `buildReport`; botão **Compartilhar** → `navigator.share({ title, text })`; sem suporte ou em erro diferente de `AbortError`, chama `navigator.clipboard.writeText` e mostra o aviso "Laudo copiado"; se isso também falhar, seleciona o texto do `<pre>`. Botão **Imprimir / PDF** → `window.print()`. Botão **Zerar vistoria** → `confirm()`, depois `state = emptyState()` e salva.
  - Eventos por delegação no `#view` (`data-action`, `data-id`).

- [ ] **Step 3: Verify manually.** Rodar `npx --yes http-server -p 8080 -c-1 .` (ou `python -m http.server 8080`) e abrir `http://localhost:8080/` com viewport de 360 × 740. Conferir:
  - as 5 abas renderizam;
  - marcar Defeito com nota, recarregar a página e a marcação continua;
  - Defeito → OK tira o item do laudo;
  - o filtro por origem funciona;
  - não há scroll horizontal;
  - a pré-visualização de impressão mostra só o laudo;
  - não há erros no console.
- [ ] **Step 4: Run** `node --test tests/` → PASSA (regressão).
- [ ] **Step 5: Commit** com a mensagem `"feat: interface mobile do app de vistoria"`.

---

### Task 5: PWA instalável (manifest, ícones, service worker)

**Files:**
- Create: `manifest.webmanifest`, `sw.js`, `icons/icon.svg`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`
- Modify: `js/app.js` (registro do SW no final), `index.html` (`<link rel="apple-touch-icon" href="./icons/icon-192.png">`, `<link rel="icon" href="./icons/icon.svg">`)

**Interfaces:**
- Consumes: os arquivos das Tasks 1–4.
- Produces: o site instalável.

- [ ] **Step 1: Create `manifest.webmanifest`** com:
  - `name: "Vistoria Estação Nogueira II"`, `short_name: "Vistoria"`
  - `start_url: "./"`, `scope: "./"`, `display: "standalone"`, `lang: "pt-BR"`
  - `background_color` e `theme_color` iguais ao `--bg`/`--accent` do CSS
  - `icons`: 192, 512 e o maskable 512 com `"purpose":"maskable"`

- [ ] **Step 2: Create icons.** Escrever o `icon.svg` (prancheta com check, cor de destaque) e gerar os PNG a partir dele com Pillow (já disponível no scratchpad da sessão) ou desenhando com Pillow diretamente. No maskable, o conteúdo deve ficar dentro do círculo central de 80%.

- [ ] **Step 3: Create `sw.js`.**
  - `const CACHE = 'en2-v1'`.
  - Lista `ASSETS` com todos os arquivos do app (caminhos `./...`, incluindo `./` e `./index.html`).
  - `install`: `cache.addAll(ASSETS)` e `skipWaiting()`.
  - `activate`: apaga caches com nome diferente de `CACHE` e chama `clients.claim()`.
  - `fetch`: só GET da mesma origem; network-first com fallback para o cache, para que atualizações de conteúdo apareçam assim que houver rede.
  - Comentário no topo: "incrementar CACHE a cada release".

- [ ] **Step 4: Register.** No fim de `js/app.js`: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {})`.

- [ ] **Step 5: Verify.** Servir localmente e conferir no Chrome DevTools → Application:
  - o manifest não tem erros;
  - o SW está "activated";
  - em modo offline, recarregar ainda abre o app.

  Se Playwright/Chrome não estiverem disponíveis, conferir pelo menos que `manifest.webmanifest` é JSON válido (`node -e "JSON.parse(require('fs').readFileSync('manifest.webmanifest','utf8'))"`) e que todos os `ASSETS` existem no disco.

- [ ] **Step 6: Commit** com a mensagem `"feat: PWA instalável (manifest, ícones, service worker)"`.

---

### Task 6: README e publicação no GitHub Pages

**Files:**
- Create: `README.md`, `.nojekyll`

- [ ] **Step 1: Write `README.md`** com:
  - o que é o app;
  - o link `https://stuart-alt.github.io/estacao-nogueira/`;
  - como instalar no Android (Chrome → menu → Instalar app) e no iPhone (Safari → Compartilhar → Adicionar à Tela de Início);
  - o aviso de que as marcações ficam só no aparelho;
  - como editar o conteúdo (`js/data.js`) e rodar os testes (`npm test`);
  - "incrementar `CACHE` em `sw.js` a cada release".

  Nenhum dado pessoal.

- [ ] **Step 2: Final privacy check.**
  - `git ls-files` lista só `.gitignore .nojekyll README.md package.json index.html manifest.webmanifest sw.js css/ js/ icons/ tests/ docs/`.
  - `git grep -niE -f <termos de tests/private-terms.local.json>` não retorna nada.

- [ ] **Step 3: Commit** com a mensagem `"docs: README e configuração do Pages"`.

- [ ] **Step 4: Push.** `git remote add origin https://github.com/stuart-alt/estacao-nogueira.git`, depois `git push -u origin main`. A autenticação é feita pelo Git Credential Manager do usuário.

- [ ] **Step 5: Ask the owner to:**
  1. Settings → General → Danger Zone → Change visibility → **Public**.
  2. Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save.

  Após a confirmação, verificar com `curl -sI https://stuart-alt.github.io/estacao-nogueira/` (espera `200`) e `curl -s https://stuart-alt.github.io/estacao-nogueira/manifest.webmanifest` (JSON).
