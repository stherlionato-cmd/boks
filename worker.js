export default {
async fetch(request){

const url = new URL(request.url)
let path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🔥 ALIAS
// ============================
const ALIAS = {
  cpf2:"cpf",
  nome2:"nome"
}

if(ALIAS[path]){
  path = ALIAS[path]
}

// ============================
// 🏠 HOME
// ============================
if(path === ""){
  return new Response(home(request),{
    headers:{"Content-Type":"text/html;charset=UTF-8"}
  })
}

// ============================
// 🔐 TOKENS
// ============================
const TOKENS = {
  VIP_123:{plano:"VIP"},
  ifnastro:{plano:"VIP"}
}

const token = url.searchParams.get("token")
if(!token || !TOKENS[token]){
  return jsonErro("AUTH_001","Token inválido")
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "cpf") return handleCPF(url)
if(path === "nome") return handleNome(url)
if(path === "telefone") return handleTelefone(url)
if(path === "placa") return handlePlaca(url)

return jsonErro("ENDPOINT_404","Endpoint não encontrado")

}
}

/* ============================
   🔎 HANDLERS
============================ */

async function handleCPF(url){

const cpf = url.searchParams.get("cpf")
if(!cpf) return jsonErro("REQ_001","CPF não informado")

const api = `https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return sucesso("cpf",cpf,data)

}catch{
  return jsonErro("API_001","Erro ao consultar CPF")
}

}

async function handleNome(url){

const nome = url.searchParams.get("nome")
if(!nome) return jsonErro("REQ_001","Nome não informado")

const api = `https://obitostore.shop/api/consulta/nome3?nome=${encodeURIComponent(nome)}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return sucesso("nome",nome,data)

}catch{
  return jsonErro("API_001","Erro ao consultar Nome")
}

}

async function handleTelefone(url){

const telefone = url.searchParams.get("telefone")
if(!telefone) return jsonErro("REQ_001","Telefone não informado")

const api = `https://obitostore.shop/api/consulta/telefone?query=${telefone}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return sucesso("telefone",telefone,data)

}catch{
  return jsonErro("API_001","Erro ao consultar Telefone")
}

}

async function handlePlaca(url){

const placa = url.searchParams.get("placa")
if(!placa) return jsonErro("REQ_001","Placa não informada")

const api = `https://obitostore.shop/api/consulta/placa2?placa=${placa}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return sucesso("placa",placa,data)

}catch{
  return jsonErro("API_001","Erro ao consultar Placa")
}

}

/* ============================
   🧠 PADRÃO RESPOSTA
============================ */

function sucesso(tipo,valor,dados){

return new Response(JSON.stringify({
  status:true,
  meta:{
    api:"Astro API",
    tipo,
    query:valor,
    timestamp:new Date().toISOString()
  },
  dados
},null,2),{
  headers:{"Content-Type":"application/json"}
})

}

/* ============================
   ❌ ERRO
============================ */

function jsonErro(code,msg){
return new Response(JSON.stringify({
  status:false,
  erro:{code,msg}
},null,2),{
  headers:{"Content-Type":"application/json"}
})
}

/* ============================
   🎨 HOME UI PREMIUM
============================ */

function home(request){

const base = new URL(request.url).origin

return `

<!DOCTYPE html>
<html lang="pt-br">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<title>Astro API</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

<style>

:root{--blue:#3b82f6;}

*{
 margin:0;
 padding:0;
 box-sizing:border-box;
 font-family:'Inter',sans-serif;
}

body{
 background: radial-gradient(circle at 20% 20%, #0a0f2a, #02030a);
 color:#e2e8f0;
 padding:20px;
}

/* HEADER */
.header{
 text-align:center;
 margin-bottom:20px;
}

.header h1{
 font-size:22px;
 font-weight:800;
}

/* CARD */
.card{
 margin-top:15px;
 padding:16px;
 border-radius:18px;
 background:rgba(255,255,255,0.03);
 border:1px solid rgba(255,255,255,0.05);
 backdrop-filter:blur(10px);
}

/* INPUT */
input,select{
 width:100%;
 padding:12px;
 border-radius:12px;
 border:none;
 background:#0b1228;
 color:#fff;
 margin-top:8px;
}

/* BUTTON */
button{
 width:100%;
 padding:12px;
 margin-top:12px;
 border-radius:12px;
 border:none;
 font-weight:600;
 background:linear-gradient(90deg,#3b82f6,#2563eb);
 color:#fff;
 cursor:pointer;
}

/* RESULT */
.box{
 margin-top:10px;
 background:#020617;
 padding:10px;
 border-radius:10px;
 font-size:12px;
}

</style>

</head>

<body>

<div class="header">
  <h1>🚀 Astro API</h1>
</div>

<div class="card">

<input id="token" placeholder="Token">
<select id="endpoint">
<option>cpf</option>
<option>nome</option>
<option>telefone</option>
<option>placa</option>
</select>

<input id="valor" placeholder="Valor">

<button onclick="consultar()">Consultar</button>

<div class="box"><pre id="res"></pre></div>

</div>

<script>

async function consultar(){

const token = document.getElementById("token").value
const endpoint = document.getElementById("endpoint").value
const valor = document.getElementById("valor").value

let param = endpoint

if(endpoint === "telefone") param = "telefone"
if(endpoint === "placa") param = "placa"

const url = "${base}/"+endpoint+"?token="+token+"&"+param+"="+encodeURIComponent(valor)

const res = await fetch(url)
const data = await res.json()

document.getElementById("res").innerText = JSON.stringify(data,null,2)

}

</script>

</body>
</html>

`
}