export default {
async fetch(request){

const url = new URL(request.url)
const path = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["VIP_123"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido"})
}

// ============================
// 🚀 ROTAS
// ============================
if(path === "cpf"){
  return handleCPF(url)
}

// futuro:
// if(path === "telefone") return handleTelefone(url)
// if(path === "nome") return handleNome(url)

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

text = cleanString(text)

let lines = text.split("\n").map(l=>l.trim()).filter(Boolean)

let sections = {}
let current = "geral"

for(let line of lines){

// título
if(
  line === line.toUpperCase() &&
  line.length < 50 &&
  !line.includes(":")
){
  current = normalizeKey(line)
  sections[current] = []
  continue
}

// chave: valor
if(line.includes(":")){
  let [k,...v] = line.split(":")
  let value = v.join(":").trim()

  if(!sections[current]) sections[current] = []

  sections[current].push({
    key: normalizeKey(k),
    value: value
  })
}else{
  if(!sections[current]) sections[current] = []
  sections[current].push(line)
}

}

return sections
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