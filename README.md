# Vistoria — Estação Nogueira II

App instalável (PWA) para a vistoria de entrega das chaves de um apartamento com garden no empreendimento Estação Nogueira II (Petrópolis/RJ).

**Abrir / instalar:** https://stuart-alt.github.io/estacao-nogueira/

O app tem cinco telas:

- **O que vem:** o que deve ser entregue e por quem (Construtora, DKZA ou por sua conta), com a cláusula ou o quadro do memorial de origem.
- **Vistoria:** checklist por ambiente, com OK / Defeito / N.A., anotação e as ferramentas de cada item.
- **Ferramentas:** o que levar no dia e para que serve cada uma.
- **Laudo:** relatório só com os defeitos, para compartilhar (WhatsApp, e-mail) ou imprimir/salvar em PDF.
- **Início:** progresso e lembretes de prazos e obrigações.

## Instalar no celular

- **Android (Chrome):** abra o link, toque em ⋮ e depois em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

Depois de instalado, o app abre mesmo sem internet.

## Privacidade

As marcações e anotações ficam **só no seu aparelho** (armazenamento local do navegador). Não há servidor e nada é enviado, exceto quando você compartilha o laudo. Limpar os dados do navegador apaga a vistoria.

Este repositório é público e **não contém documentos pessoais**. Os contratos ficam fora do Git (veja o `.gitignore`).

## Desenvolvimento

- Sem build e sem dependências: HTML, CSS e JavaScript (ES modules).
- O conteúdo (itens, checklist, ferramentas, lembretes) fica em `js/data.js`. Os ids dos itens são estáveis; não renomeie um id já usado, ou a marcação feita nele se perde.
- Para rodar os testes (Node 20 ou mais recente): `npm test`.
- Para rodar localmente: `npx http-server -c-1 .` e abra `http://localhost:8080/`.
- **A cada publicação, incremente `CACHE` em `sw.js`** (ex.: `en2-v2`) para os celulares receberem a versão nova.
