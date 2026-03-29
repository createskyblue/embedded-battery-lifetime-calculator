import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTimeToSeconds,
  intervalToRunsPerDay,
  runsPerDayToInterval,
  formatSecondsToInterval,
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
