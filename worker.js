export default {
async fetch(request, env, ctx){

const url = new URL(request.url)
let endpoint = url.pathname.replace("/","")

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

if(endpoint === ""){
  return home(request)
}

if(!ENDPOINTS[endpoint]){
  return jsonErro("ENDPOINT_404","Endpoint não encontrado")
}

return consultar(endpoint,request,url,ctx)

}
}

/* ================= CONFIG ================= */

const BASE_SARA = "https://knowsapi.shop/api/consultas/"
const API_KEY = "bigmouth"

/* ================= TOKENS ================= */

const TOKENS = {
  IFNastro:{plano:"VIP",credits:-1,endpoints:null},
  dragon:{plano:"VIP",credits:-1,endpoints:null},
  astrofree:{plano:"FREE",credits:100,endpoints:["cpf","nome"]},
  astropro:{plano:"PRO",credits:1000,endpoints:null}
}

/* ================= ENDPOINTS ================= */

const ENDPOINTS = {

cpf:{
  query:"cpf",
  apis:[{
    url:BASE_SARA+"cpf",
    param:"code",
    tipo:"normal",
    apikey:true
  }]
},

nome:{
  query:"nome",
  apis:[{
    url:BASE_SARA+"nome",
    param:"name",
    tipo:"normal",
    apikey:true
  }]
},

telefone:{
  query:"telefone",
  apis:[{
    url:BASE_SARA+"telefone",
    param:"phone",
    tipo:"normal",
    apikey:true
  }]
}

}

/* ================= CONSULTA ================= */

async function consultar(endpoint, request, url, ctx){

if(request.method !== "GET"){
  return jsonErro("REQ_000","Método inválido")
}

const token = url.searchParams.get("token")
if(!token) return jsonErro("AUTH_002","Token obrigatório")

const tokenData = TOKENS[token]
if(!tokenData) return jsonErro("AUTH_001","Token inválido")

// 🔒 BLOQUEIO
if(tokenData.endpoints && !tokenData.endpoints.includes(endpoint)){
  return jsonErro("AUTH_003","Endpoint não liberado")
}

// 💰 CRÉDITOS
if(tokenData.plano !== "VIP"){
  if(tokenData.credits <= 0){
    return jsonErro("LIMIT_001","Créditos esgotados")
  }
  tokenData.credits -= 1
}

const config = ENDPOINTS[endpoint]
const valor = url.searchParams.get(config.query)

if(!valor){
  return jsonErro("REQ_001","Parâmetro ausente")
}

let respostaFinal = null

for(const apiConfig of config.apis){

  // 🔥 MONTA URL DINÂMICA
  let apiURL = apiConfig.url + "?" +
               apiConfig.param + "=" + encodeURIComponent(valor)

  if(apiConfig.apikey){
    apiURL += "&apikey=" + API_KEY
  }

  try{

    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(),10000)

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

    // 🔥 TRATAMENTO UNIVERSAL
    if(json?.body) json = json.body
    if(json?.resultado?.body) json = json.resultado.body

    // ❌ ignora erro da API
    if(json?.error || json?.message){
      continue
    }

    if(!json || (typeof json === "object" && Object.keys(json).length === 0)){
      continue
    }

    respostaFinal = json
    break

  }catch(e){
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
    "Content-Type":"application/json;charset=UTF-8"
  }
})

}

/* ================= LIMPAR ================= */

function limparRespostaAPI(data){
if(!data || typeof data !== "object") return data
delete data.creator
delete data.status
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
  headers:{"Content-Type":"application/json"}
})
}

/* ================= HOME SIMPLES ================= */

function home(){
return new Response(JSON.stringify({
  status:true,
  message:"🚀 Astro API Online",
  endpoints:Object.keys(ENDPOINTS)
},null,2),{
  headers:{"Content-Type":"application/json"}
})
}