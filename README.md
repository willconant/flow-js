Flow-JS
===============

Flow-JS provides a continuation-esque construct that makes it much easier to express
multi-step asynchronous logic in non-blocking callback-heavy environments like
Node.js or javascript in the web browser.

The concept is best explained with an example. The following code uses a simple
asynchronous key-store to look-up a user's ID from his username and then sets his
email address, first name, and last name.

In this example, the dbGet and dbSet functions are assumed to rely on asynchronous
I/O and both take a callback that is called upon completion.

	dbGet('userIdOf:bobvance', function(userId) {
		dbSet('user:' + userId + ':email', 'bobvance@potato.egg', function() {
			dbSet('user:' + userId + ':firstName', 'Bob', function() {
				dbSet('user:' + userId + ':lastName', 'Vance', function() {
					okWeAreDone();
				});
			});
		});
	});

Notice how every single step requires another nested function definition. A
four-step process like the one shown here is fairly awkward. Imagine how painful a
10-step process would be!

One might point out that there is no reason to wait for one dbSet to complete before
calling the next, but, assuming we don't want okWeAreDone to be called until all
three calls to dbSet are finished, we'd need some logic to manage that:

	dbGet('userIdOf:bobvance', function(userId) {
		var completeCount = 0;
		var complete = function() {
			completeCount += 1;
			if (completeCount == 3) {
				okWeAreDone();
			}
		}
		
		dbSet('user:' + userId + ':email', 'bobvance@potato.egg', complete);
		dbSet('user:' + userId + ':firstName', 'Bob', complete);
		dbSet('user:' + userId + ':lastName', 'Vance', complete);
	});

Now look at the same example using Flow-JS:

	flow.exec(
		function() {
			dbGet('userIdOf:bobvance', this);
			
		},function(userId) {
			dbSet('user:' + userId + ':email', 'bobvance@potato.egg', this.spool());
			dbSet('user:' + userId + ':firstName', 'Bob', this.spool());
			dbSet('user:' + userId + ':lastName', 'Vance', this.spool());
		
		},function() {
			okWeAreDone()
		}
	);

A flow consists of a series of functions, each of which is applied with a special
"this" object which serves as a callback to the next function in the series. In
cases like our second step, this.spool() can be used to generate a callback that
won't call the next function until all such callbacks have been called.

