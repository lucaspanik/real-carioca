/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           REAL CARIOCA FC — CONFIGURAÇÕES DO SITE           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  OS JOGOS AGORA VÊM DO GOOGLE SHEETS — não edite mais aqui!
 *
 *  Para adicionar um jogo: abra a planilha e preencha uma nova linha.
 *  O site atualiza sozinho.
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  CONFIGURAÇÃO OBRIGATÓRIA                               │
 *  │                                                         │
 *  │  1. Crie sua planilha seguindo o README.md              │
 *  │  2. Publique a planilha (Arquivo → Publicar na web)     │
 *  │  3. Copie o ID da URL da planilha:                      │
 *  │     docs.google.com/spreadsheets/d/ ► ID ◄ /edit       │
 *  │  4. Cole o ID abaixo em SHEETS_ID                       │
 *  └─────────────────────────────────────────────────────────┘
 */

// https://docs.google.com/spreadsheets/d/e/2PACX-1vQCBY9wDZbeiskD-Jxadz_mBHJkBQjeoaDCz81xoq4SEsZVDXv0mIwuq0uG-on6yX7v92Lg7UjsVRn4/pub?gid=0&single=true&output=csv

const SHEETS_ID = "1uYlVRbzDWqbf826vjgwvsqH-cdsfDcvTNeAyAgyUhgY";

// ─────────────────────────────────────────────────────────────────
//  FOTOS DA GALERIA (opcional)
//  Se quiser fotos fixas além do Instagram, adicione aqui.
//  Caso contrário, deixe o array vazio [].
// ─────────────────────────────────────────────────────────────────
const FOTOS = [
   { src: "img/01.jpg", legenda: "Campeonado aniversário do Max" },
   { src: "img/02.jpg", legenda: "Troféus do Campeonado aniversário do Max" },
   { src: "img/03.jpg", legenda: "Jogo contra em Mauá" },
];

// ─────────────────────────────────────────────────────────────────
//  CONFIGURAÇÕES GERAIS
// ─────────────────────────────────────────────────────────────────
const CONFIG = {
  nomeTime:  "Real Carioca FC",
  bairro:    "Bonsucesso",
  cidade:    "Rio de Janeiro",
  fundacao:  "2023",
  // Tempo de cache em minutos (evita requisições repetidas)
  cacheTTL:  15,
  jogosQuantidade: 20, // Quantos jogos mostrar no site
};
