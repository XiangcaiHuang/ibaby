var forever = require('forever-monitor');

  var child = new (forever.Monitor)('server.js', {
    max: 3,
    silent: true,
    args: []
  });

  child.on('exit', function () {
    console.log('your-filename.js has exited after 3 restarts');
  });

  child.start();