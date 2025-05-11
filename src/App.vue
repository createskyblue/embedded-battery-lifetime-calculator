<template>
  <div class="max-w-4xl mx-auto p-5 font-sans">
    <h1 class="text-2xl font-bold mb-6">电池低功耗计算器</h1>
    
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
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">名称</th>
            <th class="border p-2 text-left">电流(mA)</th>
            <th class="border p-2 text-left">单次运行时间</th>
            <th class="border p-2 text-left">运行间隔(dd:hh:mm:ss)</th>
            <th class="border p-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index" class="border">
            <td class="border p-1">
              <input 
                v-model="item.name" 
                placeholder="项目名称"
                class="w-full px-2 py-1 border rounded"
              />
            </td>
            <td class="border p-1">
              <input 
                v-model.number="item.current" 
                type="number" 
                placeholder="电流"
                class="w-full px-2 py-1 border rounded"
              />
            </td>
            <td class="border p-1">
              <input 
                v-model="item.duration" 
                placeholder="00:00:00"
                class="w-full px-2 py-1 border rounded"
              />
            </td>
            <td class="border p-1">
              <input 
                v-model="item.interval" 
                placeholder="00:00:00:00"
                class="w-full px-2 py-1 border rounded"
              />
            </td>
            <td class="border p-1">
              <button 
                @click="removeItem(index)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as echarts from 'echarts'
import axios from 'axios'
import './styles/index.css'
const projectName = ref('');
const batteryCapacity = ref(null);
const idleCurrent = ref(null);
const items = ref([{
  name: '',
  current: null,
  duration: '',
  interval: ''
}]);

const addItem = () => {
  items.value.push({
    name: '',
    current: null,
    duration: '',
    interval: ''
  });
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

// 将时间字符串(hh:mm:ss或dd:hh:mm:ss)转换为秒数
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    // hh:mm:ss格式
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 4) {
    // dd:hh:mm:ss格式
    return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
  }
  return 0;
};

const calculateBatteryLife = () => {
  if (!batteryCapacity.value) return '00:00:00:00';
  
  let totalEnergy = 0; // 总能量消耗(mAh)
  let hasActiveItems = false;
  
  // 计算所有任务的能量消耗
  items.value.forEach(item => {
    if (item.current && item.duration && item.interval) {
      const durationSec = parseTimeToSeconds(item.duration);
      const intervalSec = parseTimeToSeconds(item.interval);
      
      if (durationSec > 0 && intervalSec > 0) {
        // 计算任务占空比和平均电流
        const dutyCycle = durationSec / intervalSec;
        const avgCurrent = item.current * dutyCycle;
        totalEnergy += avgCurrent;
        hasActiveItems = true;
      }
    }
  });
  
  // 添加待机电流
  if (idleCurrent.value) {
    if (hasActiveItems) {
      // 有任务时，待机电流按(1 - 占空比)计算
      totalEnergy += idleCurrent.value * (1 - (totalEnergy / (totalEnergy + idleCurrent.value)));
    } else {
      // 无任务时，完全使用待机电流
      totalEnergy = idleCurrent.value;
      hasActiveItems = true;
    }
  }
  
  if (!hasActiveItems) return '00:00:00:00';
  if (totalEnergy === 0) return '00:00:00:00';
  
  // 计算总小时数
  const totalHours = batteryCapacity.value / totalEnergy;
  
  // 转换为年、天、小时、分钟、秒
  const totalSeconds = Math.floor(totalHours * 3600);
  const totalDays = Math.floor(totalSeconds / 86400);
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let result = '';
  if (years > 0) result += `${years}年`;
  if (days > 0 || years > 0) result += `${days}天`;
  if (hours > 0 || days > 0 || years > 0) result += `${hours}时`;
  if (minutes > 0 || hours > 0 || days > 0 || years > 0) result += `${minutes}分`;
  result += `${seconds}秒`;
  
  return result || '0秒';
};
</script>

<style scoped>
/* Tailwind classes are used in template */
</style>
