function toArray(args) {
	return Array.prototype.slice.call(args);
}

function applyArgs(func, thisObj, args) {
	return func.apply(thisObj, toArray(args));
}

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

exports.exec = function() {
	applyArgs(exports.define, exports, arguments)();
}
