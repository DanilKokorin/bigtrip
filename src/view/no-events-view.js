import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const NoEventsTextType = {
  [FilterType.ALL]: 'Click New Event to create your first Event',
  [FilterType.FUTURE]: 'There are no future events now',
};

function createNoEventsTemplate(filterType) {
  const noTaskTextValue = NoEventsTextType[filterType];

  return (
    `<p class="trip-events__msg">
      ${noTaskTextValue}
    </p>`
  );
}

export default class NoEventsView extends AbstractView {
  #filterType = null;

  constructor({ filterType }) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoEventsTemplate(this.#filterType);
  }
}
