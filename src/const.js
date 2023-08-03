const EVENTS_TYPE = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

const DATE_FORMAT = {
  Full: 'YYYY-MM-DD',
  Day: 'MMM DD',
  Time: 'HH:mm',
  FormTime: 'DD/MM/YY HH:mm',
  FullTime: 'YYYY-MM-DDTHH:mm',
  Date: 'd/m/y H:i',
};

const FilterType = {
  ALL: 'everything',
  FUTURE: 'future',
};

const SortType = {
  DATE: 'date',
  PRICE: 'price',
};

const UserAction = {
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT_EVENT: 'INIT_EVENT',
  INIT_EVENT_COMMON: 'INIT_EVENT_COMMON',
  ERROR_LOADING: 'ERROR_LOADING'
};

export { EVENTS_TYPE, DATE_FORMAT, FilterType, SortType, UserAction, UpdateType };
