// Javascript Library for Multi-step Asynchronous Jobs
// Version 0.1
// Copyright (c) 2010 William R. Conant, WillConant.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function(){
	// converts native arguments object to an array and applies function
	function applyArgs(func, thisObj, args) {
		return func.apply(thisObj, Array.prototype.slice.call(args));
	}
	
	// defines a flow given any number of functions as arguments
	exports.define = function() {	
		var thisFlow = function() {
			applyArgs(thisFlow.exec, thisFlow, arguments);
		}
		
		thisFlow.blocks = arguments;
		
		thisFlow.exec = function() {
			var flowState = function() {
				var blockIdx = flowState.nextBlockIdx ++;
				var block = thisFlow.blocks[blockIdx];
				
				if (block === undefined) {
					return;
				}
				else {
					applyArgs(block, flowState, arguments);
				}
			}
			
			flowState.nextBlockIdx = 0;
			flowState.spoolCount = 0;
			flowState.spoolOutputs = [];
			
			flowState.spool = function() {
				flowState.spoolCount += 1;
				return function() {
					flowState.spoolCount -= 1;
					flowState.spoolOutputs.push(arguments);
					
					if (flowState.spoolCount == 0) {
						var spoolOutputs = flowState.spoolOutputs;
						flowState.spoolOutputs = [];
						flowState(spoolOutputs);
					}
				}
			}
			
			applyArgs(flowState, this, arguments);
		}
		
		return thisFlow;
	}
	
	// defines a flow and evaluates it immediately. The first flow function won't receive any arguments.
	exports.exec = function() {
		applyArgs(exports.define, exports, arguments)();
	}
})();
