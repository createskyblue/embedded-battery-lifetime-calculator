import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTimeToSeconds,
  intervalToRunsPerDay,
  runsPerDayToInterval,
  formatSecondsToInterval,
  intervalPartsToSeconds,
  secondsToIntervalParts,
  normalizeIntervalParts,
  formatIntervalFromParts,
  currentToMilliAmps,
  formatTimeSummary,
  shouldSyncRunsPerDayInput,
  capacityToMilliAmpHours,
  isIntervalValid,
  CONTINUOUS_INTERVAL,
  isContinuousInterval,
  formatRunsPerDayDisplay,
} from '../src/schedule.js';

test('converts interval to runs per day', () => {
  assert.equal(intervalToRunsPerDay('00:12:00:00'), '2');
});

test('converts runs per day to interval', () => {
  assert.equal(runsPerDayToInterval('4'), '00:06:00:00');
});

test('preserves decimal runs per day for uneven intervals', () => {
  assert.equal(intervalToRunsPerDay('00:10:00:00'), '2.4');
});

test('parses duration strings with milliseconds', () => {
  assert.equal(parseTimeToSeconds('00:00:01.500'), 1.5);
});

test('formats seconds into dd:hh:mm:ss', () => {
  assert.equal(formatSecondsToInterval(3661), '00:01:01:01');
});

test('converts interval parts to seconds', () => {
  assert.equal(intervalPartsToSeconds({ days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 500 }), 93784.5);
});

test('splits seconds into interval parts', () => {
  assert.deepEqual(secondsToIntervalParts(93784.5), {
    days: '1',
    hours: '2',
    minutes: '3',
    seconds: '4',
    milliseconds: '500',
  });
});

test('normalizes overflowing interval parts', () => {
  assert.deepEqual(normalizeIntervalParts({ days: '0', hours: '25', minutes: '61', seconds: '61', milliseconds: '1001' }), {
    days: '1',
    hours: '2',
    minutes: '2',
    seconds: '2',
    milliseconds: '1',
  });
});

test('formats interval parts into interval string', () => {
  assert.equal(formatIntervalFromParts({ days: '1', hours: '2', minutes: '3', seconds: '4', milliseconds: '5' }), '01:02:03:04.005');
});

test('formats compact time summary for table display', () => {
  assert.equal(formatTimeSummary('01:02:03:04.005'), '1天 2时 3分 4秒 5毫秒');
  assert.equal(formatTimeSummary(''), '点击设置');
});

test('defers runs-per-day sync while decimal input is incomplete', () => {
  assert.equal(shouldSyncRunsPerDayInput('1.'), false);
  assert.equal(shouldSyncRunsPerDayInput('0.'), false);
  assert.equal(shouldSyncRunsPerDayInput('1.25'), true);
  assert.equal(shouldSyncRunsPerDayInput('.5'), true);
  assert.equal(shouldSyncRunsPerDayInput('1.2.3'), false);
  assert.equal(shouldSyncRunsPerDayInput('abc'), false);
});

test('converts current units to milliamps', () => {
  assert.equal(currentToMilliAmps(2, 'A'), 2000);
  assert.equal(currentToMilliAmps(500, 'uA'), 0.5);
  assert.ok(Math.abs(currentToMilliAmps(800000, 'nA') - 0.8) < 1e-12);
});

test('converts battery capacity units to mAh', () => {
  assert.equal(capacityToMilliAmpHours(2, 'Ah'), 2000);
  assert.equal(capacityToMilliAmpHours(500, 'uAh'), 0.5);
  assert.ok(Math.abs(capacityToMilliAmpHours(800000, 'nAh') - 0.8) < 1e-12);
});

test('treats equal duration and interval as valid', () => {
  assert.equal(isIntervalValid('00:00:00:30', '00:00:00:30'), true);
  assert.equal(isIntervalValid('00:00:00:29', '00:00:00:30'), true);
  assert.equal(isIntervalValid('00:00:00:31', '00:00:00:30'), false);
});

test('treats continuous interval as valid without duration', () => {
  assert.equal(CONTINUOUS_INTERVAL, 'continuous');
  assert.equal(isContinuousInterval(CONTINUOUS_INTERVAL), true);
  assert.equal(isIntervalValid('', CONTINUOUS_INTERVAL), true);
  assert.equal(isIntervalValid('00:00:00:30', CONTINUOUS_INTERVAL), true);
});

test('does not derive runs per day for continuous interval', () => {
  assert.equal(formatRunsPerDayDisplay(CONTINUOUS_INTERVAL), '持续运行');
  assert.equal(intervalToRunsPerDay(CONTINUOUS_INTERVAL), '');
});
