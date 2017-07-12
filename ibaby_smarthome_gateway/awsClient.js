/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-5-13
 * \author  Xiangcai Huang
 * \brief	the function about the AWS IoT cloud.
--------------------------------------------- */
var thingShadow = require('aws-iot-device-sdk').thingShadow,
	config = require('./config').awsClient,
	thingShadows,
	operationTimeout = 10000,
	thingName = 'iBaby',
	globalAWSFlag = false,
	handleResult = function (){},
	stack = [];
/**
 * \brief	connect to the AWS IoT
 */
function start(handleDelta, callback)
{
	thingShadows = thingShadow(config);

	//iBaby gateway connecting to AWS IoT
	thingShadows.on('connect', function() {
		registerThing(thingName);//register iBabyThing
		setTimeout(function () {
			globalAWSFlag = true;
			//clear shadow of iBabyThing in AWS IoT
			genericOperation('update', {state:{reported:null,desired:null}});
		}, 5000);

		handleResult = function (message, error) {
			if (error === 0) {
				console.log('\nAWS : Success\t%s', message);
			} else if(error == 1) {
				console.log('\nAWS : Error  \t%s', message);
			} else if(error === undefined){
				console.log('\nAWS :        \t%s', message);
			}
		};

		if (callback) {
			callback();
		} else {
			handleResult('connected', 0);
		}
	});

	thingShadows.on('close', function() {
		globalAWSFlag = false;
		thingShadows.unregister(thingName);
		handleResult('close');
		handleResult = function(){};
	});

	thingShadows.on('reconnect', function() {
		handleResult('reconnecting');
	});

	thingShadows.on('offline', function() {
		while (stack.length) {
			stack.pop();
		}
		handleResult('offline');
	});

	//get new state from device
	thingShadows.on('status', function(thingName, stat, clientToken, stateObject) {
		var expectedClientToken = stack.pop();
		handleResult('Update shadow', 0);
	});

	thingShadows.on('timeout', function(thingName, clientToken) {
		var expectedClientToken = stack.pop();
		if (expectedClientToken === clientToken) {
			handleResult('timeout', 1);
		} else {
			handleResult('client token mismtach', 1);
		}
	});

	thingShadows.on('error', function(error) {
		if (error.code != 'ETIMEDOUT')
			handleResult(error, 1);
	});

	thingShadows.on('delta', handleDelta);
}

function registerThing(thingName)
{
	thingShadows.register(thingName, {
		ignoreDeltas: false,
		operationTimeout: operationTimeout,
		enableVersioning: false,

	});

}

function genericOperation(operation, state)
{
	var clientToken = thingShadows[operation](thingName, state);
	if (clientToken === null) {
		console.log('AWS : Operation in progress, scheduling retry in 5s...');
		setTimeout(function() {
				genericOperation(operation, state);
			}, 5000);
	} else {
		stack.push(clientToken);
	}
}

function shadowSend(state)
{
	if (globalAWSFlag) {
		console.log("\nAWS : Send iState change to AWS server");
		// console.log("AWS : Send the iState changed to AWS server:\n%s", JSON.stringify(state, null, 4));
		genericOperation("update", {state: {reported: state, desired: state}});
	} else {
		handleResult("AWS offline", 1);
	}
}

module.exports.start = start;
module.exports.send = shadowSend;