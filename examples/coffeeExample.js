(function(){
  var auth, db, dbGet, flow, sys;
  sys = require("sys");
  flow = require("../flow");
  db = {
    'userId:kelpie': 1,
    'userId:josh': 2,
    'user:1:password': 'foo',
    'user:2:password': 'bar'
  };
  dbGet = function dbGet(key, callback) {
    return setTimeout((function() {
      return callback(db[key]);
    }), 1);
  };
  auth = flow.define(function(username, password) {
    sys.puts("trying " + username + ", " + password);
    this.password = password;
    return dbGet('userId:' + username, this);
  }, function(userId) {
    return dbGet('user:' + userId + ':password', this);
  }, function(passwordInDb) {
    return passwordInDb === this.password ? sys.puts("Authed!") : sys.puts("Failed!");
  });
  auth('kelpie', 'test');
  auth('kelpie', 'foo');
})();
