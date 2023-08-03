import { FilterType } from '../const';
import { isFuture } from './day.js';

const filter = {
  [FilterType.ALL]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter((event) => isFuture(event.dateFrom, event.dateTo))
};


export { filter };
