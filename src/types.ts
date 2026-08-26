export type Shot = {
  id: string;
  uri: string;
  createdAtMs: number;
  bytes: number;
  width: number;
  height: number;
  dateStamp: string;
  climateStamp: string;
};

export type ClockState = {
  deadlineMs: number;
  source: 'live' | 'cache' | 'fallback';
  fetchedAtMs: number;
};

export type Route =
  | { name: 'camera' }
  | { name: 'review'; shot: Shot }
  | { name: 'gallery' }
  | { name: 'shot'; shot: Shot };
