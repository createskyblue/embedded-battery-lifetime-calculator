<template>
  <div class="max-w-7xl mx-auto p-5 font-sans">
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
      <label class="inline-block w-32 mr-3">电池容量:</label>
      <div class="inline-flex gap-2 items-center">
        <input
          v-model.number="batteryCapacity"
          type="number"
          placeholder="输入电池容量"
          class="px-3 py-2 border rounded w-48"
        />
        <select
          v-model="batteryCapacityUnit"
          class="px-3 py-2 border rounded bg-white"
        >
          <option v-for="unit in batteryCapacityUnits" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
    </div>

    <div class="mb-4">
      <label class="inline-block w-32 mr-3">待机电流:</label>
      <div class="inline-flex gap-2 items-center">
        <input
          v-model.number="idleCurrent"
          type="number"
          placeholder="输入待机电流"
          class="px-3 py-2 border rounded w-48"
        />
        <select
          v-model="idleCurrentUnit"
          class="px-3 py-2 border rounded bg-white"
        >
          <option v-for="unit in currentUnits" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
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
            <th class="p-3 text-left w-32">输入方式</th>
            <th class="p-3 text-left w-44">电流 / 单次耗电量</th>
            <th class="p-3 text-left">单次运行时间</th>
            <th class="p-3 text-left">运行间隔</th>
            <th class="p-3 text-left w-32">每天运行次数</th>
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
              <select
                v-model="item.inputMode"
                :disabled="!item.enabled"
                @change="validateInterval(index)"
                :class="['w-full px-2 py-2 border rounded-md text-sm bg-white transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
              >
                <option value="current">电流×时长</option>
                <option value="charge">单次耗电量</option>
              </select>
            </td>
            <td class="p-3">
              <div v-if="!isChargeInputMode(item)" class="flex gap-2">
                <input
                  v-model.number="item.current"
                  type="number"
                  placeholder="数值"
                  :disabled="!item.enabled"
                  :class="['flex-1 min-w-0 px-3 py-2 border rounded-md text-sm transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
                />
                <select
                  v-model="item.currentUnit"
                  :disabled="!item.enabled"
                  :class="['w-20 px-2 py-2 border rounded-md text-sm bg-white transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
                >
                  <option v-for="unit in currentUnits" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
              <div v-else class="flex gap-2">
                <input
                  v-model.number="item.charge"
                  type="number"
                  placeholder="数值"
                  :disabled="!item.enabled"
                  :class="['flex-1 min-w-0 px-3 py-2 border rounded-md text-sm transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
                />
                <select
                  v-model="item.chargeUnit"
                  :disabled="!item.enabled"
                  :class="['w-20 px-2 py-2 border rounded-md text-sm bg-white transition-colors', item.enabled ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
                >
                  <option v-for="unit in batteryCapacityUnits" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
              <div
                v-if="item.enabled && isChargeInputMode(item) && isContinuousInterval(item.interval)"
                class="text-xs text-gray-500 mt-1"
              >
                持续运行时按每天耗电量计
              </div>
            </td>
            <td class="p-3">
              <button
                type="button"
                @click="openTimeEditor(index, 'duration')"
                :disabled="!item.enabled || isDurationNotNeeded(item)"
                :class="timeDisplayClass(item.enabled && !isDurationNotNeeded(item), item.hasError)"
              >
                {{ isDurationNotNeeded(item) ? '不需要设置' : getTimeSummary(item.duration) }}
              </button>
              <div v-if="item.enabled && item.hasError && !isDurationNotNeeded(item)" class="text-red-500 text-xs mt-1">
                运行间隔必须大于等于单次运行时间
              </div>
            </td>
            <td class="p-3">
              <button
                type="button"
                @click="openTimeEditor(index, 'interval')"
                :disabled="!item.enabled"
                :class="timeDisplayClass(item.enabled, item.hasError)"
              >
                {{ getTimeSummary(item.interval) }}
              </button>
            </td>
            <td class="p-3">
              <input
                v-model="item.runsPerDay"
                @input="handleRunsPerDayInput(index)"
                @blur="handleRunsPerDayBlur(index)"
                type="text"
                inputmode="decimal"
                :placeholder="isContinuousInterval(item.interval) ? '持续运行' : '次数/天'"
                :disabled="!item.enabled || isContinuousInterval(item.interval)"
                :class="['w-full px-3 py-2 border rounded-md text-sm transition-colors', item.enabled && !isContinuousInterval(item.interval) ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' : 'bg-gray-100 border-gray-200 cursor-not-allowed']"
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
      <el-dialog
        v-model="editorVisible"
        :title="editorField === 'interval' ? '编辑运行间隔' : '编辑单次运行时间'"
        width="680px"
        @closed="closeTimeEditor"
      >
        <div v-if="editorField === 'interval'" class="mb-4 flex items-center gap-3 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-gray-700">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="editorDraftIsContinuous"
              @change="toggleContinuousInterval($event.target.checked)"
            />
            <span>持续运行</span>
          </label>
          <span class="text-xs text-gray-500">{{ editorContinuousHint }}</span>
        </div>
        <div class="grid grid-cols-5 gap-3" :class="editorDraftIsContinuous ? 'opacity-50 pointer-events-none' : ''">
          <div>
            <div class="text-sm text-gray-600 mb-1">天</div>
            <input v-model="editorDraftParts.days" type="number" min="0" @input="handleEditorInput" @blur="handleEditorBlur" :class="intervalPartInputClass(true, editorHasError)" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">小时</div>
            <input v-model="editorDraftParts.hours" type="number" min="0" @input="handleEditorInput" @blur="handleEditorBlur" :class="intervalPartInputClass(true, editorHasError)" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">分钟</div>
            <input v-model="editorDraftParts.minutes" type="number" min="0" @input="handleEditorInput" @blur="handleEditorBlur" :class="intervalPartInputClass(true, editorHasError)" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">秒</div>
            <input v-model="editorDraftParts.seconds" type="number" min="0" @input="handleEditorInput" @blur="handleEditorBlur" :class="intervalPartInputClass(true, editorHasError)" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">毫秒</div>
            <input v-model="editorDraftParts.milliseconds" type="number" min="0" @input="handleEditorInput" @blur="handleEditorBlur" :class="intervalPartInputClass(true, editorHasError)" />
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          预览：<span class="font-mono text-gray-800">{{ editorDraftIsContinuous ? '持续运行' : (formatIntervalFromParts(editorDraftParts) || '未设置') }}</span>
        </div>
        <div v-if="editorHasError && !editorDraftIsContinuous" class="mt-3 text-sm text-red-500">
          运行间隔必须大于等于单次运行时间
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeTimeEditor" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">取消</button>
            <button type="button" @click="confirmTimeEditor" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300" :disabled="editorHasError">确认</button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  parseTimeToSeconds,
  intervalToRunsPerDay,
  runsPerDayToInterval,
  formatRunsPerDay,
  currentToMilliAmps,
  capacityToMilliAmpHours,
  secondsToIntervalParts,
  normalizeIntervalParts,
  formatIntervalFromParts,
  formatTimeSummary,
  shouldSyncRunsPerDayInput,
  isIntervalValid,
  CONTINUOUS_INTERVAL,
  isContinuousInterval,
  formatRunsPerDayDisplay,
  isChargeInputMode,
  computeTotalAverageCurrentMilliAmps,
} from './schedule';
import './styles/index.css'
const projectName = ref('');
const batteryCapacity = ref(null);
const batteryCapacityUnit = ref('mAh');
const idleCurrent = ref(null);
const idleCurrentUnit = ref('mA');
const currentUnits = ['A', 'mA', 'uA', 'nA'];
const batteryCapacityUnits = ['Ah', 'mAh', 'uAh', 'nAh'];
const createEmptyIntervalParts = () => ({
  days: '',
  hours: '',
  minutes: '',
  seconds: '',
  milliseconds: '',
});
const createDefaultItem = () => ({
  enabled: true,
  name: '',
  inputMode: 'current',
  current: null,
  currentUnit: 'mA',
  charge: null,
  chargeUnit: 'mAh',
  duration: '',
  interval: '',
  intervalParts: createEmptyIntervalParts(),
  runsPerDay: '',
  hasError: false,
});
const items = ref([createDefaultItem()]);
const editorVisible = ref(false);
const editorIndex = ref(null);
const editorField = ref('interval');
const editorDraftParts = ref(createEmptyIntervalParts());
const editorHasError = ref(false);
const editorDraftIsContinuous = ref(false);
const editorItem = computed(() => (editorIndex.value === null ? null : items.value[editorIndex.value]));
const editorContinuousHint = computed(() => (
  isChargeInputMode(editorItem.value)
    ? '开启后按每天耗电量计算平均电流'
    : '开启后将不再要求填写单次运行时间，并按 100% 占空比计算'
));

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

const intervalPartInputClass = (enabled, hasError) => ([
  'w-full min-w-0 px-2 py-2 border rounded-md text-sm transition-colors',
  enabled
    ? `${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 outline-none bg-white`
    : 'bg-gray-100 border-gray-200 cursor-not-allowed',
]);

const timeDisplayClass = (enabled, hasError) => ([
  'w-full min-h-10 px-3 py-2 border rounded-md text-sm text-left transition-colors',
  enabled
    ? `${hasError ? 'border-red-500 text-red-600 hover:border-red-600' : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'} cursor-pointer`
    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed',
]);

const isDurationNotNeeded = (item) => isChargeInputMode(item) || isContinuousInterval(item.interval);

const getItemTimeParts = (item, field) => {
  const value = item[field];
  if (!value || isContinuousInterval(value)) {
    return createEmptyIntervalParts();
  }

  return secondsToIntervalParts(parseTimeToSeconds(value));
};

const toggleContinuousInterval = (checked) => {
  editorDraftIsContinuous.value = checked;
  if (checked) {
    editorDraftParts.value = createEmptyIntervalParts();
  }
  updateEditorError();
};

const updateEditorError = () => {
  if (editorIndex.value === null) {
    editorHasError.value = false;
    return;
  }

  const item = items.value[editorIndex.value];
  if (isChargeInputMode(item)) {
    // 耗电量模式不使用单次运行时间，无需与运行间隔做交叉校验
    editorHasError.value = false;
    return;
  }

  const draftValue = editorDraftIsContinuous.value ? CONTINUOUS_INTERVAL : formatIntervalFromParts(editorDraftParts.value);
  const otherField = editorField.value === 'interval' ? 'duration' : 'interval';

  if (!draftValue || !item[otherField]) {
    editorHasError.value = false;
    return;
  }

  editorHasError.value = !isIntervalValid(
    editorField.value === 'duration' ? draftValue : item.duration,
    editorField.value === 'interval' ? draftValue : item.interval,
  );
};

const openTimeEditor = (index, field) => {
  const item = items.value[index];
  if (!item.enabled) {
    return;
  }

  editorIndex.value = index;
  editorField.value = field;
  editorDraftIsContinuous.value = field === 'interval' && isContinuousInterval(item.interval);
  editorDraftParts.value = getItemTimeParts(item, field);
  editorVisible.value = true;
  updateEditorError();
};

const handleEditorInput = () => {
  updateEditorError();
};

const handleEditorBlur = () => {
  if (editorDraftIsContinuous.value) {
    updateEditorError();
    return;
  }

  editorDraftParts.value = normalizeIntervalParts(editorDraftParts.value);
  updateEditorError();
};

const closeTimeEditor = () => {
  editorVisible.value = false;
  editorIndex.value = null;
  editorField.value = 'interval';
  editorDraftParts.value = createEmptyIntervalParts();
  editorHasError.value = false;
  editorDraftIsContinuous.value = false;
};

const confirmTimeEditor = () => {
  if (editorIndex.value === null) {
    return;
  }

  handleEditorBlur();
  if (editorHasError.value) {
    return;
  }

  const item = items.value[editorIndex.value];
  const formattedValue = editorDraftIsContinuous.value ? CONTINUOUS_INTERVAL : formatIntervalFromParts(editorDraftParts.value);
  item[editorField.value] = formattedValue;

  if (editorField.value === 'interval') {
    item.intervalParts = editorDraftIsContinuous.value
      ? createEmptyIntervalParts()
      : (formattedValue ? { ...editorDraftParts.value } : createEmptyIntervalParts());
    item.runsPerDay = editorDraftIsContinuous.value ? formatRunsPerDayDisplay(formattedValue) : intervalToRunsPerDay(formattedValue);
  }

  validateInterval(editorIndex.value);
  closeTimeEditor();
};

const getTimeSummary = (value) => formatTimeSummary(value);

const validateInterval = (index) => {
  const item = items.value[index];
  if (isChargeInputMode(item) || isContinuousInterval(item.interval) || !item.duration || !item.interval) {
    item.hasError = false;
    return;
  }

  item.hasError = !isIntervalValid(item.duration, item.interval);
};

const syncRunsPerDayFromInterval = (item) => {
  item.runsPerDay = isContinuousInterval(item.interval)
    ? formatRunsPerDayDisplay(item.interval)
    : intervalToRunsPerDay(item.interval);
};

const syncIntervalPartsFromInterval = (item) => {
  item.intervalParts = isContinuousInterval(item.interval)
    ? createEmptyIntervalParts()
    : secondsToIntervalParts(parseTimeToSeconds(item.interval));
};

const syncIntervalFromRunsPerDay = (item) => {
  item.interval = runsPerDayToInterval(item.runsPerDay);
  syncIntervalPartsFromInterval(item);
};

const handleRunsPerDayInput = (index) => {
  const item = items.value[index];
  if (isContinuousInterval(item.interval) || !shouldSyncRunsPerDayInput(item.runsPerDay)) {
    return;
  }

  item.runsPerDay = formatRunsPerDay(item.runsPerDay);
  syncIntervalFromRunsPerDay(item);
  validateInterval(index);
};

const handleRunsPerDayBlur = (index) => {
  const item = items.value[index];
  if (isContinuousInterval(item.interval)) {
    item.runsPerDay = formatRunsPerDayDisplay(item.interval);
    return;
  }

  item.runsPerDay = formatRunsPerDay(item.runsPerDay);
  syncIntervalFromRunsPerDay(item);
  validateInterval(index);
};

const addItem = () => {
  items.value.push(createDefaultItem());
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

// 导出项目数据
const exportProject = () => {
  const projectData = {
    projectName: projectName.value,
    batteryCapacity: batteryCapacity.value,
    batteryCapacityUnit: batteryCapacityUnit.value,
    idleCurrent: idleCurrent.value,
    idleCurrentUnit: idleCurrentUnit.value,
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
      batteryCapacity.value = data.batteryCapacity ?? null;
      batteryCapacityUnit.value = data.batteryCapacityUnit || 'mAh';
      idleCurrent.value = data.idleCurrent ?? null;
      idleCurrentUnit.value = data.idleCurrentUnit || 'mA';
      items.value = (data.items || [createDefaultItem()]).map((item) => {
        const interval = item.interval || '';
        const isContinuous = isContinuousInterval(interval);
        return {
          ...createDefaultItem(),
          enabled: item.enabled ?? true,
          name: item.name || '',
          inputMode: item.inputMode === 'charge' ? 'charge' : 'current',
          current: item.current ?? null,
          currentUnit: item.currentUnit || 'mA',
          charge: item.charge ?? null,
          chargeUnit: item.chargeUnit || 'mAh',
          duration: item.duration || '',
          interval,
          intervalParts: isContinuous ? createEmptyIntervalParts() : (interval ? secondsToIntervalParts(parseTimeToSeconds(interval)) : createEmptyIntervalParts()),
          runsPerDay: isContinuous ? formatRunsPerDayDisplay(interval) : (item.runsPerDay || intervalToRunsPerDay(interval)),
          hasError: false,
        };
      });
      items.value.forEach((_, index) => validateInterval(index));
    } catch (error) {
      alert('导入失败: 文件格式不正确');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // 重置input以便重复选择同一文件
};

const calculateBatteryLife = () => {
  const batteryCapacityMilliAmpHours = capacityToMilliAmpHours(batteryCapacity.value, batteryCapacityUnit.value);
  if (!batteryCapacityMilliAmpHours) return '0年0天0时0分0秒';

  const idleCurrentMilliAmps = currentToMilliAmps(idleCurrent.value, idleCurrentUnit.value);
  const totalAvgCurrent = computeTotalAverageCurrentMilliAmps(items.value, idleCurrentMilliAmps);

  if (totalAvgCurrent <= 0) return '0年0天0时0分0秒';

  // 总秒数 = 容量(mAh) / 总平均电流(mA) × 3600
  const totalSeconds = Math.floor((batteryCapacityMilliAmpHours / totalAvgCurrent) * 3600);

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
