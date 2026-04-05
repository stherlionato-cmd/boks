export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url)
    let path = url.pathname.replace(/^\/|\/$/g, "")

    // =========================
    // 👤 USUÁRIOS / TOKENS
    // =========================
    const USERS = {
      "Astro123": { plano: "FREE", creditos: 10 },
      "VIP456": { plano: "VIP", creditos: 9999 },
      "TesteToken": { plano: "FREE", creditos: 5 }
    }

    const token = url.searchParams.get("token")
    const user = USERS[token]

    if (!user) return error("Token inválido")

    if (user.creditos <= 0) {
      return error("Créditos esgotados")
    }

    // =========================
    // 🔀 ALIAS
    // =========================
    const ALIAS = {
      cpf2: "cpf",
      cpf3: "cpf"
    }

    if (ALIAS[path]) path = ALIAS[path]

    try {

      let apiData
      let consulta

      // =========================
      // 🔎 CPF
      // =========================
      if (path === "cpf") {

        const cpf = url.searchParams.get("cpf")
        if (!cpf) return error("Informe o cpf")

        consulta = cpf

        const req = await fetch(`https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`)
        apiData = await req.json()
      }

      else {
        return error("Rota inválida")
      }

      // 💳 DESCONTA CRÉDITO
      user.creditos--

      // =========================
      // 🧠 EXTRAÇÃO INTELIGENTE
      // =========================
      let raw = ""

      if (apiData.resultado) {
        raw = apiData.resultado
      } else {
        raw = JSON.stringify(apiData, null, 2)
      }

      // =========================
      // 🧹 LIMPEZA PESADA
      // =========================
      raw = limparTexto(raw)

      // =========================
      // 🎨 FORMATAÇÃO BONITA
      // =========================
      const resultado = formatarBonito(raw, {
        titulo: path.toUpperCase(),
        consulta,
        user
      })

      return json({
        status: true,
        consulta,
        plano: user.plano,
        creditos: user.creditos,
        resultado
      })

    } catch (e) {
      return error("Erro interno")
    }

  }
}

// =========================
// 🧹 LIMPEZA INTELIGENTE
// =========================
function limparTexto(txt) {
  return txt
    .replace(/HydraCore/gi, "")
    .replace(/ObitoSpam/gi, "")
    .replace(/©/gi, "")
    .replace(/={5,}/g, "")
    .replace(/_{5,}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

// =========================
// 🎨 FORMATAÇÃO TOP
// =========================
function formatarBonito(txt, config) {

  // separa blocos automaticamente
  const linhas = txt.split("\n")

  let novo = []
  let blocoAtual = ""

  for (let linha of linhas) {

    linha = linha.trim()

    if (!linha) continue

    // detecta títulos
    if (linha.length < 40 && linha === linha.toUpperCase()) {
      if (blocoAtual) {
        novo.push(blocoAtual)
        blocoAtual = ""
      }

      novo.push(`\n📌 ${linha}\n`)
    } else {
      blocoAtual += linha + "\n"
    }
  }

  if (blocoAtual) novo.push(blocoAtual)

  return `
╔══════════════════════════════╗
   🔎 CONSULTA ${config.titulo} — ASTRO API
╚══════════════════════════════╝

👤 Plano: ${config.user.plano}
💳 Créditos restantes: ${config.user.creditos}

📄 Consulta: ${config.consulta}

${novo.join("\n")}

──────────────────────────────
🚀 Astro Company | @puxardados5
`
}

// =========================
// ❌ ERRO
// =========================
function error(msg) {
  return json({
    status: false,
    msg
  })
}

// =========================
// 📦 JSON UTF-8 CORRETO
// =========================
function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  })
}