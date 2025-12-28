// --- 1. Firebase 設定 (使用相容模式) ---
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

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 2. 核心資料 ---
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

// --- 3. 初始化程式 ---
document.addEventListener('DOMContentLoaded', () => {
    initItineraryData();
    updateCountdown();
    renderItineraryTabs();
    renderTimeline("2026-01-20");
    updateHomeCard();
    
    // 監聽雲端資料 (清單 & 記帳)
    db.ref('todos').on('value', (snapshot) => {
        renderTodoList(snapshot.val());
    });
    db.ref('budget').on('value', (snapshot) => {
        renderBudgetList(snapshot.val());
    });

    setInterval(updateCountdown, 60000);
});
// --- 4. 功能邏輯 (全部掛載在全域) ---

// 密碼鎖功能
const MY_PASSWORD = "2026";
function checkPassword() {
    const input = document.getElementById('password-input');
    const screen = document.getElementById('lock-screen');
    if (input.value === MY_PASSWORD) {
        screen.style.opacity = '0';
        setTimeout(() => screen.style.display = 'none', 500);
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
        input.value = '';
    }
}
// 支援按 Enter 鍵
document.getElementById('password-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});

// 清單功能 (Firebase)
function addTodo() {
    const input = document.getElementById('new-todo-input');
    const val = input.value.trim();
    if(val) {
        db.ref('todos').push({ text: val, done: false });
        input.value = '';
    }
}
function toggleTodo(id, status) {
    db.ref('todos/' + id).update({ done: !status });
}
function deleteTodo(e, id) {
    e.stopPropagation();
    db.ref('todos/' + id).remove();
}

// 記帳功能 (Firebase)
function addBudget() {
    const i = document.getElementById('budget-item');
    const a = document.getElementById('budget-amount');
    const val = i.value.trim();
    const amt = parseInt(a.value);
    if(val && amt) {
        db.ref('budget').push({ item: val, amount: amt });
        i.value = ''; a.value = '';
    }
}

// 頁面渲染
function renderTodoList(data) {
    const el = document.getElementById('checklist-container');
    if(!data) { el.innerHTML = ''; return; }
    el.innerHTML = Object.keys(data).map(k => {
        const t = data[k];
        return `<li class="flex items-center bg-white p-3 rounded-xl shadow-sm mb-2" onclick="toggleTodo('${k}', ${t.done})">
            <div class="w-5 h-5 rounded border ${t.done?'bg-green-400 border-green-400':'border-gray-300'} mr-3 flex justify-center items-center text-white text-xs">${t.done?'✔':''}</div>
            <span class="${t.done?'line-through text-gray-300':'text-gray-700'} flex-1">${t.text}</span>
            <button onclick="deleteTodo(event, '${k}')"><i class="fa-solid fa-trash text-gray-300"></i></button>
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

// 基礎 UI 功能
function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(e => e.classList.add('hidden'));
    document.getElementById('view-'+id).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => {
        if(b.dataset.target === id) {
            b.classList.remove('text-gray-400'); b.classList.add('text-hokkaido-primary');
        } else {
            b.classList.add('text-gray-400'); b.classList.remove('text-hokkaido-primary');
        }
    });
    if(id === 'home') updateHomeCard();
}

function initItineraryData() {
    itineraryData["2026-01-20"].push({time:"09:30", title:"✈️ 去程 BR116", desc:"桃機 -> CTS", type:"flight"});
    itineraryData["2026-01-25"].push({time:"18:40", title:"✈️ 回程 TR893", desc:"CTS -> 桃機", type:"flight"});
    STATIC_EVENTS.hotels.forEach(h => itineraryData[h.date]?.push(h));
    Object.keys(itineraryData).forEach(d => itineraryData[d].sort((a,b)=>a.time.localeCompare(b.time)));
}

function renderItineraryTabs() {
    document.getElementById('date-tabs-container').innerHTML = Object.keys(itineraryData).map((d,i) => 
        `<button onclick="selectDate('${d}', this)" class="date-tab-btn flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border ${i===0?'bg-blue-500 text-white':'bg-white text-gray-500'}">Day ${i+1}</button>`
    ).join('');
}

function selectDate(d, btn) {
    document.querySelectorAll('.date-tab-btn').forEach(b => b.className = b.className.replace('bg-blue-500 text-white', 'bg-white text-gray-500'));
    btn.className = btn.className.replace('bg-white text-gray-500', 'bg-blue-500 text-white');
    renderTimeline(d);
}

function renderTimeline(d) {
    const evs = itineraryData[d] || [];
    const el = document.getElementById('timeline-container');
    if(!evs.length) { el.innerHTML = '<div class="text-gray-400 text-sm">無行程</div>'; return; }
    el.innerHTML = evs.map(e => 
        `<div class="relative"><div class="absolute -left-[33px] bg-white border w-8 h-8 rounded-full flex justify-center items-center"><i class="fa-solid fa-circle text-blue-500 text-xs"></i></div>
        <div class="bg-white rounded-xl p-4 shadow-sm mb-4"><div class="flex justify-between font-bold text-blue-900"><span>${e.title}</span><span class="text-blue-400 bg-blue-50 px-2 rounded text-xs">${e.time}</span></div><p class="text-xs text-gray-500 mt-1">${e.desc}</p></div></div>`
    ).join('');
}

function updateCountdown() {
    const diff = new Date("2026-01-20") - new Date();
    document.getElementById('countdown-days').textContent = Math.max(0, Math.ceil(diff/(86400000)));
}

function updateHomeCard() {
    document.getElementById('dynamic-info-card').innerHTML = `<div class="flex items-center"><i class="fa-solid fa-plane text-blue-500 text-2xl mr-4"></i><div><h3 class="font-bold">即將出發</h3><p class="text-sm text-gray-500">準備好護照了嗎？</p></div></div>`;
}
