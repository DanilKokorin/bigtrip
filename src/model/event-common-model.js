import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class EventCommonModel extends Observable {
  #eventCommonApiService = null;
  #eventCommon = null;

  constructor({ eventCommonApiService }) {
    super();
    this.#eventCommonApiService = eventCommonApiService;
  }

  get eventCommon() {
    return this.#eventCommon;
  }

  async init() {
    let allOffers, allDestinations;
    try {
      [allOffers, allDestinations] = await Promise.all([
        this.#eventCommonApiService.offers,
        this.#eventCommonApiService.destinations
      ]);
      this.#eventCommon = { allOffers, allDestinations };
      this._notify(UpdateType.INIT_EVENT_COMMON);
    } catch (err) {
      this._notify(UpdateType.ERROR_LOADING);
      throw new Error('Error loading data from server');
    }
  }
}
