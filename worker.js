export default {
async fetch(request){

const url = new URL(request.url)
const endpoint = url.pathname.replace(/^\/|\/$/g,"")

// ============================
// 🔐 TOKEN
// ============================
const TOKENS = ["AstroKey123"]

const token = url.searchParams.get("token")
if(!TOKENS.includes(token)){
  return json({status:false,message:"Token inválido"})
}

// ============================
// 🔗 URL DA API EXTERNA
// ============================
const apiUrl = url.searchParams.get("url")

if(!apiUrl){
  return json({status:false,message:"Informe a URL da API"})
}

try{

const res = await fetch(apiUrl)
let data = await res.json()

// ============================
// 🔥 NORMALIZAÇÃO
// ============================
let cleaned = normalize(data)

// ============================
// 📦 RESPOSTA FINAL
// ============================
return json({
  status:true,
  base:"Astro API",
  credits:"Astro Company | @puxardados5",
  result: cleaned
})

}catch(e){
  return json({status:false,message:"Erro ao consumir API"})
}

}
}

// ============================
// 🧠 NORMALIZADOR UNIVERSAL
// ============================
function normalize(data){

// 🔄 se vier string gigante
if(typeof data === "string"){
  return parseText(data)
}

// 🔄 se tiver campo resultado (caso comum)
if(data.resultado){
  return parseText(data.resultado)
}

// 🔄 JSON normal → limpa recursivo
return cleanObject(data)

}

// ============================
// 🧹 LIMPAR OBJETO JSON
// ============================
function cleanObject(obj){

if(Array.isArray(obj)){
  return obj.map(cleanObject)
}

if(typeof obj === "object" && obj !== null){
  let newObj = {}

  for(let key in obj){

    // ❌ remove créditos
    if(key.toLowerCase().includes("criador")) continue
    if(key.toLowerCase().includes("credit")) continue

    newObj[normalizeKey(key)] = cleanObject(obj[key])
  }

  return newObj
}

// 🔤 limpar texto
if(typeof obj === "string"){
  return cleanString(obj)
}

return obj
}

// ============================
// 🧠 PARSE DE TEXTO BRUTO
// ============================
function parseText(text){

text = cleanString(text)

let lines = text.split("\n").map(l=>l.trim()).filter(Boolean)

let sections = {}
let current = "geral"

for(let line of lines){

// 🧩 detectar título
if(
  line === line.toUpperCase() &&
  line.length < 40 &&
  !line.includes(":")
){
  current = normalizeKey(line)
  sections[current] = []
  continue
}

// 🔑 chave: valor
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
// 🔤 LIMPAR STRING
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