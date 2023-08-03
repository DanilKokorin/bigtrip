import dayjs from 'dayjs';

const formatDate = (date, format) => dayjs(date).format(format);

const isFuture = (dateFrom) => dateFrom && (dayjs().isSame(dateFrom, 'D') || dayjs().isBefore(dateFrom, 'D'));

export { formatDate, isFuture };
