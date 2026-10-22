export interface CallRecord {
  id: number;
  number: string;
  name?: string;
  date: number; // timestamp in ms
  duration: number; // in seconds
  type: number; // 1 = INCOMING, 2 = OUTGOING, 3 = MISSED, 4 = VOICEMAIL, 5 = REJECTED, 6 = BLOCKED
  isRead: number; // 1 or 0
  newCall?: number;
  cachedMatchedNumber?: string;
}

export type PermissionState = 'granted' | 'denied' | 'prompt';

export type NumbersMode = 'single' | 'multiple';
export type DistributionMode = 'total' | 'per_number';

export interface InjectionParams {
  targetNumbers: string[];
  hoursWindow: number;
  callCount: number;
  distributionMode: DistributionMode;
}

export interface InjectionResult {
  success: boolean;
  message: string;
  count: number;
  numbersCount: number;
  timestamp: number;
  generatedIds?: number[];
  error?: string;
}

export type ActivePhoneScreen = 'injector' | 'dialer' | 'database';
