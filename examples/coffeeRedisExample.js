(function(){
  var flow, generateDay, recordClick, redis, sys;
  sys = require('sys');
  flow = require('../flow');
  redis = require('./redisclient');
  recordClick = flow.define(function(client, dayNumber, callback) {
    this.client = client;
    this.dayNumber = dayNumber;
    this.callback = callback;
    return this.client.incr('sequence:click_ids', this);
  }, function(err, clickId) {
    if (err) {
      throw new Error(err);
    }
    this.clickId = clickId;
    return this.client.set('click:' + clickId + ':ip_address', '10.0.0.1', this);
  }, function() {
    return this.client.sadd('day:' + this.dayNumber + ':clicks', this.clickId, this);
  }, function() {
    sys.puts("added click " + this.clickId + " to day_number " + this.dayNumber);
    return this.callback.call();
  });
  generateDay = flow.define(function(client, dayNumber, callback) {
    var _a, _b, _c, _d, _e, clickNumber;
    this.dayNumber = dayNumber;
    this.callback = callback;
    _a = []; _d = 0; _e = 100;
    for (_c = 0, clickNumber = _d; (_d <= _e ? clickNumber < _e : clickNumber > _e); (_d <= _e ? clickNumber += 1 : clickNumber -= 1), _c++) {
      _a.push(recordClick(client, dayNumber, this.spool()));
    }
    return _a;
  }, function() {
    sys.puts("added dayNumber " + this.dayNumber);
    return this.callback.call();
  });
  flow.exec(function() {
    this.client = new redis.Client();
    return this.client.connect(this);
  }, function() {
    return this.client.select(15, this);
  }, function() {
    var _a, _b, _c, _d, _e, dayNumber;
    _a = []; _d = 0; _e = 2;
    for (_c = 0, dayNumber = _d; (_d <= _e ? dayNumber < _e : dayNumber > _e); (_d <= _e ? dayNumber += 1 : dayNumber -= 1), _c++) {
      _a.push(generateDay(this.client, dayNumber, this.spool()));
    }
    return _a;
  }, function() {
    sys.puts("i guess i'm done!");
    return this.client.quit();
  });
})();
