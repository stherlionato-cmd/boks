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
const TOKENS = ["VIP_123","ifnvip"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido, adquira com: @puxardados5"})
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
<title>Astro Search</title>

<style>
body{
  background:#020617;
  color:#fff;
  font-family:Arial;
  text-align:center;
}

.box{
  max-width:400px;
  margin:40px auto;
  padding:20px;
  border-radius:20px;
  background:#0f172a;
}

input{
  width:100%;
  padding:10px;
  margin-top:10px;
  border-radius:10px;
  border:none;
  background:#020617;
  color:#fff;
}

button{
  margin-top:10px;
  padding:10px;
  width:100%;
  border:none;
  border-radius:10px;
  background:#3b82f6;
  color:#fff;
}

.result{
  margin-top:15px;
  text-align:left;
  font-size:12px;
}
</style>
</head>

<body>

<div class="box">
<h2>🚀 Astro Search</h2>

<input id="token" placeholder="Token">
<input id="valor" placeholder="Digite aqui">

<button onclick="consultar('cpf')">CPF</button>
<button onclick="consultar('nome')">Nome</button>
<button onclick="consultar('telefone')">Telefone</button>
<button onclick="consultar('placa')">Placa</button>

<div id="result" class="result"></div>
</div>

<script>
async function consultar(tipo){

let token = document.getElementById("token").value
let valor = document.getElementById("valor").value

if(!token || !valor){
  alert("Preencha tudo")
  return
}

let url = ""

if(tipo==="cpf") url = "/cpf?token="+token+"&cpf="+valor
if(tipo==="nome") url = "/nome?token="+token+"&nome="+encodeURIComponent(valor)
if(tipo==="telefone") url = "/telefone?token="+token+"&telefone="+valor
if(tipo==="placa") url = "/placa?token="+token+"&placa="+valor

const res = await fetch(url)
const data = await res.json()

document.getElementById("result").innerText = JSON.stringify(data,null,2)

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
if(!cpf) return json({status:false,message:"CPF não informado"})

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
if(!nome) return json({status:false,message:"Nome não informado"})

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
if(!telefone) return json({status:false,message:"Telefone não informado"})

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
if(!placa) return json({status:false,message:"Placa não informada"})

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