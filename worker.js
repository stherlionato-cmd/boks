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
    if (path === "api") return await universalHandler(url)

    return json({ status: false, erro: "Rota não encontrada" })
  }
}

// =========================
// 🔎 CPF DIRETO (SUA API)
// =========================
async function cpfHandler(url) {

  const cpf = url.searchParams.get("cpf")
  if (!cpf) return json({ status: false, erro: "CPF não informado" })

  try {

    const api = `https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`

    const res = await fetch(api)
    let rawText = await res.text()

    rawText = fixEncoding(rawText)
    rawText = limparCreditos(rawText)

    let jsonData = null
    try { jsonData = JSON.parse(rawText) } catch {}

    let texto = jsonData?.resultado || rawText

    const dados = extrairTexto(texto)

    const formatado = formatarPadrao("CONSULTA CPF", dados)

    return json({
      status: true,
      tipo: "cpf",
      query: cpf,

      dados: dados,
      formatado: formatado,
      raw: texto
    })

  } catch (e) {
    return json({ status: false, erro: "Erro na consulta", detalhe: e.message })
  }
}

// =========================
// 🌐 UNIVERSAL
// =========================
async function universalHandler(url) {

  const target = url.searchParams.get("url")
  if (!target) return json({ status: false, erro: "URL não informada" })

  try {

    const res = await fetch(target)
    let rawText = await res.text()

    rawText = fixEncoding(rawText)
    rawText = limparCreditos(rawText)

    let jsonData = null
    try { jsonData = JSON.parse(rawText) } catch {}

    let dados = jsonData ? extrairJSON(jsonData) : extrairTexto(rawText)

    const formatado = formatarPadrao("RESULTADO", dados)

    return json({
      status: true,
      origem: target,
      tipo: jsonData ? "json" : "texto",

      dados,
      formatado,
      raw: rawText
    })

  } catch (e) {
    return json({ status: false, erro: "Erro ao consumir API", detalhe: e.message })
  }
}

// =========================
// 🔍 EXTRAIR TEXTO
// =========================
function extrairTexto(texto) {

  const linhas = texto.split("\n")
  let resultado = {}

  for (let linha of linhas) {
    linha = linha.trim()
    if (!linha.includes(":")) continue

    const [chave, ...resto] = linha.split(":")
    const valor = resto.join(":").trim()

    const key = normalizeKey(chave)

    if (!resultado[key]) {
      resultado[key] = valor
    } else {
      if (!Array.isArray(resultado[key])) {
        resultado[key] = [resultado[key]]
      }
      resultado[key].push(valor)
    }
  }

  return resultado
}

// =========================
// 🔍 EXTRAIR JSON
// =========================
function extrairJSON(obj) {
  function deep(o) {
    if (Array.isArray(o)) return o.map(deep)
    if (typeof o === "object" && o !== null) {
      let novo = {}
      for (let k in o) novo[normalizeKey(k)] = deep(o[k])
      return novo
    }
    return o
  }
  return deep(obj)
}

// =========================
// 🔧 NORMALIZAR CHAVE
// =========================
function normalizeKey(str) {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
}

// =========================
// 🔧 FIX ENCODING
// =========================
function fixEncoding(str) {
  try { return decodeURIComponent(escape(str)) } catch { return str }
}

// =========================
// 🧹 LIMPAR CRÉDITOS
// =========================
function limparCreditos(str) {
  return str
    .replace(/HydraCore/gi, "")
    .replace(/ObitoSpam/gi, "")
    .replace(/©.*$/gim, "")
}

// =========================
// 🎨 FORMATAÇÃO
// =========================
function formatarPadrao(titulo, dados) {

  let texto = ""

  for (let key in dados) {
    texto += `\n${key.toUpperCase()}:\n`

    if (Array.isArray(dados[key])) {
      dados[key].forEach(v => {
        texto += ` - ${JSON.stringify(v)}\n`
      })
    } else {
      texto += ` ${dados[key]}\n`
    }
  }

  return `
╔══════════════════════════════╗
   ${titulo} — ASTRO API
╚══════════════════════════════╝

${texto}

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