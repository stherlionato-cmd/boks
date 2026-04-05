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

return consultar(endpoint,request,url,ctx)

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

async function consultar(endpoint, request, url, ctx){

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

  let apiURL =
    apiConfig.url + "?" +
    apiConfig.param + "=" + encodeURIComponent(valor)

  // 🔑 API KEY
  apiURL += "&apikey=bigmouth"

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

    let dados = tratarKnows(json)

    if(!dados || (typeof dados === "object" && Object.keys(dados).length === 0)){
      continue
    }

    respostaFinal = dados
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

/* ================= TRATAR KNOWS ================= */

function tratarKnows(api){
  if(api?.body){
    return api.body
  }
  return api
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
  headers:{"Content-Type":"application/json"}
})
}

/* ================= HOME SIMPLES ================= */

function home(){
return new Response(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro API | Painel</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif}

body{
background: radial-gradient(circle at top,#0f172a,#020617);
color:#fff;
overflow-x:hidden;
}

/* HEADER */
.header{
text-align:center;
padding:40px 20px;
}

.header h1{
font-size:2.2rem;
color:#3b82f6;
}

.header p{
opacity:.7;
margin-top:10px;
}

/* GRID */
.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
gap:20px;
padding:20px;
max-width:1200px;
margin:auto;
}

/* CARD */
.card{
background:#111827cc;
border:1px solid #1f2937;
border-radius:15px;
padding:20px;
backdrop-filter:blur(10px);
transition:.3s;
}

.card:hover{
transform:translateY(-5px);
border-color:#3b82f6;
}

/* TITULO */
.card h3{
color:#3b82f6;
margin-bottom:10px;
}

/* INPUT */
input{
width:100%;
padding:10px;
margin-top:10px;
border-radius:8px;
border:none;
background:#020617;
color:#fff;
}

/* BUTTON */
button{
width:100%;
margin-top:10px;
padding:10px;
border:none;
border-radius:8px;
background:#3b82f6;
color:#fff;
cursor:pointer;
font-weight:bold;
}

button:hover{
opacity:.8;
}

/* RESULT */
#result{
max-width:1200px;
margin:30px auto;
padding:20px;
background:#020617;
border-radius:10px;
white-space:pre-wrap;
font-size:13px;
overflow:auto;
border:1px solid #1f2937;
}

</style>
</head>
<body>

<div class="header">
<h1>🚀 Astro API</h1>
<p>Painel interativo de consultas</p>
</div>

<div class="grid" id="cards"></div>

<div id="result">Selecione uma consulta...</div>

<script>

const ENDPOINTS = ${JSON.stringify(ENDPOINTS,null,2)}

const BASE = window.location.origin

const container = document.getElementById("cards")

Object.keys(ENDPOINTS).forEach(key=>{

const ep = ENDPOINTS[key]

const card = document.createElement("div")
card.className="card"

card.innerHTML = \`
<h3>\${key.toUpperCase()}</h3>
<small>Parametro: \${ep.query}</small>

<input placeholder="Digite o valor..." id="input-\${key}">

<input placeholder="Token..." id="token-\${key}">

<button onclick="consultar('\${key}')">Consultar</button>
\`

container.appendChild(card)

})

async function consultar(endpoint){

const ep = ENDPOINTS[endpoint]

const valor = document.getElementById("input-"+endpoint).value
const token = document.getElementById("token-"+endpoint).value

if(!valor || !token){
alert("Preencha tudo")
return
}

const url = BASE + "/" + endpoint + "?" + ep.query + "=" + encodeURIComponent(valor) + "&token=" + token

document.getElementById("result").textContent = "Consultando..."

try{

const res = await fetch(url)
const text = await res.text()

try{
const json = JSON.parse(text)
document.getElementById("result").textContent = JSON.stringify(json,null,2)
}catch{
document.getElementById("result").textContent = text
}

}catch(e){
document.getElementById("result").textContent = "Erro: "+e.message
}

}

</script>

</body>
</html>`,{
headers:{
"Content-Type":"text/html;charset=UTF-8"
}
})
}