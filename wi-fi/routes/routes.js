const json = require('../arduino.json');

let appRouter = function (app) {

  app.get('/data', function (req, resp) {
    resp.send(json);
  });

}

module.exports = appRouter;
