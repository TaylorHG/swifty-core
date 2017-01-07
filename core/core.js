import express from 'express';

export default class SwiftyCore {
  constructor() {
    console.log('Spawning Application...');
    this.httpHandler = express();
    app.all(/.*/, function(req, res, next) {
      console.log('request recieved!');
      // use SwiftResolver to find or create modules to handle the request.
      res.send("Here's a response!");
    });
    app.listen(1337, function () {
      console.log('Started listening on port 1337...');
    });
    console.log('Application Spawned! Listening for requests...\n\n\n');
  }
}
