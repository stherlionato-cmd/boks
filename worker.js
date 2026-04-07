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
const api = `https://obitostore.shop/api/consulta/cpf?cpf=${cpf}&apikey=Teste`

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
const api = `https://obitostore.shop/api/consulta/telefone?query=${telefone}&apikey=Teste`

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

const api = `https://obitostore.shop/api/consulta/placa2?placa=${placa}&apikey=Teste`

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