import { render, replace, remove } from '../framework/render.js';
import EventView from '../view/events-view.js';
import EventEditView from '../view/event-edit-view.js';
import { UserAction, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class EventPresenter {
  #tripEventContainer = null;

  #eventComponent = null;
  #eventEditComponent = null;

  #event = null;

  #handleModeChange = null;
  #mode = Mode.DEFAULT;
  #eventCommon = null;
  #handleDataChange = null;

  constructor({ tripEventContainer, eventCommon, onModeChange, onDataChange }) {
    this.#tripEventContainer = tripEventContainer;
    this.#handleModeChange = onModeChange;
    this.#handleDataChange = onDataChange;
    this.#eventCommon = eventCommon;
  }

  init(event) {
    this.#event = event;
    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#eventComponent = new EventView({
      event: this.#event,
      onEditClick: this.#handleEditClick,
      eventCommon: this.#eventCommon,
    });

    this.#eventEditComponent = new EventEditView({
      event: this.#event,
      onFormSubmit: this.#formSubmitHandler,
      onFormClose: this.#closeEventEditFormHandler,
      onDeleteClick: this.#deleteClickHandler,
      eventCommon: this.#eventCommon,
    });


    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this.#eventComponent, this.#tripEventContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      {
        replace(this.#eventComponent, prevEventComponent);
      }
    }

    if (this.#mode === Mode.EDITING) {
      {
        replace(this.#eventEditComponent, prevEventEditComponent);
        this.#mode = Mode.DEFAULT;
      }
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventEditComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#eventComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#eventEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#eventEditComponent.shake(resetFormState);
  }

  #replaceEventToForm() {
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToEvent() {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#eventEditComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };

  #handleEditClick = () => {
    this.#replaceEventToForm();
  };

  #formSubmitHandler = (update) => {
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      update
    );
  };

  #closeEventEditFormHandler = () => {
    this.#replaceFormToEvent();
    this.#eventEditComponent.reset(this.#event);
  };

  #deleteClickHandler = (event) => {
    this.#handleDataChange(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      event,
    );
  };
}
