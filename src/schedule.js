export const SECONDS_PER_DAY = 24 * 60 * 60;
export const MILLISECONDS_PER_SECOND = 1000;

export const CURRENT_UNIT_FACTORS = {
  A: 1000,
  mA: 1,
  uA: 0.001,
  nA: 0.000001,
};

export const CAPACITY_UNIT_FACTORS = {
  Ah: 1000,
  mAh: 1,
  uAh: 0.001,
  nAh: 0.000001,
};

export const CONTINUOUS_INTERVAL = 'continuous';

const toSafeNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const intervalPartsToSeconds = (parts = {}) => {
  const days = toSafeNumber(parts.days);
  const hours = toSafeNumber(parts.hours);
  const minutes = toSafeNumber(parts.minutes);
  const seconds = toSafeNumber(parts.seconds);
  const milliseconds = toSafeNumber(parts.milliseconds);

  return days * SECONDS_PER_DAY
    + hours * 3600
    + minutes * 60
    + seconds
    + milliseconds / MILLISECONDS_PER_SECOND;
};

export const secondsToIntervalParts = (totalSeconds) => {
  const numericSeconds = Number(totalSeconds);
  if (!Number.isFinite(numericSeconds) || numericSeconds <= 0) {
    return {
      days: '',
      hours: '',
      minutes: '',
      seconds: '',
      milliseconds: '',
    };
  }

  const wholeSeconds = Math.floor(numericSeconds);
  const milliseconds = Math.round((numericSeconds - wholeSeconds) * MILLISECONDS_PER_SECOND);
  const days = Math.floor(wholeSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((wholeSeconds % SECONDS_PER_DAY) / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;

  return {
    days: String(days),
    hours: String(hours),
    minutes: String(minutes),
    seconds: String(seconds),
    milliseconds: String(milliseconds),
  };
};

export const normalizeIntervalParts = (parts = {}) => {
  return secondsToIntervalParts(intervalPartsToSeconds(parts));
};

export const formatIntervalFromParts = (parts = {}) => {
  const normalizedParts = normalizeIntervalParts(parts);
  const hasValue = Object.values(normalizedParts).some((value) => value !== '');
  if (!hasValue) {
    return '';
  }

  const days = normalizedParts.days.padStart(2, '0');
  const hours = normalizedParts.hours.padStart(2, '0');
  const minutes = normalizedParts.minutes.padStart(2, '0');
  const seconds = normalizedParts.seconds.padStart(2, '0');
  const milliseconds = normalizedParts.milliseconds;

  return `${days}:${hours}:${minutes}:${seconds}${milliseconds ? `.${milliseconds.padStart(3, '0')}` : ''}`;
};

export const formatTimeSummary = (timeStr) => {
  if (!timeStr) {
    return '点击设置';
  }

  if (isContinuousInterval(timeStr)) {
    return '持续运行';
  }

  const parts = secondsToIntervalParts(parseTimeToSeconds(timeStr));
  const labels = [
    ['days', '天'],
    ['hours', '时'],
    ['minutes', '分'],
    ['seconds', '秒'],
    ['milliseconds', '毫秒'],
  ];

  const segments = labels
    .filter(([key]) => parts[key] && parts[key] !== '0')
    .map(([key, label]) => `${Number(parts[key])}${label}`);

  return segments.length > 0 ? segments.join(' ') : '0秒';
};

export const shouldSyncRunsPerDayInput = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return false;
  }

  if (!/^[\d]*\.?\d*$/.test(normalized)) {
    return false;
  }

  return !normalized.endsWith('.');
};

export const isContinuousInterval = (interval) => interval === CONTINUOUS_INTERVAL;

export const formatRunsPerDayDisplay = (interval) => {
  return isContinuousInterval(interval) ? '持续运行' : '';
};

export const currentToMilliAmps = (value, unit = 'mA') => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue * (CURRENT_UNIT_FACTORS[unit] ?? 1);
};

export const capacityToMilliAmpHours = (value, unit = 'mAh') => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue * (CAPACITY_UNIT_FACTORS[unit] ?? 1);
};

export const isIntervalValid = (duration, interval) => {
  if (isContinuousInterval(interval)) {
    return true;
  }

  const durationSeconds = typeof duration === 'number' ? duration : parseTimeToSeconds(duration);
  const intervalSeconds = typeof interval === 'number' ? interval : parseTimeToSeconds(interval);

  if (!durationSeconds || !intervalSeconds) {
    return true;
  }

  return intervalSeconds >= durationSeconds;
};

export const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;

  const normalized = String(timeStr).trim();
  if (!normalized) return 0;

  const timeParts = normalized.split('.');
  const mainTime = timeParts[0];
  const milliseconds = timeParts[1] ? Number(timeParts[1]) / 1000 : 0;

  const parts = mainTime.split(':').map(Number);

  if (parts.some(Number.isNaN) || Number.isNaN(milliseconds)) {
    return 0;
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + milliseconds;
  }

  if (parts.length === 4) {
    return parts[0] * SECONDS_PER_DAY + parts[1] * 3600 + parts[2] * 60 + parts[3] + milliseconds;
  }

  return 0;
};

export const formatSecondsToInterval = (totalSeconds) => {
  const numericSeconds = Number(totalSeconds);
  if (!Number.isFinite(numericSeconds) || numericSeconds <= 0) {
    return '';
  }

  const roundedSeconds = Math.round(numericSeconds);
  const days = Math.floor(roundedSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((roundedSeconds % SECONDS_PER_DAY) / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = roundedSeconds % 60;

  return [days, hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

export const formatRunsPerDay = (runsPerDay) => {
  const numericRuns = Number(runsPerDay);
  if (!Number.isFinite(numericRuns) || numericRuns <= 0) {
    return '';
  }

  return Number.isInteger(numericRuns)
    ? String(numericRuns)
    : numericRuns.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};

export const intervalToRunsPerDay = (interval) => {
  if (isContinuousInterval(interval)) {
    return '';
  }

  const intervalSeconds = typeof interval === 'number' ? interval : parseTimeToSeconds(interval);
  if (!intervalSeconds) {
    return '';
  }

  return formatRunsPerDay(SECONDS_PER_DAY / intervalSeconds);
};

export const runsPerDayToInterval = (runsPerDay) => {
  const numericRuns = Number(runsPerDay);
  if (!Number.isFinite(numericRuns) || numericRuns <= 0) {
    return '';
  }

  return formatSecondsToInterval(SECONDS_PER_DAY / numericRuns);
};
