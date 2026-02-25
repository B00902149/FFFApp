import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

export const initHealthConnect = async (): Promise<boolean> => {
  const isInitialized = await initialize();
  return isInitialized;
};

export const requestHealthPermissions = async () => {
  const permissions = await requestPermission([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'HeartRate' },
    { accessType: 'read', recordType: 'Weight' },
    { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  ]);
  return permissions;
};

export const fetchHealthData = async () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const timeRangeFilter = {
    operator: 'between' as const,
    startTime: startOfDay.toISOString(),
    endTime: now.toISOString(),
  };

  // Steps
  const stepsData = await readRecords('Steps', { timeRangeFilter });
  const totalSteps = stepsData.records.reduce((sum, r) => sum + r.count, 0);

  // Heart Rate (latest)
  const hrData = await readRecords('HeartRate', { timeRangeFilter });
  const latestHR = hrData.records.at(-1)?.samples?.at(-1)?.beatsPerMinute ?? null;

  // Weight (latest in last 30 days)
  const weightStart = new Date(now);
  weightStart.setDate(weightStart.getDate() - 30);
  const weightData = await readRecords('Weight', {
    timeRangeFilter: {
      operator: 'between',
      startTime: weightStart.toISOString(),
      endTime: now.toISOString(),
    },
  });
  const latestWeight = weightData.records.at(-1)?.weight?.inKilograms ?? null;

  // Sleep (last night)
  const sleepStart = new Date(now);
  sleepStart.setDate(sleepStart.getDate() - 1);
  sleepStart.setHours(20, 0, 0, 0);
  const sleepData = await readRecords('SleepSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime: sleepStart.toISOString(),
      endTime: now.toISOString(),
    },
  });
  const sleepHours = sleepData.records.reduce((sum, r) => {
    const ms = new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
    return sum + ms / 3600000;
  }, 0);

  // Calories
  const caloriesData = await readRecords('ActiveCaloriesBurned', { timeRangeFilter });
  const totalCalories = caloriesData.records.reduce(
    (sum, r) => sum + r.energy.inKilocalories, 0
  );

  return {
    steps: totalSteps,
    heartRate: latestHR,
    weight: latestWeight ? `${latestWeight.toFixed(1)}kg` : null,
    sleep: sleepHours > 0 ? `${sleepHours.toFixed(1)}hrs` : null,
    calories: Math.round(totalCalories),
  };
};