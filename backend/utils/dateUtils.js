function toDate(value, fieldName) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const label = fieldName ? ` for ${fieldName}` : '';
    throw new Error(`Invalid date${label}`);
  }
  return date;
}

function startOfDayUtc(date) {
  const d = toDate(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function diffNights(checkIn, checkOut) {
  const inDate = startOfDayUtc(checkIn);
  const outDate = startOfDayUtc(checkOut);
  const ms = outDate.getTime() - inDate.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    throw new Error('check_out must be after check_in');
  }
  return nights;
}

function overlaps(existingStart, existingEnd, newStart, newEnd) {
  const aStart = startOfDayUtc(existingStart);
  const aEnd = startOfDayUtc(existingEnd);
  const bStart = startOfDayUtc(newStart);
  const bEnd = startOfDayUtc(newEnd);
  return aStart < bEnd && aEnd > bStart;
}

function daysBetweenUtc(dateA, dateB) {
  const a = startOfDayUtc(dateA);
  const b = startOfDayUtc(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

module.exports = {
  toDate,
  startOfDayUtc,
  diffNights,
  overlaps,
  daysBetweenUtc
};
