sys: require "sys"
flow: require "../flow"

db: {
	'userId:kelpie': 1
	'userId:josh': 2
	
	'user:1:password': 'foo'
	'user:2:password': 'bar'
}

dbGet: (key, callback) -> setTimeout( ( -> callback db[key] ), 1 )

auth: flow.define(
	(username, password) -> 
		sys.puts "trying " + username + ", " + password

		this.password: password
		dbGet('userId:' + username, this)
		
	(userId) ->
		dbGet('user:' + userId + ':password', this)
	
	(passwordInDb) ->
		if passwordInDb == this.password
			sys.puts "Authed!"
		else
			sys.puts "Failed!"
)
		
auth 'kelpie', 'test'
auth 'kelpie', 'foo'
