import Constants from 'expo-constants';

function getExecutionEnvironmentLabel() {
  const environment = Constants.executionEnvironment;

  if (environment === 'storeClient') {
    return 'Expo Go';
  }

  if (environment === 'standalone') {
    return 'Standalone app build';
  }

  return 'Development build';
}

export function getBuildDetails() {
  return [
    {
      label: 'App version',
      value: Constants.expoConfig?.version ?? 'Unknown',
    },
    {
      label: 'Android package',
      value: Constants.expoConfig?.android?.package ?? 'Unknown',
    },
    {
      label: 'Runtime',
      value: getExecutionEnvironmentLabel(),
    },
  ];
}
