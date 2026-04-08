export default {
async fetch(request){

const url = new URL(request.url)
const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🏠 HOME LIBERADA (SEM TOKEN)
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
// 🔎 CPF
// ============================
async function handleCPF(url){

const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,message:"CPF não informado"})
}

const api = `https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return json({
    status:true,
    result: normalize(data)
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 NOME
// ============================
async function handleNome(url){

const nome = url.searchParams.get("nome")
if(!nome){
  return json({status:false,message:"Nome não informado"})
}

const api = `https://obitostore.shop/api/consulta/nome3?nome=${nome}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return json({
    status:true,
    result: normalize(data)
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 TELEFONE
// ============================
async function handleTelefone(url){

const telefone = url.searchParams.get("telefone")
if(!telefone){
  return json({status:false,message:"Telefone não informado"})
}

const api = `https://obitostore.shop/api/consulta/telefone?query=${telefone}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const data = await res.json()

  return json({
    status:true,
    result: normalize(data)
  })

}catch(e){
  return json({status:false,message:"Erro ao consultar"})
}

}

// ============================
// 🔎 PLACA
// ============================
async function handlePlaca(url){

const placa = url.searchParams.get("placa")
if(!placa){
  return json({status:false,message:"Placa não informada"})
}

const api = `https://obitostore.shop/api/consulta/placa2?placa=${placa}&apikey=bigmouthh`

try{
  const res = await fetch(api)
  const text = await res.text()

  let data
  try{
    data = JSON.parse(text)
  }catch{
    return json({status:false,message:"Resposta inválida"})
  }

  return json({
    status:true,
    result: normalize(data)
  })

}catch(e){
  return json({status:false,message:"Erro interno"})
}

}

// ============================
// 🧠 NORMALIZADOR
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
// 🧹 LIMPA JSON
// ============================
function cleanObject(obj){

if(Array.isArray(obj)){
  return obj.map(cleanObject)
}

if(typeof obj === "object" && obj !== null){

let newObj = {}

for(let key in obj){

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
// 🧠 TEXTO → JSON
// ============================
function parseText(text){

text = cleanString(text)

let lines = text.split("\n").map(l=>l.trim()).filter(Boolean)

let result = {}
let current = "dados"
let obj = {}

for(let line of lines){

if(line.includes(":")){
  let [k,...v] = line.split(":")
  obj[normalizeKey(k)] = v.join(":").trim()
}

}

result[current] = [obj]
return result
}

// ============================
// 🧹 LIMPA STRING
// ============================
function cleanString(str){

return str
.replace(/©.*$/gmi,"")
.replace(/HydraCore/gi,"")
.replace(/ObitoSpam/gi,"")
.replace(/════════.*════════/g,"")
.trim()

}

// ============================
// 🔑 KEY
// ============================
function normalizeKey(key){
return key
.toLowerCase()
.replace(/[^\w\s]/g,"")
.replace(/\s+/g,"_")
}

// ============================
// 📦 JSON
// ============================
function json(obj){
return new Response(JSON.stringify(obj,null,2),{
  headers:{"Content-Type":"application/json"}
})
}

// ============================
// 🏠 HOME (SEM ERRO)
// ============================
function html(){
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro Search</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

<style>

*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif;}

body{
  background: radial-gradient(circle at 20% 20%, #0a0f2a, #02030a);
  color:#e2e8f0;
  overflow-x:hidden;
}

/* ⭐ ESTRELAS */
canvas{
 position:fixed;
 top:0;
 left:0;
 width:100%;
 height:100%;
 z-index:-1;
}

/* HEADER */
.header{
 padding:20px;
 text-align:center;
 font-weight:800;
 font-size:24px;
}
.header span{color:#3b82f6;}

/* BOX */
.box{
 max-width:420px;
 margin:20px auto;
 padding:15px;
}

/* CARD */
.card{
 margin-top:12px;
 padding:16px;
 border-radius:16px;
 background:rgba(255,255,255,0.02);
 transition:.3s;
 cursor:pointer;
}
.card:hover{
 transform:translateY(-6px);
 box-shadow:0 10px 40px rgba(59,130,246,.25);
}

.desc{
 font-size:12px;
 opacity:.6;
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

/* BUTTON */
.btn{
 margin-top:10px;
 width:100%;
 padding:12px;
 border:none;
 border-radius:12px;
 background:#3b82f6;
 color:#fff;
 font-weight:600;
}

/* RESULT */
.result{
 margin-top:15px;
 font-size:12px;
 white-space:pre-wrap;
 background:#020617;
 padding:10px;
 border-radius:10px;
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

</style>
</head>

<body>

<canvas id="bg"></canvas>

<div class="header">Astro <span>Search</span></div>

<div class="box">

<input id="token" class="input" placeholder="Seu token">
<input id="valor" class="input" placeholder="Digite o valor">

<div class="card" onclick="setType('cpf')">
  <strong>CPF</strong>
  <div class="desc">Consulta completa</div>
</div>

<div class="card" onclick="setType('nome')">
  <strong>Nome</strong>
  <div class="desc">Busca por nome</div>
</div>

<div class="card" onclick="setType('telefone')">
  <strong>Telefone</strong>
  <div class="desc">Dados completos</div>
</div>

<div class="card" onclick="setType('placa')">
  <strong>Placa</strong>
  <div class="desc">Dados do veículo</div>
</div>

<button class="btn" onclick="consultar()">Consultar</button>

<div id="loading"></div>
<div id="result" class="result"></div>

</div>

<script>

let type="cpf"

function setType(t){
 type=t
}

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
  speed:Math.random()*0.5
 });
}

function animate(){
 ctx.clearRect(0,0,c.width,c.height);

 stars.forEach(s=>{
  s.y+=s.speed
  if(s.y>c.height) s.y=0

  ctx.fillStyle = "rgba(59,130,246,0.7)"
  ctx.fillRect(s.x,s.y,1,1)
 })

 requestAnimationFrame(animate)
}

animate()

/* CONSULTA */
async function consultar(){

let token=document.getElementById("token").value
let valor=document.getElementById("valor").value

if(!token || !valor){
 alert("Preencha tudo")
 return
}

loading.innerHTML='<div class="loader"></div>'
result.innerText=""

let url = "/" + type + "?token=" + token + "&" + type + "=" + encodeURIComponent(valor)

try{

 const r = await fetch(url)
 const j = await r.json()

 loading.innerHTML=""

 result.innerText = JSON.stringify(j,null,2)

}catch(e){
 loading.innerHTML=""
 result.innerText="Erro na consulta"
}

}

</script>

</body>
</html>
`
}