sys: require 'sys'
flow: require '../flow'
redis: require './redisclient'

recordClick: flow.define(		
	(client, dayNumber, callback) ->
		this.client: client
		this.dayNumber: dayNumber
		this.callback: callback
		this.client.incr 'sequence:click_ids', this
		
	(err, clickId) ->
		if err then throw new Error(err)
		this.clickId: clickId
		this.client.set 'click:' + clickId + ':ip_address', '10.0.0.1', this
		
	() ->
		this.client.sadd 'day:' + this.dayNumber + ':clicks', this.clickId, this
		
	() ->
		sys.puts "added click " + this.clickId + " to day_number " + this.dayNumber
		this.callback.call()
)
		
generateDay: flow.define(
	(client, dayNumber, callback) ->
		this.dayNumber: dayNumber
		this.callback: callback
		for clickNumber in [0...100]
			recordClick(client, dayNumber, this.spool())
		
	() ->
		sys.puts("added dayNumber " + this.dayNumber)
		this.callback.call()
)

flow.exec(
	() ->
		this.client: new redis.Client()
		this.client.connect(this)
	() ->
		this.client.select(15, this)
	() ->
		for dayNumber in [0...2]
			generateDay(this.client, dayNumber, this.spool())
	() ->
		sys.puts("i guess i'm done!")
		this.client.quit()
)
