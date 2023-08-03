import dayjs from 'dayjs';

function getWeightForNullParam (a, b) {
  if (a === null && b === null) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return null;
}

function sortDate (eventA, eventB) {
  const weight = getWeightForNullParam(eventA.dateFrom, eventB.dateFrom);

  return weight ?? dayjs(eventA.dateFrom).diff(dayjs(eventB.dateFrom));
}

function sortPrice (eventA, eventB) {
  const weight = getWeightForNullParam(eventA.price, eventB.price);

  return weight ?? eventB.basePrice - eventA.basePrice;
}

export { sortDate, sortPrice };
