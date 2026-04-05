export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url)
    let path = url.pathname.replace(/^\/|\/$/g, "")

    // =========================
    // 🔐 SISTEMA DE TOKENS
    // =========================
    const TOKENS = [
      "SEU_TOKEN_AQUI",
      "VIP_123",
      "TESTE"
    ]

    const token = url.searchParams.get("token")

    if (!token || !TOKENS.includes(token)) {
      return json({
        status: false,
        erro: "Token inválido ou não fornecido"
      })
    }

    // =========================
    // 🔥 ROTAS
    // =========================
    if (path === "cpf") {
      return await consultaCPF(url)
    }

    return json({
      status: false,
      erro: "Rota não encontrada"
    })
  }
}

// =========================
// 🔎 CONSULTA CPF
// =========================
async function consultaCPF(url) {

  const cpf = url.searchParams.get("cpf")

  if (!cpf) {
    return json({
      status: false,
      erro: "CPF não informado"
    })
  }

  try {

    // 🔥 API EXTERNA
    const api = await fetch(`https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`)
    const data = await api.json()

    if (!data || data.status !== "ok") {
      return json({
        status: false,
        erro: "Erro ao consultar CPF"
      })
    }

    // =========================
    // 🧠 LIMPEZA DO RESULTADO
    // =========================
    let resultado = data.resultado || ""

    // remove créditos antigos
    resultado = resultado
      .replace(/HydraCore/gi, "")
      .replace(/ObitoSpam/gi, "")
      .replace(/©.*?\n/gi, "")

    // =========================
    // 🎨 FORMATAÇÃO MELHORADA
    // =========================
    const respostaFormatada = `
╔══════════════════════════════╗
   CONSULTA CPF — ASTRO API
╚══════════════════════════════╝

${resultado.trim()}

──────────────────────────────
🚀 Astro Company | @puxardados5
──────────────────────────────
`

    // =========================
    // 📦 RESPOSTA FINAL
    // =========================
    return json({
      status: true,
      tipo: "cpf",
      cpf: cpf,
      base: "completa",
      resultado: respostaFormatada.trim()
    })

  } catch (e) {
    return json({
      status: false,
      erro: "Erro interno",
      detalhe: e.message
    })
  }
}

// =========================
// 📦 JSON RESPONSE
// =========================
function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}