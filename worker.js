export default {
async fetch(request){

const url = new URL(request.url)
const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["VIP_123","ifnvip"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido, adquira com: @puxardados5"})
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "cpf"){
  return handleCPF(url)
}

if(path === "nome"){
  return handleNome(url)
}

if(path === "placa"){
  return handlePlaca(url)
}

if(path === "telefone"){
  return handleTelefone(url)
}

// futuro:
// if(path === "telefone") return handleTelefone(url)
// if(path === "nome") return handleNome(url)

return json({status:false,message:"Endpoint não encontrado"})
}
}

function fixEncoding(str){
try{
  return decodeURIComponent(escape(str))
}catch(e){
  return str
}
}

// ============================
// 🔎 CPF
// ============================
async function handleCPF(url){

const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,message:"CPF não informado"})
}

// 🔗 API EXTERNA (OCULTA)
const api = `https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  const normalized = normalize(data)

  return json({
    status:true,
    base:"Astro API",
    credits:"Astro Company | @puxardados5",
    result: normalized
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Nome
// ============================
async function handleNome(url){

const nome = url.searchParams.get("nome")
if(!nome){
  return json({status:false,message:"Nome não informado"})
}

// 🔗 API EXTERNA (OCULTA)
const api = `https://obitostore.shop/api/consulta/nome3?nome=${nome}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  const normalized = normalize(data)

  return json({
    status:true,
    base:"Astro API",
    credits:"Astro Company | @puxardados5",
    result: normalized
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Telefone
// ============================
async function handleTelefone(url){

const telefone = url.searchParams.get("telefone")
if(!telefone){
  return json({status:false,message:"Telefone não informado"})
}

// 🔗 API EXTERNA (OCULTA)
const api = `https://obitostore.shop/api/consulta/telefone?query=${telefone}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  const normalized = normalize(data)

  return json({
    status:true,
    base:"Astro API",
    credits:"Astro Company | @puxardados5",
    result: normalized
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Placa
// ============================

async function handlePlaca(url){

const placa = url.searchParams.get("placa")
if(!placa){
  return json({status:false,message:"Placa não informada"})
}

const api = `https://obitostore.shop/api/consulta/placa2?placa=${placa}&apikey=bigmouthh`

try{

const res = await fetch(api,{
  method:"GET",
  headers:{
    "User-Agent":"Mozilla/5.0",
    "Accept":"application/json"
  }
})



// erro HTTP
if(!res.ok){
  const text = await res.text()
  return json({
    status:false,
    message:"Erro na API externa",
    http_status: res.status,
    response: text
  })
}

// leitura segura
const text = await res.text()

let data
try{
  data = JSON.parse(text)
}catch{
  return json({
    status:false,
    message:"Resposta não é JSON",
    raw: text
  })
}

// normalização
const normalized = normalize(data)

return json({
  status:true,
  base:"Astro API",
  credits:"Astro Company | @puxardados5",
  result: normalized
})

}catch(e){
  return json({
    status:false,
    message:"Erro interno",
    error: e.message
  })
}

}

// ============================
// 🧠 NORMALIZADOR UNIVERSAL
// ============================
function normalize(data){

if(typeof data === "string"){
  return parseText(data)
}

if(data.resultado){
  return parseText(data.resultado)
}

return cleanObject(data)

}

// ============================
// 🧹 LIMPAR JSON
// ============================
function cleanObject(obj){

if(Array.isArray(obj)){
  return obj.map(cleanObject)
}

if(typeof obj === "object" && obj !== null){

let newObj = {}

for(let key in obj){

// ❌ remove rastros
if(key.toLowerCase().includes("criador")) continue
if(key.toLowerCase().includes("credit")) continue

newObj[normalizeKey(key)] = cleanObject(obj[key])
}

return newObj
}

if(typeof obj === "string"){
  return cleanString(obj)
}

return obj
}

// ============================
// 🧠 PARSE TEXTO
// ============================
function parseText(text){

text = fixEncoding(text)
text = cleanString(text)

let lines = text.split("\n").map(l=>l.trim()).filter(Boolean)

let result = {}
let current = "geral"
let currentObj = {}

for(let line of lines){

// 🧩 NOVA SEÇÃO
if(
  line === line.toUpperCase() &&
  line.length < 60 &&
  !line.includes(":")
){
  pushObj()
  current = normalizeKey(line)
  if(!result[current]) result[current] = []
  continue
}

// 🔑 chave: valor
if(line.includes(":")){
  let [k,...v] = line.split(":")
  let key = normalizeKey(k)
  let value = v.join(":").trim()

  // 🔥 se chave repetir → novo objeto (ex: múltiplas restrições)
  if(currentObj[key] !== undefined){
    pushObj()
  }

  currentObj[key] = value
}

}

pushObj()

return result

// ======================
function pushObj(){
  if(Object.keys(currentObj).length){
    if(!result[current]) result[current] = []
    result[current].push(currentObj)
    currentObj = {}
  }
}

}

// ============================
// 🧹 LIMPAR TEXTO
// ============================
function cleanString(str){

return str
.replace(/©.*$/gmi,"")
.replace(/HydraCore/gi,"")
.replace(/ObitoSpam/gi,"")
.replace(/════════.*════════/g,"")
.replace(/[^\S\r\n]+/g," ")
.trim()

}

// ============================
// 🔑 NORMALIZAR CHAVE
// ============================
function normalizeKey(key){
return key
.toLowerCase()
.replace(/[^\w\s]/g,"")
.replace(/\s+/g,"_")
}

// ============================
// 📦 RESPONSE
// ============================
function json(obj){
return new Response(JSON.stringify(obj,null,2),{
  headers:{"Content-Type":"application/json"}
})
}

export default {
async fetch(request){

const url = new URL(request.url)
const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🏠 HOME
// ============================
if(path === ""){
  return new Response(html(), {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  })
}

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["VIP_123","ifnvip"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido"})
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "cpf") return handleCPF(url)
if(path === "nome") return handleNome(url)
if(path === "placa") return handlePlaca(url)
if(path === "telefone") return handleTelefone(url)

return json({status:false,message:"Endpoint não encontrado"})
}
}

// ============================
// 🏠 HTML HOME
// ============================
function html(){
return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro API</title>

<style>
body{
background:#020617;
color:#fff;
font-family:sans-serif;
padding:20px;
text-align:center;
}
.card{
background:#0b1228;
padding:15px;
border-radius:12px;
margin:10px;
cursor:pointer;
}
input{
width:90%;
padding:10px;
margin:5px;
border-radius:8px;
border:none;
}
button{
padding:10px;
border:none;
border-radius:8px;
background:#3b82f6;
color:#fff;
margin-top:10px;
}
#result{
margin-top:20px;
text-align:left;
white-space:pre-wrap;
}
</style>

</head>
<body>

<h2>🚀 Astro API</h2>

<div class="card" onclick="openModal('cpf')">CPF</div>
<div class="card" onclick="openModal('nome')">Nome</div>
<div class="card" onclick="openModal('telefone')">Telefone</div>
<div class="card" onclick="openModal('placa')">Placa</div>

<div id="modal" style="display:none;">
<br>
<input id="token" placeholder="Token">
<input id="valor" placeholder="Valor">
<br>
<button onclick="consultar()">Consultar</button>
</div>

<div id="result"></div>

<script>
let type="";

function openModal(t){
type=t;
document.getElementById("modal").style.display="block";
}

async function consultar(){

let token = document.getElementById("token").value;
let valor = document.getElementById("valor").value;

if(!token || !valor){
alert("Preencha tudo");
return;
}

let url = "";

if(type==="cpf") url=\`/cpf?token=\${token}&cpf=\${valor}\`
if(type==="nome") url=\`/nome?token=\${token}&nome=\${encodeURIComponent(valor)}\`
if(type==="telefone") url=\`/telefone?token=\${token}&telefone=\${valor}\`
if(type==="placa") url=\`/placa?token=\${token}&placa=\${valor}\`

document.getElementById("result").innerText="🔎 Consultando...";

try{
const res = await fetch(url);
const data = await res.json();

document.getElementById("result").innerText = JSON.stringify(data,null,2);

}catch(e){
document.getElementById("result").innerText="Erro na consulta";
}

}
</script>

</body>
</html>`
}

// ============================
// 🔎 CPF
// ============================
async function handleCPF(url){

const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,message:"CPF não informado"})
}

const api = \`https://obitostore.shop/api/consulta/cpf?cpf=\${cpf}&apikey=bigmouthh\`

try{
  const res = await fetch(api)
  const data = await res.json()
  return json({status:true,result:normalize(data)})
}catch{
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Nome
// ============================
async function handleNome(url){

const nome = url.searchParams.get("nome")
if(!nome){
  return json({status:false,message:"Nome não informado"})
}

const api = \`https://obitostore.shop/api/consulta/nome3?nome=\${nome}&apikey=bigmouthh\`

try{
  const res = await fetch(api)
  const data = await res.json()
  return json({status:true,result:normalize(data)})
}catch{
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Telefone
// ============================
async function handleTelefone(url){

const telefone = url.searchParams.get("telefone")
if(!telefone){
  return json({status:false,message:"Telefone não informado"})
}

const api = \`https://obitostore.shop/api/consulta/telefone?query=\${telefone}&apikey=bigmouthh\`

try{
  const res = await fetch(api)
  const data = await res.json()
  return json({status:true,result:normalize(data)})
}catch{
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 Placa
// ============================
async function handlePlaca(url){

const placa = url.searchParams.get("placa")
if(!placa){
  return json({status:false,message:"Placa não informada"})
}

const api = \`https://obitostore.shop/api/consulta/placa2?placa=\${placa}&apikey=bigmouthh\`

try{
  const res = await fetch(api)
  const data = await res.json()
  return json({status:true,result:normalize(data)})
}catch{
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🧠 NORMALIZADOR
// ============================
function normalize(data){

if(typeof data === "string"){
  return data
}

if(data.resultado){
  return data.resultado
}

return data
}

// ============================
// 📦 RESPONSE
// ============================
function json(obj){
return new Response(JSON.stringify(obj,null,2),{
  headers:{"Content-Type":"application/json"}
})
}
}

/* HEADER */
.header{
 padding:20px;
 text-align:center;
 font-weight:800;
 font-size:22px;
}
.header span{color:var(--blue);}

/* BOX */
.api-box{
 margin:15px;
 padding:15px;
 border-radius:20px;
 background:rgba(255,255,255,0.02);
}

/* CARD */
.card{
 margin-top:12px;
 padding:16px;
 border-radius:16px;
 background:rgba(255,255,255,0.02);
 transition:.3s;
}
.card{
 position:relative;
 overflow:hidden;
}

.card::before{
 content:"";
 position:absolute;
 inset:0;
 background:radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(59,130,246,.25), transparent 60%);
 opacity:0;
 transition:.2s;
}

.card:hover::before{
 opacity:1;
}

.card:hover{
 transform:translateY(-6px) scale(1.03);
 box-shadow:
 0 10px 40px rgba(59,130,246,.25),
 inset 0 0 20px rgba(59,130,246,.1);
}
.card:active{transform:scale(.96);}

.tag{
 background:rgba(59,130,246,0.2);
 color:var(--blue);
 padding:4px 8px;
 border-radius:6px;
 font-size:11px;
}

.desc{font-size:12px;opacity:.6;margin-top:5px;}

.btn{
 margin-top:12px;
 width:100%;
 padding:10px;
 border-radius:10px;
 border:none;
 background:rgba(59,130,246,0.15);
 border:1px solid rgba(59,130,246,0.3);
 color:#fff;
 font-size:13px;
 transition:.2s;
}

.btn:hover{
 background:rgba(59,130,246,0.25);
}

/* PLANOS */
.plan-box{
 margin:20px auto;
 max-width:420px;
 padding:10px;
}

.plan{
 margin-top:10px;
 padding:12px;
 border-radius:14px;
 background:rgba(255,255,255,0.03);
 border:1px solid rgba(255,255,255,0.05);
 transition:.25s ease;
 position:relative;
}

.plan:hover{
 transform:translateY(-2px);
 border-color:rgba(59,130,246,.4);
}

/* título */
.plan-title{
 font-size:13px;
 font-weight:600;
}

/* preço */
.price{
 font-size:18px;
 font-weight:700;
 margin:4px 0;
}

/* benefícios */
.features{
 font-size:11px;
 opacity:.7;
 display:flex;
 flex-direction:column;
 gap:2px;
 margin-bottom:10px;
}

/* botão */
.buy{
 position:relative;
 overflow:hidden;
}

.buy::after{
 content:"";
 position:absolute;
 width:300%;
 height:300%;
 top:50%;
 left:50%;
 transform:translate(-50%,-50%) scale(0);
 background:radial-gradient(circle, rgba(59,130,246,.4), transparent 60%);
 transition:.5s;
}

.buy:active::after{
 transform:translate(-50%,-50%) scale(1);
}

.buy:hover{
 background:rgba(59,130,246,.25);
}

/* destaque (mensal) */
.plan.highlight{
  border:1px solid rgba(59,130,246,.6);
  background:rgba(59,130,246,.08);
  box-shadow:0 0 20px rgba(59,130,246,.15);
}

/* badge minimalista */
.badge{
 position:absolute;
 top:8px;
 right:10px;
 font-size:9px;
 padding:3px 6px;
 border-radius:6px;
 background:rgba(255,255,255,0.06);
 border:1px solid rgba(255,255,255,0.1);
 color:#ccc;
}

.plan:active{
 transform:scale(.98);
}

.plan-box strong{
 display:block;
 margin-bottom:6px;
 font-size:13px;
 opacity:.7;
}

/* MODAL */
.modal{
 position:fixed;
 inset:0;
 backdrop-filter:blur(10px);
 background:rgba(0,0,0,0.6);
 display:none;
 justify-content:center;
 align-items:center;
}

.modal-box{
 width:92%;
 max-width:420px;
 max-height:90vh;
 overflow:auto;

 background:linear-gradient(180deg,rgba(15,23,42,.95),rgba(2,6,23,.95));
 border:1px solid rgba(255,255,255,0.06);

 border-radius:24px;
 padding:20px;

 box-shadow:
  0 10px 40px rgba(0,0,0,.6),
  inset 0 0 20px rgba(59,130,246,.05);

 position:relative;
 animation:fadeIn .35s ease;
 backdrop-filter: blur(20px);
}

@keyframes fadeIn{
 0%{
  opacity:0;
  transform:translateY(40px) scale(.9);
  filter:blur(10px);
 }
 100%{
  opacity:1;
  transform:translateY(0) scale(1);
  filter:blur(0);
 }
}

/* INPUT */
.input{
 width:100%;
 padding:12px;
 margin-top:10px;
 border-radius:12px;
 border:none;
 background:#0b1228;
 color:#fff;
}

/* ROTA */
.route-box{
 margin-top:10px;
 background:#020617;
 padding:10px;
 border-radius:10px;
 font-size:11px;
 display:flex;
 justify-content:space-between;
 align-items:center;
}

/* RESULT */
.result-box{
 margin-top:12px;
 position:relative;
}

.section-title{
 font-size:11px;
 opacity:.6;
 margin-bottom:6px;
 text-transform:uppercase;
 letter-spacing:.5px;
}

.section{
 margin-top:10px;
 background:rgba(255,255,255,0.015);
 padding:10px;
 border-radius:12px;
 border:1px solid rgba(255,255,255,0.06);
}

.item{
 font-size:12px;
 display:flex;
 justify-content:space-between;
 padding:8px;
 border-radius:8px;
 margin-top:6px;
 background:rgba(255,255,255,0.015);
 border:1px solid rgba(255,255,255,0.04);
}

.item span:first-child{
 opacity:.6;
}

.item span:last-child{
 font-weight:500;
 color:#e2e8f0;
}


/* LOADING */
.loader{
 margin-top:10px;
 height:40px;
 border-radius:10px;
 background:linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%);
 background-size:200%;
 animation:load 1s infinite;
}

@keyframes load{
 0%{background-position:200%}
 100%{background-position:-200%}
}

/* SCAN EFFECT */
.scan{
 position:absolute;
 inset:0;
 background:linear-gradient(transparent,rgba(59,130,246,.15),transparent);
 animation:scan 1.5s infinite;
 pointer-events:none;
 border-radius:20px;
}

@keyframes scan{
 0%{transform:translateY(-100%)}
 100%{transform:translateY(100%)}
}

#toast{
 position:fixed;
 bottom:20px;
 left:50%;
 transform:translateX(-50%) translateY(100px);
 background:#111827;
 padding:10px 20px;
 border-radius:10px;
 font-size:12px;
 opacity:0;
 transition:.3s;
}
#toast.show{
 transform:translateX(-50%) translateY(0);
 opacity:1;
}

/* TAG BASE (mantém essa) */
.tag{
  display:inline-flex;
  align-items:center;

  font-size:10px;
  font-weight:600;
  letter-spacing:.3px;

  padding:4px 10px;
  border-radius:999px;

  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);

  color:#e2e8f0;

  transition:.2s;
}

/* 🟢 padrão ativo */
.tag.active{
  background:rgba(34,197,94,0.15);
  border-color:rgba(34,197,94,0.3);
  color:#4ade80;
}

/* 🔴 OFF */
.tag.off{
  background:rgba(239,68,68,0.15);
  border-color:rgba(239,68,68,0.3);
  color:#f87171;
}

/* 🟡 BETA */
.tag.beta{
  background:rgba(251,191,36,0.15);
  border-color:rgba(251,191,36,0.3);
  color:#facc15;
}

/* 🔥 OFERTA */
.tag.offer{
  background:rgba(239,68,68,0.15);
  border-color:rgba(239,68,68,0.4);
  color:#ef4444;
}

/* ⭐ MAIS VENDIDO (clean) */
.tag.best{
  background:rgba(251,191,36,0.15);
  border-color:rgba(251,191,36,0.35);
  color:#fbbf24;
}

/* animações */
@keyframes pulseNew{
  0%{
    box-shadow:
      0 0 10px rgba(59,130,246,.5),
      inset 0 0 5px rgba(255,255,255,.15);
  }
  50%{
    box-shadow:
      0 0 18px rgba(59,130,246,.9),
      inset 0 0 8px rgba(255,255,255,.25);
  }
  100%{
    box-shadow:
      0 0 10px rgba(59,130,246,.5),
      inset 0 0 5px rgba(255,255,255,.15);
  }
}

@keyframes shine{
  0%{ left:-100%; }
  100%{ left:120%; }
}

/* hover suave */
.tag:hover{
  background: rgba(59,130,246,0.12);
  border-color: rgba(59,130,246,0.4);
  color:#fff;
}

.input-group{
 margin-top:10px;
 display:flex;
 flex-direction:column;
 gap:4px;
}

.input-label{
 font-size:11px;
 opacity:.6;
}

.input{
 width:100%;
 padding:10px;
 border-radius:10px;
 border:1px solid transparent;
 background:#0b1228;
 color:#fff;
 transition:.2s;
}

.input:focus{
 outline:none;
 border-color:#3b82f6;
 box-shadow:0 0 0 2px rgba(59,130,246,.2);
}

.card-top{
 display:flex;
 justify-content:space-between;
 align-items:center;
 margin-bottom:6px;
}

.card strong{
 font-size:14px;
}

/* WELCOME MODAL */
.welcome-modal{
 display:none;
 position:fixed;
 inset:0;
 display:flex;
 justify-content:center;
 align-items:center;

 background:rgba(0,0,0,0.65);
 backdrop-filter:blur(12px);

 z-index:999;
 animation:fadeBg .5s ease;
}

@keyframes fadeBg{
 from{opacity:0}
 to{opacity:1}
}

.welcome-box{
 width:90%;
 max-width:400px;

 padding:30px 20px;
 border-radius:26px;

 background:linear-gradient(180deg,rgba(15,23,42,.95),rgba(2,6,23,.95));
 border:1px solid rgba(255,255,255,0.06);

 text-align:center;

 box-shadow:
 0 20px 60px rgba(0,0,0,.8),
 inset 0 0 30px rgba(59,130,246,.08);

 animation:popUp .5s ease;
}

@keyframes popUp{
 from{transform:translateY(40px) scale(.9); opacity:0}
 to{transform:translateY(0) scale(1); opacity:1}
}

.welcome-icon{
 font-size:40px;
 margin-bottom:10px;
 filter:drop-shadow(0 0 10px rgba(59,130,246,.6));
}

.welcome-box h2{
 font-size:18px;
 margin-bottom:10px;
}

.welcome-box p{
 font-size:13px;
 opacity:.7;
 margin-bottom:20px;
 line-height:1.5;
}

.enter-btn{
 width:100%;
 padding:12px;
 border-radius:12px;
 border:none;

 background:linear-gradient(90deg,#3b82f6,#2563eb);
 color:#fff;
 font-weight:600;

 cursor:pointer;
 transition:.3s;
}

.enter-btn:hover{
 transform:scale(1.03);
 box-shadow:0 0 20px rgba(59,130,246,.5);
}

.no-show{
 margin-top:12px;
 font-size:11px;
 opacity:.6;
 display:flex;
 justify-content:center;
 gap:6px;
}

@keyframes glow {
    0% { box-shadow: 0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.2) inset; }
    50% { box-shadow: 0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.3) inset; }
    100% { box-shadow: 0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.2) inset; }
}

/* FOTO CARD ANIMAÇÃO */
.foto-card{
  width:220px;
  margin:20px auto;
  padding:12px;
  border-radius:28px;

  background:linear-gradient(145deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95));
  border:1px solid rgba(255,255,255,0.06);

  display:flex;
  flex-direction:column;
  align-items:center;

  opacity:0;
  transform:translateY(20px) scale(.95);
  animation:fotoIn .5s ease forwards;

  box-shadow:
    0 10px 40px rgba(0,0,0,.6),
    inset 0 0 20px rgba(59,130,246,.05);
}

@keyframes fotoIn{
  to{
    opacity:1;
    transform:translateY(0) scale(1);
  }
}

.foto-img{
  width:200px;
  height:200px;
  border-radius:16px;
  object-fit:cover;

  transition:.4s;
  box-shadow:0 0 0 rgba(59,130,246,0);
}

.foto-img:hover{
  transform:scale(1.05);
  box-shadow:0 0 25px rgba(59,130,246,.6);
}

/* BOTÕES MODERNOS */
.action-btn{
  width:100%;
  margin-top:10px;
  padding:10px;

  border-radius:12px;
  border:1px solid rgba(255,255,255,0.08);

  background:linear-gradient(135deg, rgba(59,130,246,.2), rgba(37,99,235,.25));
  color:#fff;

  font-size:12px;
  font-weight:600;

  backdrop-filter:blur(10px);

  display:flex;
  justify-content:center;
  align-items:center;
  gap:6px;

  cursor:pointer;
  transition:.25s;
}

.action-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 25px rgba(59,130,246,.3);
  border-color:rgba(59,130,246,.4);
}

.action-btn:active{
  transform:scale(.96);
}

/* VITALÍCIO TURBINADO */
.plan.premium{
  border:1px solid rgba(168,85,247,.5);
  background:linear-gradient(180deg, rgba(168,85,247,.08), rgba(2,6,23,.95));

  box-shadow:
    0 10px 40px rgba(0,0,0,.6),
    0 0 30px rgba(168,85,247,.15);

  position:relative;
  overflow:hidden;
}

/* glow suave respirando */
.plan.premium::before{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:14px;

  background:linear-gradient(120deg, transparent, rgba(168,85,247,.4), transparent);
  opacity:.2;

  animation: premiumGlow 4s linear infinite;
}

@keyframes premiumGlow{
  0%{ transform:translateX(-100%); }
  100%{ transform:translateX(100%); }
}

/* brilho animado */
.plan.premium{
  border:1px solid rgba(168,85,247,.5);
  background:rgba(168,85,247,.06);
  box-shadow:0 0 25px rgba(168,85,247,.15);
}

.tag.best{
  background:rgba(251,191,36,0.10);
  border-color:rgba(251,191,36,0.25);
  color:#facc15;

  box-shadow:
    0 0 14px rgba(251,191,36,.8),
    inset 0 0 6px rgba(255,255,255,.3);

  animation: pulseBest 1.6s infinite;
}

/* botão */
.vip-btn{
  background:rgba(59,130,246,.2);
  border:1px solid rgba(59,130,246,.4);
  font-weight:600;
}

.vip-btn:hover{
  background:rgba(59,130,246,.3);
  box-shadow:0 0 15px rgba(59,130,246,.3);
}

/* contador piscando */
#timer{
  opacity:.7;
}

@keyframes pulseTimer{
  0%{opacity:1}
  50%{opacity:.5}
  100%{opacity:1}
}

@keyframes pulsePromo{
  0%{ transform:scale(1); }
  50%{ transform:scale(1.08); }
  100%{ transform:scale(1); }
}

.promo-timer{
  font-size:11px;
  margin:6px 0;
  font-weight:600;
  color:#fbbf24;
  opacity:.9;
}

.tag:hover{
  opacity:.85;
}

.plan-header{
  display:flex;
  gap:6px;
  margin-bottom:6px;
}

/* partículas minimalistas */
.tag::after{
  content:"";
  position:absolute;
  inset:0;
  border-radius:999px;
  opacity:0;
  background:radial-gradient(circle, rgba(255,255,255,.4), transparent 70%);
  transition:.3s;
}

.tag:hover::after{
  opacity:.4;
}

/* MAIS VENDIDO (melhorado) */
.tag.best{
  background:rgba(251,191,36,0.18);
  border-color:rgba(251,191,36,0.5);
  color:#facc15;

  box-shadow:0 0 10px rgba(251,191,36,.6);
  animation:pulseBest 1.4s infinite;
}

/* VITALÍCIO = amarelo premium */
.tag.lifetime{
  background:linear-gradient(135deg, rgba(168,85,247,0.18), rgba(59,130,246,0.12));
  border:1px solid rgba(168,85,247,0.5);

  color:#c4b5fd;

  box-shadow:
    0 0 12px rgba(168,85,247,.5),
    inset 0 0 6px rgba(255,255,255,.2);

  backdrop-filter:blur(6px);
}

/* ⭐ partículas nas tags premium */
.tag.best{
  background:linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.08));
  border:1px solid rgba(251,191,36,0.5);
  color:#facc15;

  box-shadow:
    0 0 10px rgba(251,191,36,.5),
    inset 0 0 6px rgba(255,255,255,.2);

  backdrop-filter:blur(6px);

  animation: pulseBest 2s infinite;
}

/* estrelas pequenas */
.tag.best::before,
.tag.lifetime::before{
  content:"";
  position:absolute;
  width:2px;
  height:2px;
  background:rgba(255,255,255,.9);
  border-radius:50%;

  top:20%;
  left:10%;

  box-shadow:
    10px 6px rgba(255,255,255,.7),
    20px 2px rgba(255,255,255,.6),
    30px 8px rgba(255,255,255,.5);

  animation:starsMove 6s linear infinite;
  opacity:.6;
}

/* movimento suave */
@keyframes starsMove{
  0%{
    transform:translateX(0) translateY(0);
    opacity:.2;
  }
  50%{
    opacity:.8;
  }
  100%{
    transform:translateX(20px) translateY(-10px);
    opacity:.2;
  }
}

.old-price{
  text-decoration:line-through;
  opacity:.4;
  font-size:12px;
  margin-right:6px;
}

.new-price{
  font-size:18px;
  font-weight:700;
}

</style>
</head>

<body>

<canvas id="bg"></canvas>

<div class="header">Astro <span>Search</span></div>

<!-- Consultas -->
<div class="api-box">
  <strong>Consultas</strong>

<div class="card" data-type="cpf" onclick="openModal('cpf')">
  <div class="card-top">
    <strong>CPF</strong>
  </div>
  <div class="desc">Dados completos, vínculos e score</div>
</div>

<div class="card" data-type="cpf2" onclick="openModal('cpf2')">
  <div class="card-top">
    <strong>CPF 2</strong>
  </div>
  <div class="desc">Dados avançados, análise e inteligência</div>
</div>

<div class="card" data-type="foto" onclick="openModal('foto')">
  <div class="card-top">
    <strong>Foto</strong>
  </div>
  <div class="desc">Consulta de foto por CPF</div>
</div>

<div class="card" data-type="nome" onclick="openModal('nome')">
  <div class="card-top">
    <strong>Nome</strong>
  </div>
  <div class="desc">Localização por nome</div>
</div>

<div class="card" data-type="tel" onclick="openModal('tel')">
  <div class="card-top">
    <strong>Telefone</strong>
  </div>
  <div class="desc">Dados e localização</div>
</div>

<div class="card" data-type="placa" onclick="openModal('placa')">
  <div class="card-top">
    <strong>Placa</strong>
  </div>
  <div class="desc">Dados completos do carro</div>
</div>

<!-- Planos -->
<div class="plan-box">
  <strong>Planos</strong>

<div id="onlineBox" style="
  margin:10px 0;
  font-size:12px;
  opacity:.8;
  display:flex;
  align-items:center;
  gap:6px;
">
  <span style="color:#22c55e;">●</span>
  <span id="onlineCount">15</span> pessoas online agora
</div>

  <!-- Diário -->
<div class="plan">

<div class="plan-header">
  <span class="tag offer">OFERTA</span>
</div>

<div class="plan-title">Diário</div>

  <div class="promo-timer" id="timer-day">⏳ Carregando...</div>

<div class="price">
  <span class="old-price">R$10</span>
  <span class="new-price">R$4,99</span>
</div>

  <div class="features">
    <div>✔ Acesso por 24h</div>
    <div>✔ Consultas básicas</div>
  </div>

  <button class="btn buy" onclick="buy()">Testar agora</button>
</div>

  <!-- Mensal (DESTAQUE) -->
<div class="plan highlight">

  <div class="plan-header">
    <span class="tag offer">OFERTA</span>
    <span class="tag best">MAIS VENDIDO</span>
  </div>

<div class="plan-title">Mensal</div>

<div class="promo-timer" id="timer-month">⏳ Carregando...</div>

<div class="price">
  <span class="old-price">R$30</span>
  <span class="new-price">R$19,99</span>
</div>

<div class="features">
    <div>✔ Acesso ilimitado</div>
    <div>✔ Consultas rápidas</div>
    <div>✔ Novas bases incluídas</div>
  </div>

  <button class="btn buy">Assinar agora</button>
</div>

  <!-- Vitalício -->
<div class="plan premium" id="plan-vip">

  <div class="plan-header">
    <span class="tag offer">OFERTA</span>
    <span class="tag lifetime">VITALÍCIO</span>
  </div>

  <div class="plan-title">Vitalício</div>

<div class="price">
  <span class="old-price">R$50</span>
  <span class="new-price">R$29,99</span>
</div>

  <div id="timer" class="promo-timer">
    ⏳ Carregando tempo...
  </div>

  <div class="features">
    <div>✔ Acesso vitalício</div>
    <div>✔ Todas consultas liberadas</div>
    <div>✔ Prioridade máxima</div>
    <div>✔ Sem limites</div>
  </div>

  <button class="btn buy vip-btn" onclick="buy()">
    🚀 Desbloquear agora
  </button>

</div>

<div class="modal" id="modal">
  <div class="modal-box">

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 id="title" style="font-size:16px;font-weight:600;"></h3>
      <span onclick="closeModal()" style="cursor:pointer;opacity:.6;">✕</span>
    </div>

<div class="input-group">
  <div class="input-label">Token</div>
  <input id="token" class="input">
</div>

<div class="input-group">
  <div class="input-label" id="inputLabel">Valor</div>
  <input id="input" class="input">
</div>

    <div class="route-box">
      <span id="route"></span>
      <button onclick="copyRoute()">📋</button>
    </div>

    <button class="btn" onclick="callAPI()">Consultar</button>

    <div id="loading"></div>
    <div id="result" class="result-box"></div>

  </div>
</div>

<!-- MODAL BOAS-VINDAS -->
<div class="welcome-modal" id="welcomeModal">
  <div class="welcome-box">

    <div class="welcome-icon">🚀</div>

    <h2>Bem-vindo ao Astro Search</h2>

    <p>
      Plataforma completa para consultas avançadas.<br>
      Acesse dados com rapidez, precisão e segurança.
    </p>

    <div class="welcome-actions">
      <button class="enter-btn" onclick="closeWelcome()">Entrar</button>
    </div>

  </div>
</div>

<script>

const result = document.getElementById("result");

let type="";

/* ⭐ ESTRELAS */
const c=document.getElementById("bg");
const ctx=c.getContext("2d");
c.width=innerWidth;
c.height=innerHeight;

let stars=[];
for(let i=0;i<80;i++){
 stars.push({
  x:Math.random()*c.width,
  y:Math.random()*c.height,
  baseSpeed: Math.random()*0.3,
  speed: Math.random()*0.3
 });
}

let starSize = 1;
let globalSpeed = 1;
let glowBoost = 0;

function animate(){
 ctx.clearRect(0,0,c.width,c.height);

 stars.forEach(s=>{
  s.y += s.baseSpeed * globalSpeed;

  if(s.y > c.height) s.y = 0;

  // brilho dinâmico
  const opacity = 0.4 + glowBoost;

  ctx.fillStyle = `rgba(59,130,246,${opacity})`;
ctx.fillRect(s.x, s.y, starSize, starSize);
 });

 requestAnimationFrame(animate);
}

/* ELEMENTOS */
const tokenInput = document.getElementById("token");
const mainInput = document.getElementById("input");

tokenInput.addEventListener("input", updateRoute);
mainInput.addEventListener("input", updateRoute);

/* MODAL */
function openModal(t){
 type=t;
 modal.style.display="flex";
 result.innerHTML="";
 loading.innerHTML="";

if(t==="cpf"){title.innerText="Consulta CPF"; inputLabel.innerText="CPF";}
if(t==="cpf2"){title.innerText="Consulta CPF 2"; inputLabel.innerText="CPF";}
if(t==="foto"){title.innerText="Consulta Foto"; inputLabel.innerText="CPF";}
if(t==="nome"){title.innerText="Consulta Nome"; inputLabel.innerText="Nome";}
if(t==="tel"){title.innerText="Consulta Telefone"; inputLabel.innerText="Telefone";}
if(t==="placa"){title.innerText="Consulta Placa"; inputLabel.innerText="Placa";}

 updateRoute();
}

function closeModal(){
 modal.style.display="none";
}

/* ROTA */
function updateRoute(){
 let token=tokenInput.value||"TOKEN";
 let val=mainInput.value||"VALOR";

 let r="";
 if(type==="cpf") r=`/api/cpf.php?token=${token}&cpf=${val}`;
 if(type==="cpf2") r=`/api/cpf2.php?token=${token}&cpf=${val}`;
 if(type==="foto") r=`/api/foto.php?token=${token}&cpf=${val}`;
 if(type==="nome") r=`/api/nome.php?token=${token}&nome=${encodeURIComponent(val)}`;
 if(type==="tel") r=`/api/telefone.php?token=${token}&telefone=${val}`;
 if(type==="placa") r=`/api/placa.php?token=${token}&placa=${val}`;

 route.innerText=r;
}

let online = 15;

function fakeOnline(){

  const el = document.getElementById("onlineCount");

  const change = Math.random();

  if(change < 0.4) online--;
  else if(change > 0.6) online++;

  if(online < 9) online = 9;
  if(online > 23) online = 23;

  el.innerText = online;

  const time = Math.random() * 2000 + 1500; // 1.5s a 3.5s
  setTimeout(fakeOnline, time);
}

fakeOnline();

/* WELCOME CONTROL */

window.addEventListener("load", () => {
  setTimeout(()=>{
    document.getElementById("welcomeModal").style.display = "flex";
    document.body.style.overflow = "hidden";

    // 🚀 acelera estrelas
    globalSpeed = 4;
    glowBoost = 0.6;

    // suaviza de volta
    setTimeout(()=>{
      globalSpeed = 1;
      glowBoost = 0;
    }, 1200);

  }, 400);
});

function closeWelcome(){
  const modal = document.getElementById("welcomeModal");

  modal.style.opacity = "0";
  modal.style.transform = "scale(1.1)";

  globalSpeed = 6;
  glowBoost = 1;
  starSize = 2;

  // desaceleração suave
  let t = 0;
  const interval = setInterval(()=>{
    t += 0.05;

    globalSpeed = 6 - (5 * t);
    glowBoost = 1 - t;
    starSize = 2 - t;

    if(t >= 1){
      clearInterval(interval);

      globalSpeed = 1;
      glowBoost = 0;
      starSize = 1;

      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }, 20);
}

/* COPY */
function copyRoute(){
 navigator.clipboard.writeText(route.innerText);
}

/* FORMATADOR */
function render(obj){

 let html = "";

 for(let key in obj){

  let value = obj[key];

  // 🔥 NULL / UNDEFINED
  if(value === null || value === undefined){
    html += `<div class="item"><span>${key}</span><span>null</span></div>`;
    continue;
  }

  // 🔥 ARRAY
  if(Array.isArray(value)){

    html += `
    <div class="section">
      <div class="section-title">${key} (${value.length})</div>
    `;

    value.forEach((v,i)=>{

      // array de objetos (EX: vizinhos)
      if(typeof v === "object"){

        html += `
        <div class="section" style="margin-top:8px;background:#030a1a;">
          <div class="section-title">#${i+1}</div>
          ${render(v)}
        </div>
        `;

      } else {
        html += `<div class="item">${v}</div>`;
      }

    });

    html += `</div>`;
    continue;
  }

  // 🔥 OBJETO
  if(typeof value === "object"){

    html += `
    <div class="section">
      <div class="section-title">${key}</div>
      ${render(value)}
    </div>
    `;
    continue;
  }

  // 🔥 VALOR NORMAL
  html += `
  <div class="item">
    <span>${key}</span>
    <span>${value}</span>
  </div>`;
 }

 return html;
}

/* MOSTRA ERROS DE TOKEN OU OUTROS */
/* MOSTRA ERROS DE TOKEN OU OUTROS */
function showAPIError(data){
    let html = '';

    // Nenhum dado retornado
    if(!data){
        html = `
        <div class="section" style="text-align:center;">
            <div style="font-size:36px; margin-bottom:10px;">🔍</div>
            <div style="font-weight:600; font-size:14px;">Nenhum registro encontrado.</div>
            <div style="font-size:12px; opacity:.7; margin-top:4px;">
                Tente novamente em alguns instantes e confira os dados.
            </div>
        </div>`;
        result.innerHTML = html;
        return;
    }

    const code = data.error_code || data.error || null;
    const texto = data.msg || data.message || null;

    // Mensagens específicas
    if(code === "AUTH_001"){
        html = `
        <div class="section" style="text-align:center; padding:20px; border-radius:12px; background:rgba(255,0,0,0.05); border:1px solid rgba(255,0,0,0.2);">
            <div style="font-size:28px; margin-bottom:8px;">⚠️</div>
            <div style="font-weight:600; margin-bottom:6px;">Token inválido</div>
            <div style="font-size:12px; opacity:.7; margin-bottom:12px;">
                Adquira um plano para obter acesso completo.
            </div>
            <button class="buy" style="width:auto;padding:8px 16px;" onclick="goToPlans()">Ver Planos</button>
        </div>`;
    } else if(code === "REQ_001"){
        html = `
        <div class="section" style="text-align:center;">
            <div style="font-size:28px; margin-bottom:8px;">⚠️</div>
            <div style="font-weight:600; margin-bottom:6px;">Parâmetros incompletos</div>
            <div style="font-size:12px; opacity:.7;">
                Por favor, preencha todos os campos obrigatórios e tente novamente.
            </div>
        </div>`;
    } else if(code === "SEM_CREDITOS"){
        html = `
        <div class="section" style="text-align:center; padding:20px; border-radius:12px; background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.2);">
            <div style="font-size:28px; margin-bottom:8px;">💰</div>
            <div style="font-weight:600; margin-bottom:6px;">Créditos insuficientes</div>
            <div style="font-size:12px; opacity:.7; margin-bottom:12px;">
                Adquira créditos para continuar consultando.
            </div>
            <button class="buy" style="width:auto;padding:8px 16px;" onclick="goToPlans()">Ver Planos</button>
        </div>`;
    } else if(texto){
        html = `
        <div class="section" style="text-align:center;">
            <div style="font-size:28px; margin-bottom:8px;">⚠️</div>
            <div style="font-weight:600; margin-bottom:6px;">${texto}</div>
        </div>`;
    } else {
        html = `
        <div class="section" style="text-align:center;">
            <div style="font-size:28px; margin-bottom:8px;">⚠️</div>
            <div style="font-weight:600; margin-bottom:6px;">Erro desconhecido</div>
            <div style="font-size:12px; opacity:.7;">
                Tente novamente em alguns instantes.
            </div>
        </div>`;
    }

    result.innerHTML = html;
}

/* FUNÇÃO PRINCIPAL DE CHAMADA DA API */
async function callAPI(){

    let t = tokenInput.value;
    let v = mainInput.value;

    if(!t || !v){
        result.innerHTML = "<div class='section'>Preencha todos os campos.</div>";
        return;
    }

    loading.innerHTML=`
    <div class="loader"></div>
    <div style="font-size:12px;margin-top:6px;opacity:.7;">
     🔎 Varredura em bancos de dados...
    </div>
    <div class="scan"></div>
    `;

    result.innerHTML="";

    let url="";
    if(type==="cpf") url=`/api/cpf.php?token=${t}&cpf=${v}`;
    if(type==="cpf2") url=`/api/cpf2.php?token=${t}&cpf=${v}`;
    if(type==="foto") url=`/api/foto.php?token=${t}&cpf=${v}`;
    if(type==="nome") url=`/api/nome.php?token=${t}&nome=${encodeURIComponent(v)}`;
    if(type==="tel") url=`/api/telefone.php?token=${t}&telefone=${v}`;
    if(type==="placa") url=`/api/placa.php?token=${t}&placa=${v}`;

    try{
        await new Promise(r=>setTimeout(r,1200)); // simula loading

        const r = await fetch(url);
        const data = await r.json();

        loading.innerHTML="";

        // 🔥 FOTO
if(type === "foto"){

    let fotoLink = data.foto_url;

    // 🔥 corrige caminho relativo
    if(fotoLink && !fotoLink.startsWith("http")){
        fotoLink = window.location.origin + "/" + fotoLink;
    }

    if(!data.status || !fotoLink){
        showAPIError(data);
        return;
    }

    result.innerHTML = "";

    const fotoCard = document.createElement("div");
    fotoCard.style.width = "220px";
    fotoCard.style.margin = "20px auto";
    fotoCard.style.padding = "10px";
    fotoCard.style.borderRadius = "28px";
    fotoCard.style.background = "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95))";
    fotoCard.style.display = "flex";
    fotoCard.style.flexDirection = "column";
    fotoCard.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = fotoLink;

    img.style.width = "200px";
    img.style.height = "200px";
    img.style.borderRadius = "16px";
    img.style.objectFit = "cover";

    // 🔥 debug erro imagem
    img.onerror = () => {
        result.innerHTML = `
        <div class="section" style="text-align:center;">
          <div style="font-size:30px;">🖼️</div>
          <div style="margin-top:6px;font-weight:600;">Imagem não carregou</div>
          <div style="font-size:12px;opacity:.7;">
            Caminho: ${fotoLink}
          </div>
        </div>`;
    };

    const btn = document.createElement("button");
    btn.className = "action-btn";
    btn.innerText = "📋 Copiar link";
    btn.onclick = () => copyLink(fotoLink);

    fotoCard.appendChild(img);
    fotoCard.appendChild(btn);
    result.appendChild(fotoCard);

    return;
}

        // ❌ SE STATUS FOR FALSE, EXIBE ERRO
        if(!data.status){
    showAPIError(data);
    return;
}

        // pega os dados principais
        let res = data.dados || data.resultado || data;

        if(!res || Object.keys(res).length === 0){
            result.innerHTML = `
            <div class="section" style="text-align:center;">
              <div style="font-size:18px;">🔍</div>
              <div style="margin-top:6px;">Nenhum dado encontrado</div>
            </div>
            `;
            return;
        }

        // renderiza os dados
        result.innerHTML="";
        let temp = document.createElement("div");
        temp.innerHTML = render(res);

        for(let el of temp.children){
            await new Promise(r=>setTimeout(r,100));
            result.appendChild(el);
        }

        // botão copiar tudo
        let btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "10px";

        let copyBtn = document.createElement("button");
        copyBtn.className = "action-btn";
        copyBtn.innerText = "📋 Copiar tudo";
        copyBtn.addEventListener("click", () => copyLink(JSON.stringify(res)));

        btnContainer.appendChild(copyBtn);
        result.appendChild(btnContainer);

    } catch(e){
        loading.innerHTML="";
        result.innerHTML = `
        <div class="section" style="text-align:center;">
          <div style="font-size:20px;">⚠️</div>
          <div style="margin-top:8px;font-weight:600;">
            Não foi possível concluir a consulta
          </div>
          <div style="margin-top:4px;font-size:12px;opacity:.7;">
            Tente novamente em alguns instantes
          </div>
        </div>
        `;
    }
}

function goToPlans(){
  closeModal();

  const plan = document.getElementById("plan-vip");

  if(!plan) return;

  plan.scrollIntoView({behavior:"smooth", block:"center"});

  plan.classList.add("highlight");

  setTimeout(()=>{
    plan.classList.remove("highlight");
  }, 3000);
}

function buy(){
 window.open("https://t.me/puxardados5","_blank");
}


const toast = document.getElementById("toast"); // garante que o toast está definido

function copyLink(text){
  // fallback seguro para copiar
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 99999);

  let success = false;
  try {
    success = document.execCommand('copy'); // fallback
  } catch (e) {
    success = false;
  }

  document.body.removeChild(el);

  showToast(success ? "🔗 Copiado com sucesso!" : "❌ Falha ao copiar");
}

// botão do modal para copiar rota
function copyRoute(){
  copyLink(document.getElementById("route").innerText);
}

function showToast(msg){
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 2500);
}

function startTimer(){

  const timers = [
    { id: "timer", endHour: 23},        // vitalício
    { id: "timer-day", endHour: 23},    // diário
    { id: "timer-month", endHour: 23}   // mensal
  ];

  function update(){

    const now = new Date();

    timers.forEach(t => {

      const el = document.getElementById(t.id);
      if(!el) return;

      const end = new Date();
      end.setHours(t.endHour,0,0,0);

if(now >= end){

  el.innerHTML = "❌ Promoção encerrada";
  el.style.color = "#ef4444";

  const plan = el.closest(".plan");

  if(plan){

    // remove preço antigo
    const old = plan.querySelector(".old-price");
    if(old) old.style.display = "none";

    // aumenta preço atual (vira preço normal)
    const current = plan.querySelector(".new-price");
    if(current){
      current.style.fontSize = "18px";
      current.style.opacity = "1";
    }

    // remove tag OFERTA
    const offer = plan.querySelector(".tag.offer");
    if(offer) offer.remove();

  }

  return;
}

      const diff = end - now;

      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      el.innerHTML = `⏳ Acaba em ${h}h ${m}m ${s}s`;

      // 🔥 URGÊNCIA (últimos 5 min)
      if(diff < 300000){
        el.style.animation = "pulseTimer .8s infinite";
        el.style.color = "#ef4444";
      }

    });

  }

  update();
  setInterval(update, 1000);
}

const tagConfig = {
  cpf: ["new", "active"],
  cpf2: ["new", "active"],
  foto: ["new", "beta"],
  nome: ["new", "active"],
  tel: ["new", "active"],
  placa: ["new", "beta"]
};

const tagLabels = {
  new: "NEW",
  active: "ATIVO",
  beta: "BETA",
  off: "OFF"
};

function applyTags(){
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const type = card.dataset.type;
    const top = card.querySelector(".card-top");

    if(!tagConfig[type] || !top) return;

    const tagBox = document.createElement("div");
    tagBox.className = "tag-box";

    tagConfig[type].forEach(t => {
      const span = document.createElement("span");
      span.className = `tag ${t}`;
      span.innerText = tagLabels[t] || t.toUpperCase();
      tagBox.appendChild(span);
    });

    top.appendChild(tagBox);
  });
}

document.querySelectorAll(".card").forEach(card=>{
  card.addEventListener("mousemove", e=>{
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", x+"px");
    card.style.setProperty("--y", y+"px");
  });
});

// roda quando carregar
window.addEventListener("load", applyTags);

startTimer();

animate();

</script>

<div id="toast"></div>

</body>
</html>