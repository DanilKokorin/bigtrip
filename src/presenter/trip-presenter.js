import { render, RenderPosition, remove } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import NoEventsView from '../view/no-events-view.js';
import EventPresenter from './event-presenter';
import { SortType, UpdateType, UserAction, FilterType } from '../const.js';
import { sortDate, sortPrice } from '../utils/event.js';
import { filter } from '../utils/filter.js';
import NewEventPresenter from './new-event-presenter.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import ErrorLoadingView from '../view/error-loading-view.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class TripPresenter {
  #tripContainer = null;
  #sortContainer = null;
  #apiModel = null;
  #filterModel = null;
  #loadingComponent = new LoadingView();
  #tripComponent = new EventsListView();
  #noEventComponent = null;
  #newEventPresenter = null;
  #sortComponent = null;
  #currentSortType = SortType.DATE;
  #filterType = FilterType.ALL;
  #onNewEventDestroy = null;
  #isErrorLoading = false;
  #eventPresenter = new Map();
  #errorLoadingView = new ErrorLoadingView();
  #isEventLoading = true;
  #isEventCommonLoading = true;
  #eventCommonModel = null;
  #eventCommon = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({ tripContainer, sortContainer, apiModel, eventCommonModel, filterModel, onNewEventDestroy }) {
    this.#apiModel = apiModel;
    this.#tripContainer = tripContainer;
    this.#sortContainer = sortContainer;
    this.#filterModel = filterModel;
    this.#onNewEventDestroy = onNewEventDestroy;
    this.#eventCommonModel = eventCommonModel;
    this.#eventCommon = this.#eventCommonModel.eventCommon;

    this.#apiModel.addObserver(this.#handleModelEvent);
    this.#eventCommonModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    this.#filterType = this.#filterModel.filter;
    const events = this.#apiModel.events;
    const filteredEvents = filter[this.#filterType](events);

    switch (this.#currentSortType) {
      case SortType.DATE:
        filteredEvents.sort(sortDate);
        break;
      case SortType.PRICE:
        filteredEvents.sort(sortPrice);
        break;
    }

    return filteredEvents;
  }

  init() {
    this.#clearBoard();
    this.#renderBoard();
  }

  createEvent() {
    this.#currentSortType = SortType.DATE;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
    this.#newEventPresenter.init();
  }

  #createNewEventPresenter() {
    this.#newEventPresenter = new NewEventPresenter({
      eventListContainer: this.#tripComponent.element,
      eventCommon: this.#eventCommon,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#onNewEventDestroy,
    });
  }


  #renderNoEvent() {
    this.#noEventComponent = new NoEventsView({
      filterType: this.#filterType
    });

    render(this.#noEventComponent,
      this.#tripComponent.element,
      RenderPosition.AFTERBEGIN);
  }

  #handleModeChange = () => {
    this.#newEventPresenter.destroy();
    this.#eventPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventPresenter.get(update.id).setSaving();
        try {
          await this.#apiModel.updateEvent(updateType, update);
        } catch (err) {
          this.#eventPresenter.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_EVENT:
        this.#newEventPresenter.setSaving();
        try {
          await this.#apiModel.addEvent(updateType, update);
        } catch (err) {
          this.#newEventPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_EVENT:
        this.#eventPresenter.get(update.id).setDeleting();
        try {
          await this.#apiModel.deleteEvent(updateType, update);
        } catch (err) {
          this.#eventPresenter.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UpdateType.INIT_EVENT:
        this.#isEventLoading = false;
        break;
      case UpdateType.INIT_EVENT_COMMON:
        this.#eventCommon = this.#eventCommonModel.eventCommon;
        this.#isEventCommonLoading = false;
        break;
      case UpdateType.ERROR_LOADING:
        this.#isErrorLoading = true;
        remove(this.#loadingComponent);
        this.#clearBoard();
        this.#renderBoard();
        break;
    }
    if ((updateType === UpdateType.INIT_EVENT ||
      updateType === UpdateType.INIT_EVENT_COMMON) &&
      (!this.#isEventLoading && !this.#isEventCommonLoading)) {
      this.#createNewEventPresenter();
      remove(this.#loadingComponent);
      this.#clearBoard();
      this.#renderBoard();
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderBoard();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#sortContainer, RenderPosition.AFTERBEGIN);
  }

  #renderEvents(events) {
    events.forEach((event) => this.#renderEvent(event));
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#tripContainer);
  }

  #renderErrorLoading() {
    render(this.#errorLoadingView, this.#tripContainer);
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      tripEventContainer: this.#tripComponent.element,
      onModeChange: this.#handleModeChange,
      onDataChange: this.#handleViewAction,
      eventCommon: this.#eventCommon,
    });

    eventPresenter.init(event);
    this.#eventPresenter.set(event.id, eventPresenter);
  }

  #clearBoard({ resetSortType = false } = {}) {
    if (this.#newEventPresenter) {
      this.#newEventPresenter.destroy();
    }
    this.#eventPresenter.forEach((presenter) => presenter.destroy());
    this.#eventPresenter.clear();

    remove(this.#loadingComponent);
    remove(this.#sortComponent);
    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }
    if (resetSortType) {
      this.#currentSortType = SortType.DATE;
    }
  }

  #renderBoard() {
    if (this.#isErrorLoading) {
      this.#renderErrorLoading();
    }
    if ((this.#isEventLoading || this.#isEventCommonLoading) && !this.#isErrorLoading) {
      this.#renderLoading();
    }
    const events = this.events;
    const eventsCount = events.length;
    if (eventsCount === 0) {
      this.#renderNoEvent();
    } else {
      this.#renderSort();
      render(this.#tripComponent, this.#tripContainer);
      this.#renderEvents(events);
    }
  }
}
