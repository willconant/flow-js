var sys = require('sys');
var flow = require ('../flow');

// these functions imitate asynchronous calls to a simple database

var db = {
	'userId:kelpie': 1,
	'userId:josh': 2,
	
	'user:1:password': 'foo',
	'user:2:password': 'bar'
};

function dbGet(key, callback) {
	setTimeout(function() {
		callback(db[key]);
	}, 1);
}


// this simple flow 

var auth = flow.define(function(username, password) {
		
		sys.puts("trying " + username + ", " + password);
		
		this.password = password;
		dbGet('userId:' + username, this);
		
	},function(userId) {
	
		dbGet('user:' + userId + ':password', this);
		
	},function(passwordInDb) {
	
		if (passwordInDb == this.password) {
			sys.puts("Authenticated!");
		}
		else {
			sys.puts("Failed Authentication!");
		}
	}
)

auth('kelpie', 'test');
auth('kelpie', 'foo');
