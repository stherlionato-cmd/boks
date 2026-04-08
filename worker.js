export default {
async fetch(request){

const url = new URL(request.url)

// ============================
// 🏠 HOME (LIBERADA)
// ============================
if(url.pathname === "/" || url.pathname === ""){
  return new Response(html(), {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  })
}

const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["VIP_123","ifnvip"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({
    status:false,
    error_code:"AUTH_001",
    message:"Token inválido, adquira com: @puxardados5"
  })
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "api/cpf.php") return handleCPF(url)
if(path === "api/cpf2.php") return handleCPF(url)
if(path === "api/nome.php") return handleNome(url)
if(path === "api/telefone.php") return handleTelefone(url)
if(path === "api/placa.php") return handlePlaca(url)
if(path === "api/foto.php") return handleFoto(url)

return json({status:false,message:"Endpoint não encontrado"})
}
}

// ============================
// 📸 FOTO
// ============================
async function handleFoto(url){
const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,error_code:"REQ_001"})
}

return json({
  status:true,
  foto_url:"https://i.imgur.com/8Km9tLL.jpg"
})
}

// ============================
// 🔎 CPF
// ============================
async function handleCPF(url){
const cpf = url.searchParams.get("cpf")
if(!cpf){
  return json({status:false,error_code:"REQ_001"})
}

try{
  const res = await fetch("https://obitostore.shop/api/consulta/cpf?cpf="+cpf+"&apikey=bigmouthh")
  const data = await res.json()

return json({
  status:true,
  dados: normalize(data)
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
  return json({status:false,error_code:"REQ_001"})
}

try{
  const res = await fetch("https://obitostore.shop/api/consulta/nome3?nome="+encodeURIComponent(nome)+"&apikey=bigmouthh")
  const data = await res.json()

return json({
  status:true,
  dados: normalize(data)
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
  return json({status:false,error_code:"REQ_001"})
}

try{
  const res = await fetch("https://obitostore.shop/api/consulta/telefone?query="+telefone+"&apikey=bigmouthh")
  const data = await res.json()

return json({
  status:true,
  dados: normalize(data)
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
  return json({status:false,error_code:"REQ_001"})
}

try{
  const res = await fetch("https://obitostore.shop/api/consulta/placa2?placa="+placa+"&apikey=bigmouthh")
  const data = await res.json()

return json({
  status:true,
  dados: normalize(data)
})

}catch(e){
  return json({status:false,message:"Erro interno"})
}
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
// 🧹 CLEAN JSON
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
// 🧠 PARSE TEXTO
// ============================
function parseText(text){

text = cleanString(text)

let lines = text.split("\\n").map(l=>l.trim()).filter(Boolean)

let result = {}
let current = "geral"
let currentObj = {}

for(let line of lines){

if(line === line.toUpperCase() && !line.includes(":")){
  pushObj()
  current = normalizeKey(line)
  if(!result[current]) result[current] = []
  continue
}

if(line.includes(":")){
  let parts = line.split(":")
  let key = normalizeKey(parts.shift())
  let value = parts.join(":").trim()

  if(currentObj[key] !== undefined){
    pushObj()
  }

  currentObj[key] = value
}

}

pushObj()

return result

function pushObj(){
  if(Object.keys(currentObj).length){
    if(!result[current]) result[current] = []
    result[current].push(currentObj)
    currentObj = {}
  }
}

}

// ============================
// 🧹 CLEAN STRING
// ============================
function cleanString(str){

return str
.replace(/©.*$/gmi,"")
.replace(/HydraCore/gi,"")
.replace(/ObitoSpam/gi,"")
.trim()

}

// ============================
// 🔑 KEY NORMALIZE
// ============================
function normalizeKey(key){
return key
.toLowerCase()
.replace(/[^\w\s]/g,"")
.replace(/\s+/g,"_")
}

// ============================
// 🏠 HTML FULL (SEM CRASE BUG)
// ============================
function html(){
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro Search</title>

<style>
body{
  margin:0;
  background: radial-gradient(circle at 20% 20%, #0a0f2a, #02030a);
  color:#fff;
  font-family:sans-serif;
  overflow-x:hidden;
}

.header{
  text-align:center;
  padding:20px;
  font-size:22px;
  font-weight:bold;
}

.card{
  margin:15px;
  padding:15px;
  border-radius:15px;
  background:rgba(255,255,255,0.05);
  cursor:pointer;
  transition:.2s;
}
.card:hover{
  transform:scale(1.05);
}

.input{
  width:90%;
  margin:10px auto;
  display:block;
  padding:10px;
  border-radius:10px;
  border:none;
}

.btn{
  width:90%;
  margin:10px auto;
  padding:10px;
  border:none;
  border-radius:10px;
  background:#3b82f6;
  color:#fff;
}

pre{
  margin:10px;
  background:#000;
  padding:10px;
  border-radius:10px;
  overflow:auto;
}

/* ⭐ estrelas */
canvas{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  z-index:-1;
}
</style>
</head>

<body>

<canvas id="bg"></canvas>

<div class="header">🚀 Astro Search</div>

<div class="card" onclick="setType('cpf')">CPF</div>
<div class="card" onclick="setType('nome')">Nome</div>
<div class="card" onclick="setType('telefone')">Telefone</div>
<div class="card" onclick="setType('placa')">Placa</div>
<div class="card" onclick="setType('foto')">Foto</div>

<input id="token" class="input" placeholder="Token">
<input id="valor" class="input" placeholder="Valor">

<button class="btn" onclick="consultar()">Consultar</button>

<pre id="res"></pre>

<script>

// ⭐ FUNDO ANIMADO
const c = document.getElementById("bg");
const ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

let stars = [];

for(let i=0;i<80;i++){
 stars.push({
  x:Math.random()*c.width,
  y:Math.random()*c.height,
  speed:Math.random()*0.5
 });
}

function animate(){
 ctx.clearRect(0,0,c.width,c.height);

 stars.forEach(function(s){
  s.y += s.speed;
  if(s.y > c.height) s.y = 0;

  ctx.fillStyle = "rgba(59,130,246,0.8)";
  ctx.fillRect(s.x,s.y,2,2);
 });

 requestAnimationFrame(animate);
}

animate();

// =================

let type = "cpf";

function setType(t){
 type = t;
}

async function consultar(){

let t = document.getElementById("token").value;
let v = document.getElementById("valor").value;

if(!t || !v){
 alert("Preencha tudo");
 return;
}

let url = "";

if(type === "cpf") url = "/api/cpf.php?token="+t+"&cpf="+v;
if(type === "nome") url = "/api/nome.php?token="+t+"&nome="+encodeURIComponent(v);
if(type === "telefone") url = "/api/telefone.php?token="+t+"&telefone="+v;
if(type === "placa") url = "/api/placa.php?token="+t+"&placa="+v;
if(type === "foto") url = "/api/foto.php?token="+t+"&cpf="+v;

const r = await fetch(url);
const data = await r.json();

document.getElementById("res").innerText = JSON.stringify(data,null,2);
}

</script>

</body>
</html>
`
}