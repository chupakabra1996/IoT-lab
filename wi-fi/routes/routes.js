const weather = require('../weather-api')

let appRouter = function (app) {

  app.get('/data', function (req, resp) {
    weather.weather()
      .then( res => {
        resp.send(res)
      })
      .catch( err => {
        resp.send('ERROR')
      })
  });
}

function _convertToString(weather) {
  let res = '';
  console.log(weather.time);

  res += `Time : ${weather.time}\n`;
  res += `${weather.summary}\n`;
  res += `Temperature : ${weather.temperature}\n`;
  res += `Humidity : ${weather.humidity}\n`;
  res += `Pressure : ${weather.pressure}`;

  return res;
}


module.exports = appRouter;
