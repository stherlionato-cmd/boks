export default {
async fetch(request, env, ctx){

const url = new URL(request.url)
let endpoint = url.pathname.replace(/^\/|\/$/g,"")

// 🔥 RATE LIMIT (simples)
const ip = request.headers.get("CF-Connecting-IP") || "unknown"
if(!globalThis.RATE_LIMIT) globalThis.RATE_LIMIT = {}

const now = Date.now()
if(!globalThis.RATE_LIMIT[ip]) globalThis.RATE_LIMIT[ip] = []

globalThis.RATE_LIMIT[ip] = globalThis.RATE_LIMIT[ip].filter(t => now - t < 10000)

if(globalThis.RATE_LIMIT[ip].length > 20){
  return jsonErro("RATE_LIMIT","Muitas requisições, aguarde...")
}

globalThis.RATE_LIMIT[ip].push(now)

// 🔥 ALIAS
const ALIAS = {
  cpf2:"cpf",
  cpf3:"cpf",
  cpf4:"cpf",
  cpf5:"cpf",
  cpf6:"cpf"
}

if(ALIAS[endpoint]){
  endpoint = ALIAS[endpoint]
}

if(endpoint === "admin"){
  const token = url.searchParams.get("token")
  if(token !== ADMIN_TOKEN){
    return jsonErro("AUTH_ADMIN","Acesso negado")
  }
  return adminPanel(request)
}

if(endpoint === ""){
  return home(request)
}

if(!ENDPOINTS[endpoint]){
  return jsonErro("ENDPOINT_404","Endpoint não encontrado")
}

return consultar(endpoint,request,url,ctx,env)

}
}

/* ================= CONFIG ================= */

const ADMIN_TOKEN = "dragonsubdono"
const BASE_KNOWS = "https://knowsapi.shop/api/consultas/"

/* ================= TOKENS ================= */

const TOKENS = {
  IFNastro:{plano:"VIP",credits:-1,endpoints:null},
  dragon:{plano:"VIP",credits:-1,endpoints:null},
  astrofree:{plano:"FREE",credits:100,endpoints:["cpf","nome"]},
  astropro:{plano:"PRO",credits:1000,endpoints:null}
}

/* ================= ENDPOINTS ================= */

const ENDPOINTS = {

cpf:{query:"cpf",apis:[{url:BASE_KNOWS+"cpf",param:"cpf",tipo:"knows"}]},
nome:{query:"nome",apis:[{url:BASE_KNOWS+"nome",param:"nome",tipo:"knows"}]},
telefone:{query:"telefone",apis:[{url:BASE_KNOWS+"telefone",param:"telefone",tipo:"knows"}]},
telefone_full:{query:"telefone",apis:[{url:BASE_KNOWS+"telefone-full",param:"telefone",tipo:"knows"}]},
telefone_cpf:{query:"cpf",apis:[{url:BASE_KNOWS+"telefone-cpf",param:"cpf",tipo:"knows"}]},
ddd:{query:"ddd",apis:[{url:BASE_KNOWS+"ddd",param:"ddd",tipo:"knows"}]},
operadora:{query:"telefone",apis:[{url:BASE_KNOWS+"operadora",param:"telefone",tipo:"knows"}]},
rg:{query:"rg",apis:[{url:BASE_KNOWS+"rg",param:"rg",tipo:"knows"}]},
titulo:{query:"titulo",apis:[{url:BASE_KNOWS+"titulo",param:"titulo",tipo:"knows"}]},
pis:{query:"pis",apis:[{url:BASE_KNOWS+"pis",param:"pis",tipo:"knows"}]},
nis:{query:"nis",apis:[{url:BASE_KNOWS+"nis",param:"nis",tipo:"knows"}]},
parentes:{query:"cpf",apis:[{url:BASE_KNOWS+"parentes",param:"cpf",tipo:"knows"}]},
vizinhos:{query:"cpf",apis:[{url:BASE_KNOWS+"vizinhos",param:"cpf",tipo:"knows"}]},
cep:{query:"cep",apis:[{url:BASE_KNOWS+"cep",param:"cep",tipo:"knows"}]},
estado:{query:"uf",apis:[{url:BASE_KNOWS+"estado",param:"uf",tipo:"knows"}]},
email:{query:"email",apis:[{url:BASE_KNOWS+"email",param:"email",tipo:"knows"}]},
score:{query:"cpf",apis:[{url:BASE_KNOWS+"score",param:"cpf",tipo:"knows"}]},
renda:{query:"valor",apis:[{url:BASE_KNOWS+"renda",param:"valor",tipo:"knows"}]},
cbo:{query:"cbo",apis:[{url:BASE_KNOWS+"cbo",param:"cbo",tipo:"knows"}]},
foto_sp:{query:"cpf",apis:[{url:BASE_KNOWS+"foto-sp",param:"cpf",tipo:"knows"}]},
foto_ma:{query:"cpf",apis:[{url:BASE_KNOWS+"foto-ma",param:"cpf",tipo:"knows"}]},
foto_ro:{query:"cpf",apis:[{url:BASE_KNOWS+"foto-ro",param:"cpf",tipo:"knows"}]},
foto_all:{query:"cpf",apis:[{url:BASE_KNOWS+"foto-all",param:"cpf",tipo:"knows"}]}

}

/* ================= CONSULTA ================= */

async function consultar(endpoint, request, url, ctx, env){

if(request.method !== "GET"){
  return jsonErro("REQ_000","Método inválido")
}

const token = url.searchParams.get("token")
if(!token) return jsonErro("AUTH_002","Token obrigatório")

let tokenData = TOKENS[token]
if(!tokenData) return jsonErro("AUTH_001","Token inválido")

if(tokenData.endpoints && !tokenData.endpoints.includes(endpoint)){
  return jsonErro("AUTH_003","Endpoint não liberado")
}

// 🔥 Persistência KV (opcional)
if(env.TOKENS_KV){
  const saved = await env.TOKENS_KV.get(token)
  if(saved) tokenData = JSON.parse(saved)
}

if(tokenData.plano !== "VIP"){
  if(tokenData.credits <= 0){
    return jsonErro("LIMIT_001","Créditos esgotados")
  }
  tokenData.credits -= 1

  if(env.TOKENS_KV){
    await env.TOKENS_KV.put(token, JSON.stringify(tokenData))
  }
}

const config = ENDPOINTS[endpoint]
const valor = url.searchParams.get(config.query)

if(!valor){
  return jsonErro("REQ_001","Parâmetro ausente")
}

let respostaFinal = null

for(const apiConfig of config.apis){

  let apiURL =
    apiConfig.url + "?" +
    apiConfig.param + "=" + encodeURIComponent(valor)

  apiURL += "&apikey=bigmouth"

  try{

    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(),5000)

    const res = await fetch(apiURL,{
      signal: controller.signal,
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Accept":"application/json"
      }
    })

    clearTimeout(timeout)

    const text = await res.text()

    let json
    try{
      json = JSON.parse(text)
    }catch{
      continue
    }

    let dados = tratarKnows(json)

    if(!dados || (typeof dados === "object" && Object.keys(dados).length === 0)){
      continue
    }

    respostaFinal = dados
    break

  }catch(e){
    console.log("Erro API:", e.message)
    continue
  }
}

if(!respostaFinal){
  return jsonErro("DATA_404","Nenhuma API retornou resultado")
}

let dados = limparRespostaAPI(respostaFinal)
dados = normalizarDados(dados)

return new Response(JSON.stringify({
  status:true,
  meta:{
    api:"Astro Ultra",
    plano: tokenData.plano,
    creditos_restantes: tokenData.plano === "VIP" ? "ilimitado" : tokenData.credits,
    endpoint,
    timestamp:new Date().toISOString()
  },
  consulta:{[config.query]:valor},
  dados
},null,2),{
  headers:{
    "Content-Type":"application/json;charset=UTF-8",
    "Access-Control-Allow-Origin":"*"
  }
})

}

/* ================= TRATAR KNOWS ================= */

function tratarKnows(api){
  return api?.body || api?.data || api?.resultado || api
}

/* ================= LIMPAR ================= */

function limparRespostaAPI(data){
if(!data || typeof data !== "object") return data
delete data.creator
delete data.criador
delete data.status
delete data.statusCode
return data
}

/* ================= NORMALIZAR ================= */

function normalizarDados(data){
if(Array.isArray(data)){
  return data.map(normalizarDados)
}
if(data !== null && typeof data === "object"){
  const novo={}
  for(const k in data){
    novo[k]=normalizarDados(data[k])
  }
  return novo
}
return data
}

/* ================= ERRO ================= */

function jsonErro(code,msg,extra=null){
return new Response(JSON.stringify({
  status:false,
  erro:{code,msg,extra}
},null,2),{
  headers:{
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*"
  }
})
}

/* ================= HOME ================= */

function home(request){
return new Response("Astro API online 🚀",{
headers:{
"Content-Type":"text/plain"
}
})
}

/* ================= ADMIN ================= */

function adminPanel(){
return new Response("Painel admin ativo 🔥")
}