<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Jezebel • Trabalhos Espirituais</title>

    <meta name="description"
        content="Jezebel — Trabalhos espirituais, consultas e orientação espiritual.">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
export default {
async fetch(request, env, ctx){

const url = new URL(request.url)
let endpoint = url.pathname.replace("/","")

// 🔥 ALIAS
const ALIAS = {
  cpf2:"cpf",
  cpf3:"cpf",
  cpf4:"cpf",
  cpf5:"cpf",
  cpf6:"cpf"
}

if(ALIAS[endpoint]){
  endpoint = ALIAS[endpoint]
}

if(endpoint === "admin"){
  const token = url.searchParams.get("token")
  if(token !== ADMIN_TOKEN){
    return jsonErro("AUTH_ADMIN","Acesso negado")
  }
  return adminPanel(request)
}

if(endpoint === "style.css"){
  return new Response(getCSS(), {
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=86400"
    }
  })
}

if(endpoint === ""){
  return home(request)
}

if(!ENDPOINTS[endpoint]){
  return jsonErro("ENDPOINT_404","Endpoint não encontrado")
}

return consultar(endpoint,request,url,ctx)

}
}

/* ================= CONFIG ================= */

const ADMIN_TOKEN = "dragonsubdono"
const BASE_SARA = "https://sara-api.xyz/api/consulta/"

/* ================= TOKENS (SEM KV) ================= */

const TOKENS = {
  ifnvipilimitado:{plano:"VITALICIO",credits:-1,endpoints:null},
  bocadass:{plano:"VITALICIO",credits:-1,endpoints:null},
thiagoexclusivo:{plano:"EXCLUSIVO",credits:-1,endpoints:null},
  astrofree:{plano:"FREE",credits:100,endpoints:["cpf","nome"]},
  fxckbuscas:{plano:"VITALICIO",credits:500000,endpoints:null},
  vermute777:{plano:"DIARIO",credits:1000,endpoints:null},
fellipevip:{plano:"DIARIO",credits:100,endpoints:null},
  PEREIRA:{plano:"DONO",credits:9999999999999999,endpoints:null},
  Zontra88:{plano:"VITALICIO",credits:1000,endpoints:null},
  astropro:{plano:"VITALICIO",credits:1000,endpoints:null},
  cicerovip:{plano:"VITALICIO",credits:1000,endpoints:null},
  santanavip:{plano:"VITALICIO",credits:1000,endpoints:null},
  // 🧪 PLANO DE TESTE (3 BUSCAS)
    santanateste:{ 
    plano:"TESTE",
    credits:5,
    endpoints:null
  },
  
    vermute7:{ 
    plano:"TESTE",
    credits:5,
    endpoints:null
  },

    felix:{ 
    plano:"TESTE",
    credits:5,
    endpoints:["cpf"]
  }
  
}

/* ================= ENDPOINTS ================= */

const ENDPOINTS = {
  placa: {
    query: "placa",
    url: "https://makima.online/consultas/placa",
    param: "placa"
  },

  cpf: {
    query: "cpf",
    url: "https://makima.online/consultas/cpf3",
    param: "cpf"
  },

  telefone: {
    query: "telefone",
    url: "https://makima.online/consultas/telefone",
    param: "telefone"
  },
}
/* ================= CONSULTA ================= */

async function consultar(endpoint, request, url, ctx){

if(request.method !== "GET"){
  return jsonErro("REQ_000","Método inválido")
}

const token = url.searchParams.get("token")
if(!token) return jsonErro("AUTH_002","Token obrigatório")

const tokenData = TOKENS[token]
if(!tokenData) return jsonErro("AUTH_001","Token inválido")

// 🔒 BLOQUEIO
if(tokenData.endpoints && !tokenData.endpoints.includes(endpoint)){
  return jsonErro("AUTH_003","Endpoint não liberado")
}

// 💰 CRÉDITOS
if(tokenData.plano !== "VITALICIO"){
  if(tokenData.credits <= 0){
    return jsonErro("LIMIT_001","Créditos esgotados")
  }
  tokenData.credits -= 1
}

const config = ENDPOINTS[endpoint]
const valor = url.searchParams.get(config.query)

if(!valor){
  return jsonErro("REQ_001","Parâmetro ausente")
}

try{

/* ================= API KEYS ================= */

const API_KEYS = [
  { key: "KEY_8zm8ght6", usos: 0 },
  { key: "KEY_mtc0v1um", usos: 0 },
  { key: "KEY_66gx3idl", usos: 0 },
  { key: "KEY_ravlw5ob", usos: 0 },
  { key: "KEY_th8bu84w", usos: 0 },
  { key: "KEY_0o8c96d2", usos: 0 }
];

function getApiKey() {
  for (const api of API_KEYS) {
    if (api.usos < 100) {
      api.usos++;
      return api.key;
    }
  }

  // Reinicia quando todas chegarem em 100 usos
  API_KEYS.forEach(api => api.usos = 0);
  API_KEYS[0].usos = 1;
  return API_KEYS[0].key;
}

const apikey = getApiKey();

const apiURL =
  config.url +
  "?" +
  config.param +
  "=" +
  encodeURIComponent(valor) +
  "&apikey=" +
  apikey;

  const res = await fetch(apiURL,{
    headers:{
      "User-Agent":"Mozilla/5.0",
      "Accept":"application/json"
    }
  })

  const json = await res.json()

if(!json){
  return jsonErro("API_001","Erro na API")
}

  // 🔥 LIMPEZA PADRÃO ASTRO
// 🔥 LIMPEZA PADRÃO ASTRO
let dados = json

// 🔥 TRATAMENTO ESPECÍFICO SARA
if(config.tipo === "sara"){
  dados = tratarSara(dados)
}

delete dados.criador
delete dados.status

/* ==================== PADRONIZAR RESULTADO ==================== */
function formatarResultado(dados){
  if(!dados || !dados.resultado) return dados;

  // Limpeza básica
  let resultado = dados.resultado;

  if(typeof resultado === "string"){
resultado = resultado
  .replace(/©.*?(HydraCore|Karen Search).*/gi,"")
  .replace(/══════════════════════════/g,"")
  .replace(/\r/g,"")
  .replace(/\n{2,}/g,"\n\n")
  .trim();

    // Separar seções pelo título
    const seções = resultado.split(/\n\n(?=[A-ZÀ-Ú ]{3,}:)/g).map(sec => {
      const [titulo, ...conteudo] = sec.split("\n");
      return { titulo: titulo.trim(), conteudo: conteudo.join("\n").trim() };
    });

    dados.resultado = seções;
  }

  if(typeof resultado === "object" && !Array.isArray(resultado)){
    dados.resultado = normalizarDados(resultado);
  }

  return dados;
}

// Aplica a formatação antes de retornar
dados = formatarResultado(dados);

  return new Response(JSON.stringify({
    status:true,
    meta:{
      api:"Astro Ultra",
      plano: tokenData.plano,
      creditos_restantes: tokenData.plano === "VITALICIO" ? "ilimitado" : tokenData.credits,
      endpoint,
      timestamp:new Date().toISOString()
    },
    consulta:{[config.query]:valor},
    dados
  },null,2),{
    headers:{
      "Content-Type":"application/json;charset=UTF-8"
    }
  })

}catch(e){
  return jsonErro("API_500","Erro interno")
}

}

/* ================= TRATAR SARA ================= */

function tratarSara(api){
  if(!api) return api;

  // remove lixo
  delete api.criador;
  delete api.status;

  if(api.resultado){

    // pega o body direto
    if(api.resultado.body){
      return {
        resultado: normalizarDados(api.resultado.body)
      };
    }

    // fallback caso não tenha body
    return {
      resultado: normalizarDados(api.resultado)
    };
  }

  return api;
}

/* ================= LIMPAR ================= */

function limparRespostaAPI(data){
if(!data || typeof data !== "object") return data
delete data.creator
delete data.status
return data
}

/* ================= NORMALIZAR ================= */

/* ================= NORMALIZAR ================= */

function normalizarDados(data){

  // Array
  if(Array.isArray(data)){
    return data.map(normalizarDados)
  }

  // Objeto
  if(data !== null && typeof data === "object"){

    const novo = {}

    for(const k in data){

      const key = k.toLowerCase()

      // Remove campos indesejados
      if(
        key === "link" ||
        key === "criador" ||
        key === "creator" ||
        key === "status" ||
        (key === "by" && data[k] === "Makima Search")
      ){
        continue
      }

      novo[k] = normalizarDados(data[k])
    }

    return novo
  }

  return data
}

/* ================= ERRO ================= */

function jsonErro(code,msg,extra=null){
return new Response(JSON.stringify({
  status:false,
  erro:{code,msg,extra}
},null,2),{
  headers:{"Content-Type":"application/json"}
})
}

function getCSS(){
return `
:root{--blue:#3b82f6;}

*{
 margin:0;
 padding:0;
 box-sizing:border-box;
 font-family:'Inter',sans-serif;
}

body{
    margin:0;
    color:#fff;

    background:
        radial-gradient(circle at top,#5b21b622 0%,transparent 45%),
        radial-gradient(circle at bottom right,#2563eb22 0%,transparent 40%),
        radial-gradient(circle at left,#06b6d422 0%,transparent 35%),
        #04050b;

    min-height:100vh;
    overflow-x:hidden;
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

.header span{
 color:var(--blue);
}

/* CARD */
.card{
 margin-top:15px;
 padding:16px;
 border-radius:18px;
 background:rgba(255,255,255,0.03);
 border:1px solid rgba(255,255,255,0.06);
 backdrop-filter:blur(14px);

 box-shadow:
   inset 0 1px 0 rgba(255,255,255,.05),
   0 10px 40px rgba(0,0,0,.6);

 transition:.3s;
}

.card:hover{
 transform:translateY(-4px) scale(1.01);
 border-color:rgba(59,130,246,.5);
 box-shadow:
   inset 0 1px 0 rgba(255,255,255,.08),
   0 20px 60px rgba(59,130,246,.15);
}

/* INPUT */
.input-group{
 margin-top:10px;
}

.label{
 font-size:11px;
 opacity:.6;
 margin-bottom:4px;
}

input,select{
 width:100%;
 padding:12px;
 border-radius:12px;
 border:none;
 background:#0b1228;
 color:#fff;
 outline:none;
}

input:focus,select:focus{
 box-shadow:0 0 0 2px rgba(59,130,246,.3);
}

body::before{
content:"";
position:fixed;
inset:-30%;

background:
radial-gradient(circle,#3b82f655 0%,transparent 30%),
radial-gradient(circle,#9333ea55 0%,transparent 35%),
radial-gradient(circle,#06b6d455 0%,transparent 30%);

filter:blur(120px);

animation:aurora 16s linear infinite alternate;

z-index:-2;
}

@keyframes aurora{

0%{
transform:translate(-10%,-10%);
}

100%{
transform:translate(10%,10%);
}

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
 transition:.25s;
}

button:hover{
 transform:translateY(-2px);
 box-shadow:0 10px 25px rgba(59,130,246,.3);
}

button:active{
 transform:scale(.96);
}

/* BOX RESULT */
.box{
 margin-top:12px;
 background:#020617;
 padding:12px;
 border-radius:12px;
 font-size:12px;
 position:relative;
}

pre{
 white-space:pre-wrap;
 word-wrap:break-word;
}

/* COPY */
.copy{
 margin-top:10px;
 background:rgba(34,197,94,.2);
}

.copy:hover{
 box-shadow:0 0 15px rgba(34,197,94,.3);
}

/* LOADING */
.loader{
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

/* TOAST */
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

/* MODAL */
.modal{
 position:fixed;
 inset:0;
 background:rgba(0,0,0,.7);
 display:flex;
 align-items:center;
 justify-content:center;
 z-index:999;
 opacity:0;
 pointer-events:none;
 transition:.3s;
}

/* MODAIS SOBREPOSTOS */
#maintenanceModal {
  z-index: 900;  /* fica atrás */
}

#modal {
  z-index: 1000; /* fica na frente */
}

.modal.show{
 opacity:1;
 pointer-events:all;
}

.modal-box{
 width:100%;
 max-width:380px;
 background:#020617;
 border-radius:18px;
 padding:20px;
 transform:scale(.9);
 transition:.3s;
}

.modal.show .modal-box{
 transform:scale(1);
}

/* PLANOS */
.plan{
 padding:14px;
 border-radius:16px;
 margin-top:10px;
 border:1px solid rgba(255,255,255,.06);
 background:linear-gradient(145deg,rgba(255,255,255,.03),rgba(255,255,255,.01));
 transition:.3s;
 cursor:pointer;
 position:relative;
 overflow:hidden;
}

.plan:hover{
 transform:translateY(-4px) scale(1.02);
 border-color:rgba(59,130,246,.4);
}

/* glow */
.plan::after{
 content:"";
 position:absolute;
 inset:0;
 background:linear-gradient(120deg,transparent,rgba(255,255,255,.1),transparent);
 opacity:0;
 transition:.4s;
}

.plan:hover::after{
 opacity:1;
}

/* BADGE */
.badge{
 display:inline-flex;
 align-items:center;
 gap:6px;
 padding:6px 12px;
 border-radius:999px;
 font-size:11px;
 font-weight:600;
}

/* FREE */
.badge.free{
 background:rgba(34,197,94,.15);
 color:#22c55e;
}

/* PRO */
.badge.pro{
 background:rgba(59,130,246,.15);
 color:#3b82f6;
}

.badge.vitalicio{
 background:rgba(168,85,247,.15);
 color:#a855f7;
}

@keyframes stars{
 from{transform:translateY(0)}
 to{transform:translateY(40px)}
}

@keyframes shake{
  0%{transform:translateX(0)}
  25%{transform:translateX(-5px)}
  50%{transform:translateX(5px)}
  75%{transform:translateX(-5px)}
  100%{transform:translateX(0)}
}

#bg{
 position:fixed;
 inset:0;
 z-index:0;
 pointer-events:none;
}

/* BADGE */
.badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:6px 12px;
  border-radius:999px;
  font-size:11px;
  font-weight:600;
  position:relative;
  overflow:hidden;
}

.badge.diario{
  background:rgba(255,79,163,.15);
  color:#ff4fa3;
  border:1px solid rgba(255,79,163,.35);
}

.badge.diario::after{
  content:"";
  position:absolute;
  inset:-50%;
  background:radial-gradient(circle,#ff4fa3 1px,transparent 1px);
  background-size:18px 18px;
  opacity:.25;
  animation:stars 4s linear infinite;
}

.plan.vip{
 position:relative;
 overflow:hidden;
}

.plan.vip::after{
 content:"";
 position:absolute;
 inset:-50%;
 background:radial-gradient(circle,#facc15 1px,transparent 1px);
 background-size:18px 18px;
 opacity:.15;
 animation:stars 6s linear infinite;
 pointer-events:none;
}

/* Partículas VIP */
.badge.vip::after{
 content:"";
 position:absolute;
 inset:-50%;
 background:radial-gradient(circle,#facc15 1px,transparent 1px);
 background-size:18px 18px;
 opacity:.25;
 animation:stars 4s linear infinite;
}

button{
 position:relative;
 overflow:hidden;
}

button::after{
 content:"";
 position:absolute;
 inset:0;
 background:linear-gradient(120deg,transparent,rgba(255,255,255,.4),transparent);
 transform:translateX(-100%);
}

button:hover::after{
 transform:translateX(100%);
 transition:.6s;
}

@keyframes ripple{
 to{
  transform:scale(2);
  opacity:0;
 }
}

.plans{
 display:flex;
 flex-direction:column;
 gap:10px;
 margin-top:10px;
}

/* CARD BASE */
.plan{
 position:relative;
 padding:12px 14px;
 border-radius:14px;
 border:1px solid rgba(255,255,255,.06);
 background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.01));
 cursor:pointer;
 transition:.25s;
}

/* HOVER LIMPO */
.plan:hover{
 transform:translateY(-2px);
 border-color:rgba(59,130,246,.4);
}

/* HEADER */
.plan-top{
 display:flex;
 justify-content:space-between;
 font-size:13px;
 font-weight:600;
}

/* INFO */
.plan-info{
 font-size:12px;
 opacity:.6;
 margin-top:4px;
}

/* PREÇO */
.price{
 opacity:.8;
 font-weight:500;
}

/* PRO DESTAQUE */
.plan.featured{
 border:1px solid rgba(59,130,246,.6);
 box-shadow:0 10px 25px rgba(59,130,246,.12);
}

/* BADGE */
.badge-plan{
 position:absolute;
 top:10px;
 right:10px;

 background:linear-gradient(135deg,#3b82f6,#2563eb);
 color:#fff;

 font-size:10px;
 font-weight:600;
 padding:4px 10px;
 border-radius:999px;

 box-shadow:
   0 4px 12px rgba(59,130,246,.3),
   inset 0 1px 0 rgba(255,255,255,.2);

 letter-spacing:.3px;
}

.plan.featured{
 border:1px solid rgba(59,130,246,.6);
 box-shadow:
   0 10px 30px rgba(59,130,246,.15),
   inset 0 0 0 1px rgba(255,255,255,.05);
 position:relative;
}

/* glow suave animado */
.plan.featured::before{
 content:"";
 position:absolute;
 inset:0;
 border-radius:inherit;
 background:linear-gradient(120deg,transparent,rgba(59,130,246,.2),transparent);
 opacity:.4;
 pointer-events:none;
}

.plan.featured .plan-top span:first-child{
 color:#3b82f6;
}

/* SELEÇÃO */
.plan.selected{
 border-color:#3b82f6;
 background:linear-gradient(145deg,rgba(59,130,246,.15),rgba(255,255,255,.02));
}

.plan[data-plan="DIARIO"]{
  position:relative;
  overflow:hidden;

  background:
  linear-gradient(
    135deg,
    #ff4fa3,
    #ff6bb3,
    #ff93c9
  ) !important;

  border:2px solid #ffc2df !important;

  box-shadow:
    0 0 25px rgba(255,79,163,.5),
    0 0 60px rgba(255,79,163,.3),
    inset 0 0 25px rgba(255,255,255,.08);

  animation: diarioPulse 2s infinite alternate;
}

.plan[data-plan="VITALICIO"]{
  position:relative;
  overflow:hidden;

  background:
  linear-gradient(
    135deg,
    #7c3aed,
    #9333ea,
    #c084fc
  ) !important;

  border:2px solid #d8b4fe !important;

  box-shadow:
    0 0 30px rgba(168,85,247,.55),
    0 0 80px rgba(168,85,247,.35),
    inset 0 0 25px rgba(255,255,255,.08);

  animation: vipPulse 2s infinite alternate;
}

@keyframes diarioPulse{
  from{
    transform:scale(1);
  }
  to{
    transform:scale(1.02);
    box-shadow:
      0 0 40px rgba(255,79,163,.8),
      0 0 90px rgba(255,79,163,.5);
  }
}

@keyframes vipPulse{
  from{
    transform:scale(1);
  }
  to{
    transform:scale(1.02);
    box-shadow:
      0 0 50px rgba(168,85,247,.9),
      0 0 120px rgba(168,85,247,.6);
  }
}

`
}

/*
|--------------------------------------------------------------------------
| HOME UI
|--------------------------------------------------------------------------
*/

function home(request){

const base = new URL(request.url).origin

return new Response(`

<!DOCTYPE html>
<html lang="pt-br">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<title>Astro Search API</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/style.css">

</head>

<body>

<canvas id="bg"></canvas>

<!-- MODAL MANUTENÇÃO -->
<div class="modal" id="maintenanceModal">
  <div class="modal-box">
    <h2 style="font-size:16px;margin-bottom:10px;">⚠️ APROVEITE!</h2>
    <p style="font-size:14px;opacity:.8;line-height:1.5;">
      Aproveite as consultas ilimitadas e exclusivas. Atualizações e melhorias sendo feitas.
    </p>
    <button onclick="fecharMaintenanceModal()" style="margin-top:15px;">Fechar</button>
  </div>
</div>

<div class="header">
  <h1>🚀 Astro <span>Search</span></h1>
  <div id="badgeContainer" style="margin-top:8px;"></div>
</div>

<div class="card">

<div class="input-group">
<div class="label">Token</div>
<input id="token" placeholder="seu token">
</div>

<div class="input-group">
<div class="label">Endpoint</div>
<select id="endpoint">
${Object.keys(ENDPOINTS).map(e=>`<option>${e}</option>`).join("")}
</select>
</div>

<div class="input-group">
<div class="label">Valor</div>
<input id="valor" placeholder="valor da consulta">
</div>

<button id="btnConsultar" onclick="consultar()">Consultar</button>

</div>

<div class="card">

<div class="label">URL</div>
<div class="box"><pre id="url"></pre></div>

<button class="copy" onclick="copiar('url')">Copiar URL</button>

</div>

<div class="card">

<div class="label">Resposta</div>
<div class="box" id="resBox">
<pre id="resposta"></pre>
</div>

<button class="copy" onclick="copiar('resposta')">Copiar resposta</button>

</div>

<div id="toast">Copiado!</div>

<!-- MODAL TOKEN -->
<div class="modal" id="modal">
  <div class="modal-box">

    <h2 style="font-size:16px;margin-bottom:10px;">🔐 Acesso</h2>

    <input id="tokenInput" placeholder="Digite seu token">

<button onclick="salvarTokenModal()">Entrar</button>

<div style="margin-top:15px;font-size:12px;opacity:.6;">
  Planos disponíveis:
</div>

<div class="plans">

  <div class="plan" data-plan="DIARIO">
    <div class="plan-top">
      <span>DIÁRIO</span>
      <span class="price">R$20</span>
    </div>
    <div class="plan-info">
      Acesso 24h
    </div>
  </div>

  <div class="plan featured" data-plan="PRO">
    <div class="plan-top">
      <span>PRO</span>
      <span class="price">R$40/mês</span>
    </div>
    <div class="plan-info">
      +5000 consultas
    </div>
  </div>

<div class="plan" data-plan="VITALICIO">
  <div class="plan-top">
    <span>VITALÍCIO</span>
    <span class="price">R$50 único</span>
  </div>
  <div class="plan-info">
    Ilimitado
  </div>
</div>

</div>

<canvas id="bg"></canvas>

<script>
/* ===== TOKENS ===== */
const TOKENS = {
  omaigd: "VITALICIO",
  kkkkkaps: "VITALICIO",
  PEREIRA: "DONO",
  santanateste: "TESTE",
  felix: "TESTE",
  vermute7: "TESTE"
};

/* ===== MODAIS ===== */
function abrirModal(){
  document.getElementById("modal").classList.add("show");
}

function fecharModal(){
  document.getElementById("modal").classList.remove("show");
}

function fecharMaintenanceModal(){
  document.getElementById("maintenanceModal").classList.remove("show");
}

/* ===== BADGE ===== */
function renderBadge(plano){
  const el = document.getElementById("badgeContainer");
  const classe = plano.toLowerCase();
  const texto = plano.toUpperCase();

  el.innerHTML = '<div class="badge ' + classe + '">' + texto + '</div>';
}

/* ===== PREMIUM EFFECT ===== */
function efeitoPremium(token){
  const plano = TOKENS[token];
  const body = document.body;

if(plano === "VITALICIO"){
  body.style.boxShadow = "inset 0 0 120px rgba(168,85,247,.3)";
} else if(plano === "FREE"){
    body.style.boxShadow = "inset 0 0 80px rgba(34,197,94,.2)";
  }
}

/* ===== ERRO SHAKE ===== */
function efeitoErro(){
  const input = document.getElementById("token");
  input.style.animation = "shake .3s";
  setTimeout(()=>input.style.animation="",300);
}

/* ===== SALVAR TOKEN ===== */
function salvarToken(token){
  localStorage.setItem("astro_token", token);
  renderBadge(TOKENS[token]);
}

/* ===== SALVAR TOKEN PELO MODAL ===== */
function salvarTokenModal(){
  const input = document.getElementById("tokenInput");
  const token = input.value.trim();

  if(!TOKENS[token]){
    input.style.border = "1px solid red";
    efeitoErro();
    return;
  }

  document.getElementById("token").value = token;
  salvarToken(token);
  efeitoPremium(token);
  fecharModal();
}

/* ===== TOAST ===== */
function mostrarToast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),3000);
}

/* ===== CONSULTAR ===== */
async function consultar(){
  const btn = document.getElementById("btnConsultar");
  btn.disabled = true;
  btn.innerText = "Consultando...";

  const token = document.getElementById("token").value.trim();
  const endpoint = document.getElementById("endpoint").value;
  const valor = document.getElementById("valor").value;

  if(!token){
    abrirModal();
    btn.disabled = false;
    btn.innerText = "Consultar";
    return;
  }

  if(!TOKENS[token]){
    abrirModal();
    efeitoErro();
    btn.disabled = false;
    btn.innerText = "Consultar";
    return;
  }

  salvarToken(token);
  efeitoPremium(token);

const PARAMS = {
  cpf:"cpf",
  nome:"nome",
  telefone:"telefone",
  telefone_full:"telefone",
  telefone_cpf:"cpf",
  placa:"placa",  
  ddd:"ddd",
  operadora:"telefone",
  rg:"rg",
  titulo:"titulo",
  pis:"pis",
  nis:"nis",
  parentes:"cpf",
  vizinhos:"cpf",
  cep:"cep",
  estado:"uf",
  email:"email",
  score:"cpf",
  renda:"valor",
  cbo:"cbo",
  foto_sp:"cpf",
  foto_ma:"cpf",
  foto_ro:"cpf",
  foto_all:"cpf"
}

const param = PARAMS[endpoint];
  const url = window.location.origin + "/" + endpoint +
              "?token=" + token + "&" + param + "=" + valor;

  document.getElementById("url").innerText = url;
  const resBox = document.getElementById("resBox");
  resBox.innerHTML = '<div class="loader"></div>';

  try{
    const r = await fetch(url);
    const j = await r.json();
resBox.innerHTML = "<pre id='resposta' style='opacity:0;transform:translateY(10px)'>"+JSON.stringify(j,null,2)+"</pre>";

setTimeout(()=>{
  const el = document.getElementById("resposta");
  el.style.transition=".4s";
  el.style.opacity="1";
  el.style.transform="translateY(0)";
},50);
    mostrarToast("Consulta feita com sucesso! 😍");
  } catch {
    resBox.innerHTML = "<pre>Erro ao consultar</pre>";
    mostrarToast("Erro na consulta ❌");
  }

  btn.disabled = false;
  btn.innerText = "Consultar";
}

document.querySelectorAll("button").forEach(btn=>{
  btn.addEventListener("click", e=>{
    const ripple = document.createElement("span");
    ripple.style.position="absolute";
    ripple.style.borderRadius="50%";
    ripple.style.background="rgba(255,255,255,.4)";
    ripple.style.transform="scale(0)";
    ripple.style.animation="ripple .6s linear";

    const rect = btn.getBoundingClientRect();
    ripple.style.width = ripple.style.height = rect.width + "px";
    ripple.style.left = e.clientX - rect.left - rect.width/2 + "px";
    ripple.style.top = e.clientY - rect.top - rect.width/2 + "px";

    btn.appendChild(ripple);

    setTimeout(()=>ripple.remove(),600);
  });
});

document.querySelectorAll(".plan").forEach(plan=>{
  plan.addEventListener("click", ()=>{

    document.querySelectorAll(".plan").forEach(p=>p.classList.remove("selected"));
    plan.classList.add("selected");

    // micro feedback
    plan.style.transform = "scale(.97)";
    setTimeout(()=>plan.style.transform="",100);

  });
});

/* ===== PARTICULAS DE FUNDO ===== */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

async function verificarPagamento(url){

  const payment_id = url.searchParams.get("payment_id")

  if(!payment_id){
    return jsonErro("REQ_001","payment_id obrigatório")
  }

const api = "https://promstpagamentos.discloud.app/verify_payment?payment_id=" + payment_id

  try{
    const res = await fetch(api)
    const json = await res.json()

    // 🔥 SE PAGAMENTO CONFIRMADO
    if(json.status_pagamento === "CONCLUIDA"){
const novoToken = "user_" + Math.random().toString(36).slice(2,10)

TOKENS[novoToken] = {
  plano:"PRO",
  credits:1000,
  endpoints:null
}
      return new Response(JSON.stringify({
        status:true,
        pago:true,
        liberar_token:true,
        dados: json
      },null,2),{
        headers:{ "Content-Type":"application/json" }
      })
    }

    return new Response(JSON.stringify({
      status:true,
      pago:false,
      dados: json
    },null,2),{
      headers:{ "Content-Type":"application/json" }
    })

  }catch(e){
    return jsonErro("PAY_002","Erro ao verificar pagamento")
  }
}



function createParticles(qtd=60){
  particles = [];
  for(let i=0;i<qtd;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.5,
      speed: Math.random()*0.5 + 0.2
    });
  }
}

function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.y += p.speed;
    if(p.y > canvas.height){
      p.y = 0;
      p.x = Math.random()*canvas.width;
    }
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}

/* ===== LOAD ===== */
window.addEventListener("load", ()=>{
  // Primeiro: mostrar modal de manutenção
  const maintenanceModal = document.getElementById("maintenanceModal");
  maintenanceModal.classList.add("show");

  // Checar se existe token válido no localStorage
  const token = localStorage.getItem("astro_token");
  if(token && TOKENS[token]){
    // Token válido: exibe badge e efeito premium
    document.getElementById("token").value = token;
    renderBadge(TOKENS[token]);
    efeitoPremium(token);
  } else {
    // Sem token ou inválido: abrir modal de token **por cima da manutenção**
    abrirModal(); // modal de token
  }

  // Partículas
  resizeCanvas();
  createParticles();
  drawParticles();
});

window.addEventListener("resize", resizeCanvas);
</script>

</body>
</html>

`,{
  headers: { 
    "content-type": "text/html",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
  }
})

}

    <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <!-- FUNDO DE PARTÍCULAS -->
    <div id="particles"></div>

    <!-- HEADER -->
    <header class="header">

        <div class="logo">
            <span class="logo-symbol">☾</span>
            <span>JEZEBEL</span>
            <small>TRABALHOS ESPIRITUAIS</small>
        </div>

        <nav class="nav">
            <a href="#inicio">Início</a>
            <a href="#trabalhos">Trabalhos</a>
            <a href="#consultas">Consultas</a>
            <a href="#sobre">Sobre</a>
        </nav>

        <div class="header-actions">

            <button class="icon-btn" id="favoriteButton">
                ♡
                <span class="badge" id="favoriteCount">0</span>
            </button>

            <button class="icon-btn" id="cartButton">
                🛒
                <span class="badge" id="cartCount">0</span>
            </button>

        </div>

    </header>


    <!-- HERO -->
    <section class="hero" id="inicio">

        <div class="hero-content">

            <div class="eyebrow">
                ✦ MAGIA • INTENÇÃO • ESPIRITUALIDADE ✦
            </div>

            <h1>
                Onde sua intenção
                <span>encontra o poder.</span>
            </h1>

            <p>
                Trabalhos espirituais e consultas realizados com
                fé, intenção e propósito.
            </p>

            <div class="hero-buttons">

                <a href="#trabalhos" class="btn-primary">
                    Explorar trabalhos
                </a>

                <a href="#consultas" class="btn-outline">
                    Consultar oráculos
                </a>

            </div>

        </div>

        <div class="hero-decoration">

            <div class="moon">☾</div>

            <div class="magic-circle">
                <span>✦</span>
                <span>✧</span>
                <span>✦</span>
                <span>✧</span>
            </div>

        </div>

    </section>


    <!-- CATEGORIAS -->
    <section class="categories">

        <div class="section-title">
            <span>EXPLORE</span>
            <h2>Escolha seu caminho</h2>
        </div>

        <div class="category-grid">

            <button class="category-card" data-category="Todos">
                <span>✦</span>
                <strong>Todos</strong>
            </button>

            <button class="category-card" data-category="Amor">
                <span>♡</span>
                <strong>Amor</strong>
            </button>

            <button class="category-card" data-category="Proteção">
                <span>◉</span>
                <strong>Proteção</strong>
            </button>

            <button class="category-card" data-category="Prosperidade">
                <span>✧</span>
                <strong>Prosperidade</strong>
            </button>

            <button class="category-card" data-category="Consultas">
                <span>☽</span>
                <strong>Consultas</strong>
            </button>

        </div>

    </section>


    <!-- PRODUTOS -->
    <section class="products-section" id="trabalhos">

        <div class="section-header">

            <div>
                <span class="section-label">CATÁLOGO JEZEBEL</span>
                <h2>Trabalhos espirituais</h2>
            </div>

            <div class="search-box">

                <input
                    type="text"
                    id="searchInput"
                    placeholder="Buscar trabalho..."
                >

                <span>⌕</span>

            </div>

        </div>

        <div class="products-grid" id="productsGrid"></div>

    </section>


    <!-- CONSULTAS -->
    <section class="consultation-section" id="consultas">

        <div class="consultation-content">

            <span>ORÁCULOS & INTUIÇÃO</span>

            <h2>
                Às vezes,
                tudo que falta é
                <strong>a resposta certa.</strong>
            </h2>

            <p>
                Consulte os oráculos e receba uma orientação
                para compreender melhor seus caminhos e possibilidades.
            </p>

            <button
                class="btn-primary"
                onclick="filterCategory('Consultas')">

                Ver consultas

            </button>

        </div>

    </section>


    <!-- SOBRE -->
    <section class="about" id="sobre">

        <div class="about-symbol">
            ☾
        </div>

        <div>

            <span>JEZEBEL</span>

            <h2>
                Feito com fé,
                intenção e poder.
            </h2>

            <p>
                Um espaço dedicado à espiritualidade,
                aos oráculos e aos trabalhos realizados
                com propósito e intenção.
            </p>

        </div>

    </section>


    <!-- FOOTER -->
    <footer>

        <div class="footer-logo">
            JEZEBEL
        </div>

        <p>
            © 2026 Jezebel. Todos os direitos reservados.
        </p>

    </footer>


    <!-- CARRINHO -->
    <aside class="cart-sidebar" id="cartSidebar">

        <div class="cart-header">

            <h2>Seu carrinho</h2>

            <button id="closeCart">
                ×
            </button>

        </div>

        <div id="cartItems" class="cart-items"></div>

        <div class="cart-footer">

            <div class="cart-total">

                <span>Total</span>

                <strong id="cartTotal">
                    R$ 0,00
                </strong>

            </div>

            <button class="checkout-btn" id="checkoutButton">

                Continuar para pagamento

            </button>

        </div>

    </aside>


    <!-- OVERLAY -->
    <div class="overlay" id="overlay"></div>


    <!-- TOAST -->
    <div class="toast" id="toast">
        Adicionado ao carrinho ✦
    </div>


    <script src="script.js"></script>

</body>

</html>