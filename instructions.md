# ⚽ Real Carioca FC — Site Oficial

Site estático hospedado no **GitHub Pages** (100% gratuito).  
Os jogos são gerenciados via **Google Sheets** — qualquer membro da diretoria pode adicionar ou editar jogos pelo celular, sem mexer no código.

---

## ⚽ Como gerenciar os jogos (Google Sheets)

### Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha
2. Renomeie a aba para **Jogos** (clique com botão direito na aba → Renomear)
3. Na **linha 1**, crie os seguintes cabeçalhos exatamente assim:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| data | hora | adversario | campo | endereco | status | placar_casa | placar_visit | observacao |

4. A partir da **linha 2**, preencha os jogos. Exemplo:

| data | hora | adversario | campo | endereco | status | placar_casa | placar_visit | observacao |
|------|------|-----------|-------|----------|--------|-------------|--------------|------------|
| 15/06/2024 | 10:00 | Unidos do Méier | Campo do Méier | Méier, RJ | realizado | 3 | 1 | Primeiro jogo! |
| 10/08/2024 | 08:00 | Penha United | Campo da Penha | Penha, RJ | agendado | | | |

**Regras de preenchimento:**
- `data` → formato **DD/MM/AAAA** (ex: 15/06/2024)
- `hora` → formato **HH:MM** (ex: 10:00)
- `status` → apenas: `agendado`, `realizado` ou `cancelado`
- `placar_casa` / `placar_visit` → somente números, deixe **vazio** se o jogo não foi realizado
- `observacao` → texto livre, opcional

---

### Passo 2 — Publicar a planilha

Para o site conseguir ler os dados, a planilha precisa ser pública:

1. No Google Sheets: **Arquivo → Compartilhar → Publicar na web**
2. Selecione a aba **Jogos** e formato **CSV**
3. Clique em **Publicar** e confirme
4. Feche essa janela (não precisa copiar o link daqui)

---

### Passo 3 — Conectar ao site

1. Copie o **ID** da sua planilha — ele fica na URL:
   ```
   https://docs.google.com/spreadsheets/d/ ► ESTE_É_O_ID ◄ /edit
   ```
2. Abra o arquivo `js/jogos.js`
3. Substitua `SEU_ID_DA_PLANILHA_AQUI` pelo ID copiado:
   ```javascript
   const SHEETS_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms";
   ```
4. Salve e faça commit no GitHub — o site já vai buscar os jogos!

---

### Como adicionar um novo jogo

Basta abrir a planilha e adicionar uma nova linha. O site atualiza em até **15 minutos** (cache automático). Para forçar a atualização imediata, clique no botão **"↻ Atualizar jogos"** que aparece na seção de agenda do site.

### Como registrar o placar de um jogo realizado

1. Abra a planilha
2. Mude a coluna `status` de `agendado` para `realizado`
3. Preencha `placar_casa` e `placar_visit` com os gols
4. Salve — o site atualiza automaticamente

---

## 🚀 Publicar no GitHub Pages

1. Crie um repositório no [github.com](https://github.com) (Public)
2. Faça upload de todos os arquivos
3. Vá em **Settings → Pages → Source: branch main → Save**
4. Seu site estará em: `https://SEU_USUARIO.github.io/real-carioca`

---

## 📧 Configurar formulário de desafios (Formspree)

1. Crie conta gratuita em [formspree.io](https://formspree.io)
2. Crie um novo form e copie o ID (ex: `xpwzgvkl`)
3. No `index.html`, substitua `SEU_ID_AQUI`:
   ```html
   action="https://formspree.io/f/xpwzgvkl"
   ```
Os desafios chegam por e-mail automaticamente. Plano gratuito: 50 envios/mês.

---

## 🖼️ Como adicionar fotos / galeria

Coloque as fotos na pasta `img/` e edite o array `FOTOS` em `js/jogos.js`:
```javascript
const FOTOS = [
  { src: "img/jogo1.jpg", legenda: "Primeiro jogo oficial" },
  { src: "img/festa.jpg", legenda: "Confraternização no condomínio" },
];
```

---

## 📁 Estrutura de arquivos

```
real-carioca/
├── index.html          ← página principal
├── css/style.css       ← estilos
├── js/
│   ├── jogos.js        ← configurações (SHEETS_ID, fotos)
│   └── main.js         ← lógica do site
└── img/
    ├── escudo.png      ← escudo do time
    └── ...             ← fotos
```

---

## 💰 Custos

| Serviço       | Custo   | Observação                        |
|--------------|---------|-----------------------------------|
| GitHub Pages | R$ 0,00 | Hospedagem gratuita               |
| Google Sheets| R$ 0,00 | Banco de dados gratuito           |
| Formspree    | R$ 0,00 | Até 50 formulários/mês            |
| Domínio      | Opcional| ~R$ 50/ano para domínio próprio   |
