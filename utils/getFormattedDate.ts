function getFormattedDate(date: Date) {
  const dateObj = new Date(date);
  var year = dateObj.getFullYear().toString();

  var month = (1 + dateObj.getMonth()).toString();
  // month = month.length > 1 ? month : "0" + month;

  var day = dateObj.getDate().toString();
  // day = day.length > 1 ? day : "0" + day;

  return (
    month + "/" + day + "/" + `${year[year.length - 2]}${year[year.length - 1]}`
  );
}

export default getFormattedDate;
