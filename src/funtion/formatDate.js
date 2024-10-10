export const formatDate = date => {
  var day = date.getDate();
  var monthName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var month = monthName[date.getMonth()];
  var formatedDate = day + ' ' + month;
  return formatedDate;
};
