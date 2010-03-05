var sys = require('sys');
var flow = require ('../flow');
var redis = require ('./redisclient');

var recordClick = flow.define(		
	function(client, dayNumber, callback) {
		
		this.client = client;
		this.dayNumber = dayNumber;
		this.callback = callback;
		this.client.incr('sequence:click_ids', this);
		
	},function(err, clickId) {
		
		if (err) {
			throw new Error(err);
		}
		
		this.clickId = clickId;
		this.client.set('click:' + clickId + ':ip_address', '10.0.0.1', this);
		
	},function() {
	
		this.client.sadd('day:' + this.dayNumber + ':clicks', this.clickId, this);
		
	},function() {
	
		sys.puts("added click " + this.clickId + " to day_number " + this.dayNumber);
		this.callback.call();
		
	}
);
		
var generateDay = flow.define(
	function(client, dayNumber, callback) {
		
		this.dayNumber = dayNumber;
		this.callback = callback;
		for (var clickNumber = 0; clickNumber < 100; clickNumber++) {
			recordClick(client, dayNumber, this.spool());
		}
		
	},function() {
	
		sys.puts("added dayNumber " + this.dayNumber);
		this.callback.call();
		
	}
);

flow.exec(
	function() {
		this.client = new redis.Client();
		this.client.connect(this);
	},function() {
		this.client.select(15, this);
	},function() {
		for (var dayNumber = 0; dayNumber < 2; dayNumber++) {
			generateDay(this.client, dayNumber, this.spool());
		}
	},function() {
		sys.puts("i guess i'm done!");
		this.client.quit();
	}
);
