import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, remove, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDFUGYOobmVxYFQMBYz1iQ4z1HIrdbTi8Q",
  authDomain: "travel-55c4b.firebaseapp.com",
  databaseURL: "https://travel-55c4b-default-rtdb.firebaseio.com",
  projectId: "travel-55c4b",
  storageBucket: "travel-55c4b.firebasestorage.app",
  messagingSenderId: "925227625640",
  appId: "1:925227625640:web:bdc242cbddf8e1d6f8a69d",
  measurementId: "G-K1B4N26V1T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 資料區
const STATIC_EVENTS = {
    hotels: [
        { date: "2026-01-20", time: "15:00", title: "🏨 入住: 利夫馬克斯", desc: "札幌站前店", type: "hotel" },
        { date: "2026-01-21", time: "10:00", title: "👋 退房", desc: "前往星野", type: "hotel-out" },
        { date: "2026-01-21", time: "15:00", title: "🏨 入住: 星野度假村", desc: "連住2晚", type: "hotel" },
        { date: "2026-01-23", time: "11:00", title: "👋 退房", desc: "回札幌", type: "hotel-out" },
        { date: "2026-01-23", time: "15:00", title: "🏨 入住: 條紋住宅飯店", desc: "連住2晚", type: "hotel" },
        { date: "2026-01-25", time: "11:00", title: "👋 退房", desc: "前往機場", type: "hotel-out" }
    ]
};
let itineraryData = { "2026-01-20": [], "2026-01-21": [], "2026-01-22": [], "2026-01-23": [], "2026-01-24": [], "2026-01-25": [] };

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initItineraryData();
    updateCountdown();
    window.renderItineraryTabs();
    renderTimeline("2026-01-20");
    updateHomeCard();
    listenToFirebase(); // 啟動雲端同步
});

// Firebase 監聽
function listenToFirebase() {
    onValue(ref(db, 'todos'), (snap) => renderTodoList(snap.val()));
    onValue(ref(db, 'budget'), (snap) => renderBudgetList(snap.val()));
}

// 功能區 (掛載到 window 讓 HTML 可以呼叫)
window.addTodo = () => {
    const val = document.getElementById('new-todo-input').value.trim();
    if(val) { set(push(ref(db, 'todos')), { text: val, done: false }); document.getElementById('new-todo-input').value = ''; }
}
window.toggleTodo = (id, status) => update(ref(db, 'todos/' + id), { done: !status });
window.deleteTodo = (e, id) => { e.stopPropagation(); remove(ref(db, 'todos/' + id)); };

window.addBudget = () => {
    const item = document.getElementById('budget-item').value.trim();
    const amount = parseInt(document.getElementById('budget-amount').value);
    if(item && amount) { 
        set(push(ref(db, 'budget')), { item, amount }); 
        document.getElementById('budget-item').value = ''; 
        document.getElementById('budget-amount').value = ''; 
    }
}

// 渲染 UI
function renderTodoList(data) {
    const el = document.getElementById('checklist-container');
    if(!data) { el.innerHTML = ''; return; }
    el.innerHTML = Object.keys(data).map(k => {
        const t = data[k];
        return `<li class="flex items-center bg-white p-3 rounded-xl shadow-sm mb-2" onclick="window.toggleTodo('${k}', ${t.done})">
            <div class="w-5 h-5 rounded border ${t.done?'bg-green-400 border-green-400':'border-gray-300'} mr-3 flex justify-center items-center text-white text-xs">${t.done?'✔':''}</div>
            <span class="${t.done?'line-through text-gray-300':'text-gray-700'} flex-1">${t.text}</span>
            <button onclick="window.deleteTodo(event, '${k}')"><i class="fa-solid fa-trash text-gray-300"></i></button>
        </li>`;
    }).join('');
}

function renderBudgetList(data) {
    const el = document.getElementById('budget-list');
    const tot = document.getElementById('budget-total');
    if(!data) { el.innerHTML = '<div class="text-center text-gray-400 text-sm mt-4">尚無紀錄</div>'; tot.innerText='0'; return; }
    const arr = Object.values(data).reverse();
    el.innerHTML = arr.map(i => `<div class="flex justify-between p-3 border-b border-gray-50 bg-white first:rounded-t-lg last:rounded-b-lg"><span>${i.item}</span><span class="font-bold">¥${i.amount}</span></div>`).join('');
    tot.innerText = arr.reduce((a,b)=>a+b.amount,0).toLocaleString();
}

// 基礎功能
const MY_PASSWORD = "2026";
window.checkPassword = () => {
    if(document.getElementById('password-input').value === MY_PASSWORD) {
        document.getElementById('lock-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('lock-screen').style.display='none', 500);
    } else {
        alert("密碼錯誤 (預設 2026)");
    }
};

// 行程處理
function initItineraryData() {
    itineraryData["2026-01-20"].push({time:"09:30", title:"✈️ 去程 BR116", desc:"桃機 -> CTS", type:"flight"});
    itineraryData["2026-01-25"].push({time:"18:40", title:"✈️ 回程 TR893", desc:"CTS -> 桃機", type:"flight"});
    STATIC_EVENTS.hotels.forEach(h => itineraryData[h.date]?.push(h));
    Object.keys(itineraryData).forEach(d => itineraryData[d].sort((a,b)=>a.time.localeCompare(b.time)));
}

window.renderItineraryTabs = () => {
    document.getElementById('date-tabs-container').innerHTML = Object.keys(itineraryData).map((d,i) => 
        `<button onclick="window.selectDate('${d}', this)" class="date-tab-btn flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${i===0?'bg-blue-500 text-white':'bg-white text-gray-500'}">Day ${i+1}</button>`
    ).join('');
}

window.selectDate = (d, btn) => {
    document.querySelectorAll('.date-tab-btn').forEach(b => b.className = b.className.replace('bg-blue-500 text-white', 'bg-white text-gray-500'));
    btn.className = btn.className.replace('bg-white text-gray-500', 'bg-blue-500 text-white');
    renderTimeline(d);
}

function renderTimeline(d) {
    const evs = itineraryData[d] || [];
    document.getElementById('timeline-container').innerHTML = evs.length ? evs.map(e => 
        `<div class="relative"><div class="absolute -left-[33px] bg-white border w-8 h-8 rounded-full flex justify-center items-center"><i class="fa-solid fa-circle text-blue-500 text-xs"></i></div>
        <div class="bg-white rounded-xl p-4 shadow-sm mb-4"><div class="flex justify-between font-bold text-blue-900"><span>${e.title}</span><span class="text-blue-400 bg-blue-50 px-2 rounded text-xs">${e.time}</span></div><p class="text-xs text-gray-500 mt-1">${e.desc}</p></div></div>`
    ).join('') : '<div class="text-gray-400 text-sm">無行程</div>';
}

function updateCountdown() {
    const diff = new Date("2026-01-20") - new Date();
    document.getElementById('countdown-days').textContent = Math.max(0, Math.ceil(diff/(86400000)));
}
function updateHomeCard() {
    document.getElementById('dynamic-info-card').innerHTML = `<div class="flex items-center"><i class="fa-solid fa-plane text-blue-500 text-2xl mr-4"></i><div><h3 class="font-bold">即將出發</h3><p class="text-sm text-gray-500">準備好護照了嗎？</p></div></div>`;
}
window.switchTab = (id) => {
    document.querySelectorAll('.view-section').forEach(e => e.classList.add('hidden'));
    document.getElementById('view-'+id).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.replace('text-blue-500', 'text-gray-400'));
    document.querySelector(`[data-target="${id}"]`).classList.replace('text-gray-400', 'text-blue-500');
}
