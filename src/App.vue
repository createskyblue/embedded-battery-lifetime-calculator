<template>
  <div class="max-w-4xl mx-auto p-5 font-sans">
    <h1 class="text-2xl font-bold mb-6">电池寿命计算器</h1>
    
    <div class="mb-4">
      <label class="inline-block w-32 mr-3">项目名称:</label>
      <input 
        v-model="projectName" 
        placeholder="输入项目名称"
        class="px-3 py-2 border rounded w-64"
      />
    </div>
    
    <div class="mb-4">
      <label class="inline-block w-32 mr-3">电池容量(mAh):</label>
      <input 
        v-model.number="batteryCapacity" 
        type="number" 
        placeholder="输入电池容量"
        class="px-3 py-2 border rounded w-64"
      />
    </div>

    <div class="mb-4">
      <label class="inline-block w-32 mr-3">待机电流(mA):</label>
      <input 
        v-model.number="idleCurrent" 
        type="number" 
        placeholder="输入待机电流"
        class="px-3 py-2 border rounded w-64"
      />
    </div>
    
    <div class="mt-8">
      <table class="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-800 text-white">
            <th class="p-3 text-center w-16">
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="allEnabled"
                  @change="toggleAll"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </th>
            <th class="p-3 text-left">名称</th>
            <th class="p-3 text-left w-28">电流(mA)</th>
            <th class="p-3 text-left">单次运行时间</th>
            <th class="p-3 text-left">运行间隔</th>
            <th class="p-3 text-center w-20">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in items"
            :key="index"
            :class="['border-b border-gray-200 transition-colors', item.enabled ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400']"
          >
            <td class="p-3 text-center">
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="item.enabled"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </td>
            <td class="p-3">
              <input
                v-model="item.name"
                placeholder="项目名称"
                :disabled="!item.enabled"
                :class="['w-full px-3 py-2 border rounded-md text-sm transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
              />
            </td>
            <td class="p-3">
              <input
                v-model.number="item.current"
                type="number"
                placeholder="mA"
                :disabled="!item.enabled"
                :class="['w-full px-3 py-2 border rounded-md text-sm transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
              />
            </td>
            <td class="p-3">
              <input
                v-model="item.duration"
                @blur="validateInterval(index)"
                placeholder="hh:mm:ss.ms"
                :disabled="!item.enabled"
                :class="['w-full px-3 py-2 border rounded-md text-sm font-mono transition-colors', item.enabled ? (item.hasError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500') + ' outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
              />
              <div v-if="item.enabled && item.hasError" class="text-red-500 text-xs mt-1">
                运行间隔必须大于单次运行时间
              </div>
            </td>
            <td class="p-3">
              <input
                v-model="item.interval"
                @blur="validateInterval(index)"
                placeholder="dd:hh:mm:ss"
                :disabled="!item.enabled"
                :class="['w-full px-3 py-2 border rounded-md text-sm font-mono transition-colors', item.enabled ? (item.hasError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500') + ' outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
              />
            </td>
            <td class="p-3 text-center">
              <button
                @click="removeItem(index)"
                class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors shadow-sm"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button 
        @click="addItem" 
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        添加项目
      </button>

      <div class="mt-8 p-4 bg-gray-100 rounded">
        <h2 class="text-xl font-semibold mb-2">电池寿命计算结果</h2>
        <div class="text-2xl font-mono">
          {{ calculateBatteryLife() }}
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <label class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
          导入项目
          <input 
            type="file" 
            accept=".json" 
            @change="importProject"
            class="hidden"
          >
        </label>
        <button 
          @click="exportProject"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          导出项目
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// import * as echarts from 'echarts'
import axios from 'axios'
import './styles/index.css'
const projectName = ref('');
const batteryCapacity = ref(null);
const idleCurrent = ref(null);
const items = ref([{
  enabled: true,
  name: '',
  current: null,
  duration: '',
  interval: ''
}]);

// 全选/取消全选
const allEnabled = computed(() => {
  return items.value.length > 0 && items.value.every(item => item.enabled);
});

const toggleAll = () => {
  const newValue = !allEnabled.value;
  items.value.forEach(item => {
    item.enabled = newValue;
  });
};

const validateInterval = (index) => {
  const item = items.value[index];
  if (!item.duration || !item.interval) {
    item.hasError = false;
    return;
  }
  
  const durationSec = parseTimeToSeconds(item.duration);
  const intervalSec = parseTimeToSeconds(item.interval);
  
  item.hasError = intervalSec <= durationSec;
};

const addItem = () => {
  items.value.push({
    enabled: true,
    name: '',
    current: null,
    duration: '',
    interval: '',
    hasError: false
  });
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

// 将时间字符串(hh:mm:ss.msms或dd:hh:mm:ss.msms)转换为秒数
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  
  // 分割毫秒部分
  const timeParts = timeStr.split('.');
  const mainTime = timeParts[0];
  const milliseconds = timeParts[1] ? Number(timeParts[1]) / 1000 : 0;
  
  const parts = mainTime.split(':').map(Number);
  if (parts.length === 3) {
    // hh:mm:ss格式
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + milliseconds;
  } else if (parts.length === 4) {
    // dd:hh:mm:ss格式
    return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3] + milliseconds;
  }
  return 0;
};

// 导出项目数据
const exportProject = () => {
  const projectData = {
    projectName: projectName.value,
    batteryCapacity: batteryCapacity.value,
    idleCurrent: idleCurrent.value,
    items: items.value,
    timestamp: new Date().toISOString()
  };
  
  const now = new Date();
  const fileName = `电池寿命计算_${projectName.value || '未命名'}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}${String(now.getMilliseconds()).padStart(3,'0')}.json`;
  
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 导入项目数据
const importProject = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      projectName.value = data.projectName || '';
      batteryCapacity.value = data.batteryCapacity || null;
      idleCurrent.value = data.idleCurrent || null;
      items.value = data.items || [{ name: '', current: null, duration: '', interval: '' }];
    } catch (error) {
      alert('导入失败: 文件格式不正确');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // 重置input以便重复选择同一文件
};

const calculateBatteryLife = () => {
  if (!batteryCapacity.value) return '0年0天0时0分0秒';

  let totalAvgCurrent = 0; // 总平均电流 (mA)

  // 计算每项任务的平均电流贡献（只计算启用的项目）
  items.value.forEach(item => {
    if (item.enabled && item.current && item.duration && item.interval) {
      const durationSec = parseTimeToSeconds(item.duration);
      const intervalSec = parseTimeToSeconds(item.interval);

      if (intervalSec > 0 && durationSec > 0) {
        // 平均电流 = 工作电流 × 占空比
        const avgCurrent = item.current * (durationSec / intervalSec);
        totalAvgCurrent += avgCurrent;
      }
    }
  });

  // 加上待机电流
  if (idleCurrent.value) {
    totalAvgCurrent += idleCurrent.value;
  }

  if (totalAvgCurrent === 0) return '0年0天0时0分0秒';

  // 总小时 = 容量 / 总平均电流
  const totalHours = batteryCapacity.value / totalAvgCurrent;
  const totalSeconds = Math.floor(totalHours * 3600);

  const years = Math.floor(totalSeconds / (365 * 86400));
  const days = Math.floor((totalSeconds % (365 * 86400)) / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = '';
  if (years > 0) result += `${years}年`;
  if (days > 0 || years > 0) result += `${days}天`;
  if (hours > 0 || days > 0 || years > 0) result += `${hours}时`;
  if (minutes > 0 || hours > 0 || days > 0 || years > 0) result += `${minutes}分`;
  result += `${seconds}秒`;

  return result;
};


</script>

<style scoped>
/* Tailwind classes are used in template */
</style>
