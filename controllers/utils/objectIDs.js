var IDsToStrings = function(IDsArr) {
  var arr = [];
  IDsArr.forEach(function(id) {
    arr.push(id.toString());
  });
  return arr;
};

exports.IDsToStrings = IDsToStrings;
