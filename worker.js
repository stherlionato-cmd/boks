export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url)
    let path = url.pathname.replace(/^\/|\/$/g, "")

    // 🔐 TOKENS
    const TOKENS = [
      "Astro123",
      "VIP456",
      "TesteToken"
    ]

    const token = url.searchParams.get("token")
    if (!TOKENS.includes(token)) {
      return json({
        status: false,
        msg: "Token inválido."
      })
    }

    // 🔀 ALIAS (facilita rotas duplicadas)
    const ALIAS = {
      cpf2: "cpf",
      cpf3: "cpf",
      telefone: "tel",
      telefone2: "tel",
      nome2: "nome"
    }

    if (ALIAS[path]) path = ALIAS[path]

    try {

      // =========================
      // 🔎 CPF
      // =========================
      if (path === "cpf") {

        const cpf = url.searchParams.get("cpf")
        if (!cpf) return error("Informe o cpf")

        const api = await fetch(`https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`)
        const data = await api.json()

        return formatar(data, {
          titulo: "CONSULTA CPF",
          documento: cpf
        })
      }

      // =========================
      // 📱 TELEFONE (PRONTO PRA USAR)
      // =========================
      if (path === "tel") {

        const tel = url.searchParams.get("tel")
        if (!tel) return error("Informe o telefone")

        // 🔗 TROCAR QUANDO TIVER SUA API
        const api = await fetch(`https://SUAAPI.com/telefone?numero=${tel}`)
        const data = await api.json()

        return formatar(data, {
          titulo: "CONSULTA TELEFONE",
          documento: tel
        })
      }

      // =========================
      // 👤 NOME (PRONTO PRA USAR)
      // =========================
      if (path === "nome") {

        const nome = url.searchParams.get("nome")
        if (!nome) return error("Informe o nome")

        // 🔗 TROCAR QUANDO TIVER SUA API
        const api = await fetch(`https://SUAAPI.com/nome?nome=${encodeURIComponent(nome)}`)
        const data = await api.json()

        return formatar(data, {
          titulo: "CONSULTA NOME",
          documento: nome
        })
      }

      return error("Rota inválida")

    } catch (e) {
      return error("Erro interno")
    }

  }
}

// =========================
// 🎨 FORMATADOR GLOBAL
// =========================
function formatar(apiResponse, config) {

  if (!apiResponse || !apiResponse.resultado) {
    return error("Sem resultado")
  }

  let txt = apiResponse.resultado

  // 🧹 LIMPA MARCAS
  txt = txt
    .replace(/HydraCore/gi, "")
    .replace(/ObitoSpam/gi, "")
    .replace(/©/gi, "")
    .replace(/══════════════════════════/g, "")

  // 🎨 PADRÃO ASTRO
  txt = `
╔══════════════════════════════╗
   🔎 ${config.titulo} — ASTRO API
╚══════════════════════════════╝

📄 Consulta: ${config.documento}

${txt.trim()}

──────────────────────────────
🚀 Astro Company | @puxardados5
`

  return json({
    status: true,
    consulta: config.documento,
    resultado: txt
  })
}

// =========================
// ❌ ERRO PADRÃO
// =========================
function error(msg) {
  return json({
    status: false,
    msg: msg
  })
}

// =========================
// 📦 JSON RESPONSE
// =========================
function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" }
  })
}