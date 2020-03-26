function doWork(text, data) {
  console.log(text + data + text);
}

new Promise(function (resolve, reject) {
    var a = 5;
    if (a) {
      setTimeout(function () {
        resolve(a);
      }, 3000);
    } else {
      reject(a);
    }
  })
  .then(doWork.bind(null, 'text'))
  .catch(console.error);