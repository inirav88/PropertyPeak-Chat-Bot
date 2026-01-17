
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { handleAIRequest } = require('./ai_engines/providerFactory');
require('dotenv').config();

const app = express();

// Trust proxy is essential when running behind Nginx
app.set('trust proxy', 1);

// Middleware
app.use(cors({ 
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'] 
}));
app.use(bodyParser.json());

// Serve the frontend static files
app.use(express.static(path.join(__dirname)));

// Storage Paths
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const CONFIG_PATH = path.join(DATA_DIR, 'bot_config.json');
const USERS_STATE_PATH = path.join(DATA_DIR, 'users_state.json');
const LEADS_PATH = path.join(DATA_DIR, 'leads.json');

// State Management
let botConfig = {};
let userStates = {};
let leads = [];

function loadData() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, '{}');
    if (!fs.existsSync(USERS_STATE_PATH)) fs.writeFileSync(USERS_STATE_PATH, '{}');
    if (!fs.existsSync(LEADS_PATH)) fs.writeFileSync(LEADS_PATH, '[]');
    
    botConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    userStates = JSON.parse(fs.readFileSync(USERS_STATE_PATH, 'utf8'));
    leads = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf8'));
    console.log("📂 Data loaded successfully from /data directory");
  } catch (e) { 
    console.error("❌ Data Load Error:", e); 
  }
}
loadData();

const saveData = (p, data) => {
  try { 
    fs.writeFileSync(p, JSON.stringify(data, null, 2)); 
  } catch (e) { 
    console.error(`❌ Save Error (${p}):`, e); 
  }
};

// Logic: WhatsApp Outgoing
async function sendWhatsApp(to, text, buttons = []) {
  const { phoneNumberId, accessToken } = botConfig.meta || {};
  if (!phoneNumberId || !accessToken) return;

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  let payload = { messaging_product: "whatsapp", to };
  if (buttons && buttons.length > 0 && buttons.length <= 3) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text.substring(0, 1024) },
      action: { buttons: buttons.map((b, i) => ({ type: "reply", reply: { id: `btn_${i}`, title: b.substring(0, 20) } })) }
    };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  try { 
    await axios.post(url, payload, { headers }); 
  } catch (err) { 
    console.error("❌ WhatsApp Send Error:", err.response?.data || err.message); 
  }
}

// Logic: Incoming Message Router
async function handleIncoming(from, text) {
  let lead = leads.find(l => l.phone === from);
  if (!lead) {
    lead = { 
      id: Date.now().toString(), 
      phone: from, 
      name: "New Lead", 
      status: "New", 
      lastActive: new Date().toISOString() 
    };
    leads.push(lead);
    saveData(LEADS_PATH, leads);
  }

  if (botConfig.api?.aiEnabled) {
    const state = userStates[from] || { history: [] };
    const response = await handleAIRequest(text, state.history, botConfig);
    await sendWhatsApp(from, response);
    state.history.push({ role: 'user', content: text }, { role: 'assistant', content: response });
    if (state.history.length > 10) state.history = state.history.slice(-10);
    userStates[from] = state;
    saveData(USERS_STATE_PATH, userStates);
  } else {
    const flow = botConfig.chatFlow || [];
    let state = userStates[from] || { stepIndex: 0 };
    if (text.toLowerCase() === 'reset') state.stepIndex = 0;
    else state.stepIndex = (state.stepIndex + 1) % (flow.length || 1);
    const step = flow[state.stepIndex] || { message: "Hello! How can I help?" };
    await sendWhatsApp(from, step.message, step.options || []);
    userStates[from] = state;
    saveData(USERS_STATE_PATH, userStates);
  }
}

// --- API ROUTES ---

// Health check for VPS monitoring
app.get('/api/status', (req, res) => res.json({ 
  status: 'online', 
  domain: 'chatbot.orangewebservice.com',
  timestamp: new Date().toISOString() 
}));

// Meta Webhook Verification
app.get('/webhook', (req, res) => {
  const token = botConfig.meta?.webhookVerifyToken || 'propai_secure_v1';
  if (req.query['hub.verify_token'] === token) return res.send(req.query['hub.challenge']);
  res.sendStatus(403);
});

// Meta Webhook Receiver
app.post('/webhook', async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (msg) {
    const from = msg.from;
    const text = msg.text?.body || msg.interactive?.button_reply?.title || "";
    await handleIncoming(from, text);
  }
  res.sendStatus(200);
});

// Dashboard Config API
app.get('/api/config', (req, res) => res.json(botConfig));
app.post('/api/config', (req, res) => {
  botConfig = req.body;
  saveData(CONFIG_PATH, botConfig);
  res.json({ success: true });
});

// Lead Management API
app.get('/api/leads', (req, res) => res.json(leads));

// Catch-all to serve index.html (React SPA Routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ***************************************************
  🚀 PropAI Bot Engine is running!
  📡 Port: ${PORT}
  🌍 Domain: https://chatbot.orangewebservice.com
  📂 Data Root: ${DATA_DIR}
  ***************************************************
  `);
});
