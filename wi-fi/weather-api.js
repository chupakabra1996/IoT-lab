const Forecast = require('forecast')
const dateFormat = require('dateformat')

const forecast = new Forecast({
  service : 'forecast.io',
  key : '0999b7ec57a4767568a9eb3824282847',
  units : 'celcius',
  cache : true,
  ttl : {
    minutes : 2
  }
});

module.exports.weather = function weather() {
  return new Promise((resolve, reject) => {
    forecast.get([55.6873206, 49.1468123], true, (err, weather) => {
      if(err) reject(err);
      else {
        let curr = weather.currently;
        let time = dateFormat(curr.time * 1000, 'dddd, mmmm dS, yyyy, HH:MM:ss');
        resolve({
          time : time,
          summary : curr.summary,
          temperature : curr.temperature + ' \u2103',
          humidity : curr.humidity * 100 + '%',
          pressure : (curr.pressure / 1.3332239).toFixed(2) + ' mmHg'
        })
      }
    });
  });

}
