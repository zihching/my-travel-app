const { createApp, ref } = Vue;

const app = createApp({
  setup() {
    // 這裡是你的行程資料 (假資料)
    const tripData = ref([
      {
        date: 'Day 1 - 12/25',
        locations: [
          { id: 1, time: '10:00', name: '新千歲機場', type: 'transport', note: '記得買 JR PASS' },
          { id: 2, time: '12:30', name: '根室花丸壽司', type: 'restaurant', note: '必吃干貝' },
          { id: 3, time: '15:00', name: '小樽運河', type: 'sight', note: '傍晚拍照最美' },
          { id: 4, time: '18:00', name: 'Dormy Inn', type: 'accommodation', note: '有溫泉和宵夜' }
        ]
      },
      {
        date: 'Day 2 - 12/26',
        locations: [
          { id: 5, time: '09:00', name: '二條市場', type: 'restaurant', note: '早餐吃海鮮丼' },
          { id: 6, time: '11:00', name: '白色戀人公園', type: 'sight', note: '做餅乾體驗' }
        ]
      }
    ]);

    return { tripData };
  }
});

// 定義卡片組件
app.component('location-card', {
  props: ['location'],
  template: `
    <div @click="openMap(location.name)" class="flex items-center w-full p-4 mb-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer">
      <div class="w-16 text-center border-r border-gray-200 pr-3 mr-4 font-mono font-bold text-gray-500">
        {{ location.time }}
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-gray-800">{{ location.name }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ location.note }}</p>
      </div>
      <div class="text-2xl">
        <span v-if="location.type === 'restaurant'">🍜</span>
        <span v-else-if="location.type === 'sight'">📸</span>
        <span v-else-if="location.type === 'accommodation'">🏨</span>
        <span v-else>🚆</span>
      </div>
    </div>
  `,
  methods: {
    openMap(name) {
      window.open('https://www.google.com/maps/search/?api=1&query=' + name, '_blank');
    }
  }
});

app.mount('#app');