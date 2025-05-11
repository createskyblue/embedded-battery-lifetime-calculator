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
</script>

<style scoped>
/* Tailwind classes are used in template */
</style>
