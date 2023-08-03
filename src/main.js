import { render } from './framework/render.js';
import NewEventButtonView from './view/new-event-button-view.js';
import TripPresenter from './presenter/trip-presenter.js';
import ApiModel from '../src/model/api-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import EventsApiService from './events-api-service.js';
import EventCommonModel from './model/event-common-model.js';
import EventCommonApiService from './event-common-api-service.js';

const AUTHORIZATION = 'Basic err883iXWqVjM';
const END_POINT = 'https://19.ecmascript.pages.academy/big-trip-simple';

const filterModel = new FilterModel();

const apiModel = new ApiModel({
  eventsApiService: new EventsApiService(END_POINT, AUTHORIZATION)
});

const eventCommonModel = new EventCommonModel({
  eventCommonApiService: new EventCommonApiService(END_POINT, AUTHORIZATION)
});

const tripEventsContentElement = document.querySelector('.trip-events__content');
const tripEventsSortElement = document.querySelector('.trip-events__sort');
const filterContainer = document.querySelector('.trip-controls__filters');
const tripMain = document.querySelector('.trip-main');


const tripPresenter = new TripPresenter({
  tripContainer: tripEventsContentElement,
  sortContainer: tripEventsSortElement,
  apiModel,
  eventCommonModel,
  filterModel,
  onNewEventDestroy: handleNewEventFormClose
});

const filterPresenter = new FilterPresenter({
  filterContainer,
  filterModel,
  apiModel
});

const newEventButtonComponent = new NewEventButtonView({
  onClick: handleNewEventButtonClick
});

function handleNewEventFormClose() {
  newEventButtonComponent.element.disabled = false;
}

function handleNewEventButtonClick() {
  tripPresenter.createEvent();
  newEventButtonComponent.element.disabled = true;
}

filterPresenter.init();
tripPresenter.init();

Promise.all([
  apiModel.init(),
  eventCommonModel.init()])
  .then(() => {
    render(newEventButtonComponent, tripMain);
  });
