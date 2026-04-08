export default {
async fetch(request){

const url = new URL(request.url)
const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🏠 HOME (PAINEL)
// ============================
if(path === ""){
  return new Response(html(), {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  })
}

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["VIP_123","ifnastro"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido"})
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "cpf") return handleCPF(url)
if(path === "cpf2") return handleCPF2(url)
if(path === "nome") return handleNome(url)
if(path === "nome2") return handleNome2(url)
if(path === "placa") return handlePlaca(url)
if(path === "telefone") return handleTelefone(url)

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
// 🔎 CPF2
// ============================
async function handleCPF2(url){

const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,message:"CPF não informado"})
}

// 🔗 API EXTERNA (OCULTA)
const api = `https://obitostore.shop/api/consulta/cpf4?cpf=${cpf}&apikey=bigmouthh`

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
// 🔎 Nome 2
// ============================
async function handleNome2(url){

const nome = url.searchParams.get("nome")
if(!nome){
  return json({status:false,message:"Nome não informado"})
}

// 🔗 API EXTERNA (OCULTA)
const api = `https://obitostore.shop/api/consulta/nome?nome=${nome}&apikey=bigmouthh`

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

function html(){
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro API</title>

<style>
body{
  background:#020617;
  color:#fff;
  font-family:Arial;
  text-align:center;
  padding:20px;
}

.box{
  max-width:400px;
  margin:auto;
}

.card{
  background:#0b1228;
  margin-top:10px;
  padding:15px;
  border-radius:12px;
  cursor:pointer;
}

input{
  width:100%;
  padding:10px;
  margin-top:10px;
  border-radius:8px;
  border:none;
}

button{
  margin-top:10px;
  padding:10px;
  width:100%;
  border:none;
  border-radius:8px;
  background:#3b82f6;
  color:#fff;
}

pre{
  margin-top:10px;
  text-align:left;
  background:#000;
  padding:10px;
  border-radius:10px;
  overflow:auto;
}
</style>
</head>

<body>

<h2>🚀 Astro API</h2>

<div class="box">

<input id="token" placeholder="Token">

<div class="card" onclick="openType('cpf')">CPF</div>
<div class="card" onclick="openType('nome')">Nome</div>
<div class="card" onclick="openType('telefone')">Telefone</div>
<div class="card" onclick="openType('placa')">Placa</div>

<input id="valor" placeholder="Digite o valor">

<button onclick="consultar()">Consultar</button>

<pre id="res"></pre>

</div>

<script>

let tipo = "cpf"

function openType(t){
  tipo = t
}

async function consultar(){

  let token = document.getElementById("token").value
  let valor = document.getElementById("valor").value

  let url = ""

  if(tipo==="cpf") url = "/cpf?token="+token+"&cpf="+valor
  if(tipo==="nome") url = "/nome?token="+token+"&nome="+encodeURIComponent(valor)
  if(tipo==="telefone") url = "/telefone?token="+token+"&telefone="+valor
  if(tipo==="placa") url = "/placa?token="+token+"&placa="+valor

  const res = await fetch(url)
  const data = await res.json()

  document.getElementById("res").innerText = JSON.stringify(data,null,2)
}

</script>

</body>
</html>
`
}