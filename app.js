// --- 1. 核心資料與設定 ---

// 基礎設定
const TRIP_CONFIG = {
    startDate: "2026-01-20",
    endDate: "2026-01-25"
};

// 固定行程資料 (航班 & 住宿)
const STATIC_EVENTS = {
    outboundFlight: {
        time: "09:30",
        endTime: "14:05",
        title: "✈️ 去程航班 BR116 (長榮)",
        desc: "桃機 T2 ➔ 新千歲 CTS | 飛行 3h35m",
        type: "flight"
    },
    inboundFlight: {
        time: "18:40",
        endTime: "22:30",
        title: "✈️ 回程航班 TR893 (酷航)",
        desc: "新千歲 CTS ➔ 桃機 T1 | 飛行 4h50m",
        type: "flight"
    },
    hotels: [
        { date: "2026-01-20", time: "15:00", title: "🏨 入住: 利夫馬克斯經濟型飯店", desc: "札幌站前店 | 15:00-22:30 入住", type: "hotel" },
        { date: "2026-01-21", time: "10:00", title: "👋 退房: 利夫馬克斯", desc: "前往星野度假村", type: "hotel-out" },
        { date: "2026-01-21", time: "15:00", title: "🏨 入住: 星野度假村 (Hoshino)", desc: "享受度假村設施 (連住2晚)", type: "hotel" },
        { date: "2026-01-23", time: "11:00", title: "👋 退房: 星野度假村", desc: "移動回札幌市區", type: "hotel-out" },
        { date: "2026-01-23", time: "15:00", title: "🏨 入住: 札幌條紋住宅飯店", desc: "Randor Hotel / Stripe (連住2晚)", type: "hotel" },
        { date: "2026-01-25", time: "11:00", title: "👋 退房: 札幌條紋住宅飯店", desc: "準備前往機場", type: "hotel-out" }
    ]
};

// 行程表結構 (預設空白，稍後自動填入)
let itineraryData = {
    "2026-01-20": [],
    "2026-01-21": [],
    "2026-01-22": [{ time: "09:00", title: "星野度假村全日遊", desc: "滑雪、愛絲冰城、水之教堂", type: "activity" }],
    "2026-01-23": [],
    "2026-01-24": [{ time: "10:00", title: "札幌市區觀光", desc: "自由安排", type: "activity" }],
    "2026-01-25": []
};

// 待辦清單資料
let todoList = [
    { id: 1, text: "檢查護照有效期", done: false },
    { id: 2, text: "購買網卡/漫遊", done: false },
    { id: 3, text: "換日幣 (現金)", done: false },
    { id: 4, text: "準備個人藥品", done: false },
    { id: 5, text: "保暖衣物 (發熱衣/手套/毛帽)", done: false },
    { id: 6, text: "VJW 入境登錄", done: false }
];

// 記帳資料
let budgetList = [];

// --- 2. 初始化程式 (網頁載入後執行) ---

document.addEventListener('DOMContentLoaded', () => {
    initItineraryData(); // 1. 整理資料
    updateCountdown();   // 2. 啟動倒數
    renderItineraryTabs(); // 3. 畫出日期按鈕
    renderTimeline("2026-01-20"); // 4. 畫出第一天行程
    renderTodoList();    // 5. 畫出清單
    renderBudgetList();  // 6. 畫出記帳
    updateHomeCard();    // 7. 更新首頁資訊
    
    // 每分鐘更新一次倒數
    setInterval(updateCountdown, 60000);
});

// --- 3. 核心功能函式 ---

// [功能] 將固定航班住宿資料，插入到行程表中
function initItineraryData() {
    itineraryData["2026-01-20"].push(STATIC_EVENTS.outboundFlight);
    itineraryData["2026-01-25"].push(STATIC_EVENTS.inboundFlight);
    
    STATIC_EVENTS.hotels.forEach(h => {
        if(itineraryData[h.date]) {
            itineraryData[h.date].push(h);
        }
    });

    // 根據時間排序
    Object.keys(itineraryData).forEach(date => {
        itineraryData[date].sort((a, b) => a.time.localeCompare(b.time));
    });
}

// [功能] 倒數計時計算
function updateCountdown() {
    const target = new Date(TRIP_CONFIG.startDate + "T00:00:00").getTime();
    const now = new Date().getTime();
    const diff = target - now;
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const displayDays = days > 0 ? days : 0;
    
    document.getElementById('countdown-days').textContent = displayDays;
}

// [功能] 頁面切換 (底部導覽列)
function switchTab(tabId) {
    // 隱藏所有頁面
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    // 顯示目標頁面
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    
    // 更新按鈕顏色
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.dataset.target === tabId) {
            btn.classList.remove('text-gray-400');
            btn.classList.add('text-hokkaido-primary', 'active');
        } else {
            btn.classList.add('text-gray-400');
            btn.classList.remove('text-hokkaido-primary', 'active');
        }
    });

    if(tabId === 'home') updateHomeCard();
}

// [功能] 首頁顯示當前重點
function updateHomeCard() {
    const card = document.getElementById('dynamic-info-card');
    // 這裡示範顯示去程資訊
    card.innerHTML = `
        <div class="flex items-start">
            <div class="bg-blue-100 text-blue-600 rounded-lg p-3 mr-4">
                <i class="fa-solid fa-plane-departure text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">即將開始：去程航班</h3>
                <p class="text-sm text-gray-600 mt-1">BR116 (長榮) 09:30</p>
                <p class="text-xs text-gray-400 mt-1">請記得提早 2.5 小時抵達桃機 T2</p>
            </div>
        </div>
    `;
}

// [功能] 產生行程日期按鈕
function renderItineraryTabs() {
    const container = document.getElementById('date-tabs-container');
    const dates = Object.keys(itineraryData);
    
    let html = '';
    dates.forEach((date, index) => {
        const dayNum = index + 1;
        const simpleDate = date.slice(5).replace('-', '/');
        // 第一天預設選取
        const activeClass = index === 0 ? 'bg-hokkaido-primary text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100';
        
        html += `
            <button onclick="selectDate('${date}', this)" 
                class="date-tab-btn flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeClass}">
                Day ${dayNum} (${simpleDate})
            </button>
        `;
    });
    container.innerHTML = html;
}

// [功能] 選擇日期
function selectDate(date, btnElement) {
    document.querySelectorAll('.date-tab-btn').forEach(btn => {
        btn.classList.remove('bg-hokkaido-primary', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-500', 'border');
    });
    btnElement.classList.remove('bg-white', 'text-gray-500', 'border');
    btnElement.classList.add('bg-hokkaido-primary', 'text-white', 'shadow-md');
    
    renderTimeline(date);
}

// [功能] 產生當日時間軸
function renderTimeline(date) {
    const container = document.getElementById('timeline-container');
    const events = itineraryData[date] || [];
    
    if (events.length === 0) {
        container.innerHTML = `<div class="text-gray-400 text-sm italic">本日尚無行程</div>`;
        return;
    }

    let html = '';
    events.forEach(event => {
        let icon = 'fa-circle';
        let colorClass = 'text-gray-400';
        
        // 根據類型給不同圖標
        if(event.type === 'flight') { icon = 'fa-plane'; colorClass = 'text-blue-500'; }
        else if(event.type === 'hotel') { icon = 'fa-bed'; colorClass = 'text-indigo-500'; }
        else if(event.type === 'hotel-out') { icon = 'fa-suitcase'; colorClass = 'text-orange-400'; }
        else if(event.type === 'activity') { icon = 'fa-camera'; colorClass = 'text-emerald-500'; }

        html += `
            <div class="relative">
                <div class="absolute -left-[33px] bg-white border border-gray-100 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                    <i class="fa-solid ${icon} ${colorClass} text-xs"></i>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-50 mb-2">
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="font-bold text-hokkaido-dark">${event.title}</span>
                        <span class="text-xs font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded">${event.time}</span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed">${event.desc}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// [功能] 產生清單
function renderTodoList() {
    const container = document.getElementById('checklist-container');
    let html = '';
    todoList.forEach(item => {
        const textStyle = item.done ? 'line-through text-gray-300' : 'text-gray-700';
        const bgCheck = item.done ? 'bg-green-400 border-green-400' : 'border-gray-300';
        
        html += `
            <li class="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-50" onclick="toggleTodo(${item.id})">
                <div class="w-5 h-5 rounded border ${bgCheck} flex items-center justify-center mr-3 transition-colors">
                    ${item.done ? '<i class="fa-solid fa-check text-white text-xs"></i>' : ''}
                </div>
                <span class="${textStyle} flex-1">${item.text}</span>
                <button onclick="deleteTodo(event, ${item.id})" class="text-gray-300 hover:text-red-400 px-2">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </li>
        `;
    });
    container.innerHTML = html;
}

// [功能] 切換清單勾選狀態
function toggleTodo(id) {
    const item = todoList.find(t => t.id === id);
    if(item) {
        item.done = !item.done;
        renderTodoList();
    }
}

// [功能] 新增清單項目
function addTodo() {
    const input = document.getElementById('new-todo-input');
    const text = input.value.trim();
    if(text) {
        todoList.push({ id: Date.now(), text: text, done: false });
        input.value = '';
        renderTodoList();
    }
}

// [功能] 刪除清單項目
function deleteTodo(e, id) {
    e.stopPropagation(); 
    todoList = todoList.filter(t => t.id !== id);
    renderTodoList();
}

// [功能] 新增記帳
function addBudget() {
    const itemInput = document.getElementById('budget-item');
    const amountInput = document.getElementById('budget-amount');
    
    const item = itemInput.value.trim();
    const amount = parseInt(amountInput.value);
    
    if(item && amount) {
        budgetList.push({ item, amount });
        itemInput.value = '';
        amountInput.value = '';
        renderBudgetList();
    }
}

// [功能] 產生記帳列表
function renderBudgetList() {
    const listContainer = document.getElementById('budget-list');
    const totalEl = document.getElementById('budget-total');
    
    let html = '';
    
    [...budgetList].reverse().forEach((record) => {
        html += `
            <div class="flex justify-between items-center bg-white p-3 rounded-lg border-b border-gray-50 last:border-0">
                <span class="text-gray-700">${record.item}</span>
                <span class="font-bold text-gray-900">¥${record.amount.toLocaleString()}</span>
            </div>
        `;
    });
    
    const grandTotal = budgetList.reduce((sum, curr) => sum + curr.amount, 0);
    
    listContainer.innerHTML = html || '<div class="text-center text-gray-400 py-4 text-sm">尚未有消費紀錄</div>';
    totalEl.textContent = grandTotal.toLocaleString();
}
