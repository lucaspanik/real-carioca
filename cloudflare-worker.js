/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║       REAL CARIOCA FC — Cloudflare Worker                       ║
 * ║       Valida Turnstile server-side + repassa pro Web3Forms      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  COMO FAZER O DEPLOY (5 minutos):                               ║
 * ║                                                                  ║
 * ║  1. Acesse dash.cloudflare.com                                  ║
 * ║  2. Menu lateral: Workers & Pages → Create                      ║
 * ║  3. Clique em "Create Worker"                                   ║
 * ║  4. Dê o nome: real-carioca-form                                ║
 * ║  5. Clique em "Deploy"                                          ║
 * ║  6. Clique em "Edit code"                                       ║
 * ║  7. Apague o código padrão                                      ║
 * ║  8. Cole TODO o conteúdo deste arquivo                          ║
 * ║  9. Preencha as 3 variáveis de configuração abaixo              ║
 * ║  10. Clique em "Deploy"                                         ║
 * ║  11. Copie a URL do Worker (ex: real-carioca-form.SEU.workers.dev)
 * ║  12. Cole a URL no main.js em WORKER_URL                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── CONFIGURAÇÃO — preencha os 3 valores abaixo ──────────────────
const TURNSTILE_SECRET_KEY = "SUA_SECRET_KEY_DO_TURNSTILE";
// Encontre em: dash.cloudflare.com → Turnstile → seu site → Secret Key

const WEB3FORMS_ACCESS_KEY = "SEU_ACCESS_KEY_DO_WEB3FORMS";

const ALLOWED_ORIGIN = "https://lucaspanik.github.io";
// Só aceita requisições vindas do seu site
// ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {

    // Responde ao preflight CORS (requisição OPTIONS do browser)
    if (request.method === "OPTIONS") {
      return corsResponse(null, 204);
    }

    // Só aceita POST
    if (request.method !== "POST") {
      return corsResponse(JSON.stringify({ success: false, error: "Método não permitido" }), 405);
    }

    // Verifica origem da requisição
    const origin = request.headers.get("Origin") || "";
    if (!origin.startsWith(ALLOWED_ORIGIN)) {
      return corsResponse(JSON.stringify({ success: false, error: "Origem não autorizada" }), 403);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ success: false, error: "JSON inválido" }), 400);
    }

    const { turnstileToken, time, telefone, data, campo, mensagem } = body;

    // ── 1. Valida o token do Turnstile com a API da Cloudflare ──────
    if (!turnstileToken) {
      return corsResponse(JSON.stringify({ success: false, error: "Token de segurança ausente" }), 400);
    }

    const turnstileResp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret:   TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const turnstileResult = await turnstileResp.json();

    if (!turnstileResult.success) {
      return corsResponse(
        JSON.stringify({ success: false, error: "Verificação de segurança falhou. Tente novamente." }),
        403
      );
    }

    // ── 2. Token válido — repassa pro Web3Forms SEM o campo Turnstile
    const web3Resp = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject:    "⚽ Novo desafio para o Real Carioca FC!",
        time,
        telefone,
        data,
        campo:      campo    || "Não informado",
        mensagem:   mensagem || "Sem mensagem",
      }),
    });

    const web3Result = await web3Resp.json();

    if (web3Result.success) {
      return corsResponse(JSON.stringify({ success: true }), 200);
    } else {
      return corsResponse(
        JSON.stringify({ success: false, error: "Erro ao enviar. Tente novamente." }),
        500
      );
    }
  },
};

// Helper — adiciona headers CORS em todas as respostas
function corsResponse(body, status) {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  return new Response(body, { status, headers });
}
