export default {
  async fetch(request) {

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/|\/$/g, "")

    // =========================
    // 🔐 TOKENS
    // =========================
    const TOKENS = ["SEU_TOKEN", "VIP_123"]

    const token = url.searchParams.get("token")
    if (!token || !TOKENS.includes(token)) {
      return json({ status: false, erro: "Token inválido" })
    }

    // =========================
    // 🔥 ROTAS
    // =========================
    if (path === "cpf") return await cpfHandler(url)

    return json({ status: false, erro: "Rota não encontrada" })
  }
}

// =========================
// 🔎 CPF HANDLER
// =========================
async function cpfHandler(url) {

  const cpf = url.searchParams.get("cpf")
  if (!cpf) return json({ status: false, erro: "CPF não informado" })

  try {

    const res = await fetch(`https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`)
    const data = await res.json()

    if (!data || data.status !== "ok") {
      return json({ status: false, erro: "Erro na consulta" })
    }

    // =========================
    // 🧠 NORMALIZAÇÃO UNIVERSAL
    // =========================
    let texto = data.resultado || ""

    texto = fixEncoding(texto)
    texto = limparCreditos(texto)

    const formatado = formatarPadrao("CONSULTA CPF", texto)

    return json({
      status: true,
      tipo: "cpf",
      query: cpf,
      raw: texto,
      formatado: formatado
    })

  } catch (e) {
    return json({ status: false, erro: "Erro interno", detalhe: e.message })
  }
}

// =========================
// 🔧 CORRIGIR ENCODING
// =========================
function fixEncoding(str) {
  try {
    return decodeURIComponent(escape(str))
  } catch {
    return str
  }
}

// =========================
// 🧹 LIMPAR CRÉDITOS
// =========================
function limparCreditos(str) {
  return str
    .replace(/HydraCore/gi, "")
    .replace(/ObitoSpam/gi, "")
    .replace(/©.*$/gim, "")
    .trim()
}

// =========================
// 🎨 PADRÃO VISUAL GLOBAL
// =========================
function formatarPadrao(titulo, conteudo) {

  return `
╔══════════════════════════════╗
   ${titulo} — ASTRO API
╚══════════════════════════════╝

${conteudo}

──────────────────────────────
🚀 Astro Company | @puxardados5
──────────────────────────────
`.trim()
}

// =========================
// 📦 RESPONSE
// =========================
function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  })
}