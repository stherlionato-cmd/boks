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