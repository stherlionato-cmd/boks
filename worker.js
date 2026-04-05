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

// 🔥 HOME
if(endpoint === ""){
  return homeHTML()
}

// 🔥 ADMIN
if(endpoint === "admin"){
  const token = url.searchParams.get("token")
  if(token !== ADMIN_TOKEN){
    return jsonErro("AUTH_ADMIN","Acesso negado")
  }
  return adminPanel()
}

// 🔥 404
if(!ENDPOINTS[endpoint]){
  return jsonErro("ENDPOINT_404","Endpoint não encontrado")
}

return consultar(endpoint,request,url)

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

cpf:{query:"cpf",apis:[{url:BASE_KNOWS+"cpf",param:"cpf"}]},
nome:{query:"nome",apis:[{url:BASE_KNOWS+"nome",param:"nome"}]},
telefone:{query:"telefone",apis:[{url:BASE_KNOWS+"telefone",param:"telefone"}]},
telefone_full:{query:"telefone",apis:[{url:BASE_KNOWS+"telefone-full",param:"telefone"}]},
telefone_cpf:{query:"cpf",apis:[{url:BASE_KNOWS+"telefone-cpf",param:"cpf"}]},
cep:{query:"cep",apis:[{url:BASE_KNOWS+"cep",param:"cep"}]},
email:{query:"email",apis:[{url:BASE_KNOWS+"email",param:"email"}]},
score:{query:"cpf",apis:[{url:BASE_KNOWS+"score",param:"cpf"}]},
parentes:{query:"cpf",apis:[{url:BASE_KNOWS+"parentes",param:"cpf"}]},
vizinhos:{query:"cpf",apis:[{url:BASE_KNOWS+"vizinhos",param:"cpf"}]}

}

/* ================= CONSULTA ================= */

async function consultar(endpoint, request, url){

if(request.method !== "GET"){
  return jsonErro("REQ_000","Método inválido")
}

const token = url.searchParams.get("token")
if(!token) return jsonErro("AUTH_002","Token obrigatório")

const tokenData = TOKENS[token]
if(!tokenData) return jsonErro("AUTH_001","Token inválido")

if(tokenData.endpoints && !tokenData.endpoints.includes(endpoint)){
  return jsonErro("AUTH_003","Endpoint não liberado")
}

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

  let apiURL = apiConfig.url + "?" + apiConfig.param + "=" + encodeURIComponent(valor)
  apiURL += "&apikey=bigmouth"

  try{

    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(),10000)

    const res = await fetch(apiURL,{signal:controller.signal})
    clearTimeout(timeout)

    const json = await res.json()

    if(json && Object.keys(json).length > 0){
      respostaFinal = json.body || json
      break
    }

  }catch(e){
    continue
  }
}

if(!respostaFinal){
  return jsonErro("DATA_404","Nenhuma API retornou resultado")
}

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
  dados:respostaFinal
},null,2),{
  headers:{"Content-Type":"application/json"}
})

}

/* ================= HOME HTML ================= */

function homeHTML(){

return new Response(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro API</title>

<style>
body{
  background:#020617;
  color:#e2e8f0;
  font-family:sans-serif;
  padding:20px;
}

h1{
  text-align:center;
}

.card{
  margin:10px 0;
  padding:15px;
  border-radius:10px;
  background:#0f172a;
  cursor:pointer;
}

input{
  width:100%;
  padding:10px;
  margin-top:10px;
  background:#020617;
  color:#fff;
  border:none;
}

button{
  margin-top:10px;
  padding:10px;
  width:100%;
  background:#3b82f6;
  color:#fff;
  border:none;
  cursor:pointer;
}

#result{
  margin-top:20px;
  white-space:pre-wrap;
  font-size:12px;
}
</style>
</head>

<body>

<h1>🚀 Astro API</h1>

<div id="list"></div>

<input id="token" placeholder="Token">
<input id="valor" placeholder="Valor">

<button onclick="consultar()">Consultar</button>

<pre id="result"></pre>

<script>

const endpoints = ${JSON.stringify(Object.keys(ENDPOINTS))}

let selected = ""

const list = document.getElementById("list")

endpoints.forEach(ep=>{
  const div = document.createElement("div")
  div.className="card"
  div.innerText = ep

  div.onclick = ()=>{
    selected = ep
    alert("Selecionado: "+ep)
  }

  list.appendChild(div)
})

async function consultar(){

  const token = document.getElementById("token").value
  const valor = document.getElementById("valor").value

  if(!selected) return alert("Escolha um endpoint")

  const res = await fetch("/"+selected+"?token="+token+"&"+selected+"="+valor)
  const json = await res.json()

  document.getElementById("result").innerText = JSON.stringify(json,null,2)
}

</script>

</body>
</html>`,{
  headers:{"Content-Type":"text/html"}
})

}

/* ================= ERRO ================= */

function jsonErro(code,msg){
return new Response(JSON.stringify({
  status:false,
  erro:{code,msg}
},null,2),{
  headers:{"Content-Type":"application/json"}
})
}

/* ================= ADMIN ================= */

function adminPanel(){
return new Response(JSON.stringify({
  status:true,
  message:"Painel admin"
}),{
  headers:{"Content-Type":"application/json"}
})
}