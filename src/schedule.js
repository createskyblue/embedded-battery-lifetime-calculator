export const SECONDS_PER_DAY = 24 * 60 * 60;

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
