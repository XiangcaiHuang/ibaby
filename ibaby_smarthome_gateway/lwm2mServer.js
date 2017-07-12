/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-5-13
 * \author  Xiangcai Huang
 * \brief	the functions about the lwm2m server.
--------------------------------------------- */
var config = require('./config').lwm2mServer,
	lwm2mServer = require('lwm2m-node-lib').server,
	async = require('async'),
	deepCopy = require('./utils').deepCopy,
    lwm2mId = require('lwm2m-id');

/**
 * \brief   handler function for print out debug message.
 */
function handleResult(message) {
    return function(error) {
		if (error) {
			console.log('\nLwm2m : Error\t%s', JSON.stringify(error, null, 4));
		} else {
			console.log('\nLwm2m : Success\t%s', message);
		}
	};
}

/**
 * \brief	set the handle function when a client register or unregister.
 */
function setHandlers(registrationHandler, unregistrationHandler, serverInfo, callback)
{
	lwm2mServer.setHandler(serverInfo, 'registration', registrationHandler);
    lwm2mServer.setHandler(serverInfo, 'unregistration', unregistrationHandler);
	callback();
}

/**
 * \brief	start the lwm2m server.
 */
function start(registrationHandler, unregistrationHandler)
{
	async.waterfall([
		async.apply(lwm2mServer.start, config),
		async.apply(setHandlers, registrationHandler, unregistrationHandler),
	], handleResult('Lwm2m Server started'));
}

/**
 * \brief	parser the resource from payload and add them to iStateNew.
 			the format of payload is like this "<4/1>,<3303/0>,<3303/1>".
 */
function registerParser(endpoint, payload, iStateNew)
{
	var out = {},
		found = payload.split('>,<'),
		state = {}, 
		key;
	found[0] = found[0].slice(1);
	found[found.length - 1] = found[found.length - 1].slice(0, found[found.length - 1].length - 1);
	for (key in found) {
		found[key] = found[key].slice(1);
		found[key] = found[key].split('/');
	}
	for (key in found) {
		/*if (found[key][0] < 15){
			//if object type is less than 15, this object is used of device management rather than istate.
			continue;
		}*/
		if (!out[found[key][0]]){
			out[found[key][0]]={};
		}
		if (found[key][1]){
			out[found[key][0]][found[key][1]]={};
		}
	}

	state = deepCopy(out);

	console.log("Add %s's objects to iStateNew.", endpoint);
	iStateNew[endpoint] = deepCopy(state);
}

/**
 * \brief   show all resource of iStateNew.
 */
function resourceShow(endpoint, iStateNew)
{
    if (!iStateNew[endpoint]) {
        return;
    }

    var show = iStateNew[endpoint];
    for (var obj in show) {
        console.log("%s: ", lwm2mId.getOid(obj).key);
        for (var instance in show[obj]) {
            console.log("\t%d:", instance);
            for (var resource in show[obj][instance]) {
                console.log("\t\t%s:\t\t%s", lwm2mId.getRid(obj, resource).key, show[obj][instance][resource].toString());
            }
        }
    }
}

/**
 * Parses a string representing a Resource ID (representing a complete resource ID or a partial one: either the ID of
 * an Object Type or an Object Instance).
 *
 * @param {String}  uri       Id of the resource.
 * @param {Boolean} incomplete      If present and true, return incomplete resources (Object Type or Instance).
 * @returns {*}
 */
function parseResourceId(uri, incomplete) {
    var components = uri.split('/'),
        parsed;

    if (incomplete || components.length === 4) {
        parsed = {
            objectType: components[1],
            objectId: components[2],
            resourceId: components[3]
        };
    }

    return parsed;
}

/**
 * \brief	list all client registered.
 */
function listClients() {
	lwm2mServer.listDevices(function (error, deviceList) {
        if (error) {
            handleResult()(error);
        } else {
            console.log('\nDevice list:\n----------------------------');

            for (var i=0; i < deviceList.length; i++) {
                console.log('-> Device Id "%s"', deviceList[i].id);
                console.log('\n%s\n', JSON.stringify(deviceList[i], null, 4));
            }
        }
    });
}

/**
 * \brief	write the newValue to a specific resource.
 */
function write(endpoint, uri, newValue) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			console.error("\nLwm2m : Write failed:\tCan not find device-%s in devices list", endpoint);
			return;
		}

		var obj = parseResourceId(uri, false);
	    if (obj) {
	        lwm2mServer.write(device.id, obj.objectType, obj.objectId, obj.resourceId,
	            newValue,function(error){
	            	if (error) {
	            		handleResult()(error);
	            	}else{
	            		console.log('\nLwm2m : Write to %s successfully:\n----------------------------', endpoint);
		                console.log('uri: [%s]', uri);
		                console.log('newValue: %s', newValue);
	            	}
	            });
	            
	    } else {
	        console.error("\nLwm2m : Write failed:\tCouldn't parse resource URI: " + uri);
	    }
	});
}

/**
 * \brief	write the bin file to a specific resource(package).
 */
function writeToPackage(endpoint, uri, newValue, callback) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		var cb;
		if (device === undefined) {
			console.error("\nLwm2m : Write to package failed:\tCan not find device-%s in devices list", endpoint);
			return;
		}

		if (callback) {
			cb = callback;
		}

		var obj = parseResourceId(uri, false);
	    if (obj) {
            lwm2mServer.write(device.id, obj.objectType, obj.objectId, obj.resourceId,
            newValue, cb);
	    } else {
	        console.error("\nLwm2m : Write to package failed:\tCouldn't parse resource URI: " + uri);
	    }
	});
}

/**
 * \brief	read the value from a specific resource.
 */
function read(endpoint, uri) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			console.error("\nLwm2m : Read failed:\tCan not find device: %s", endpoint);
			return;
		}

		var obj = parseResourceId(uri, false);
	    if (obj) {
	        lwm2mServer.read(device.id, obj.objectType, obj.objectId, obj.resourceId, function (error, result) {
	            if (error) {
	                handleResult()(error);
	            } else {
	                console.log('\nLwm2m : Read from %s successfully:\n----------------------------', endpoint);
	                console.log('uri: [%s]', uri);
	                console.log('Value: %s', result);
	            }
        	});
	    } else {
	        console.error('\nLwm2m : Read failed:\tCouldn\'t parse resource URI: ' + uri);
	    }
	});
}

/**
 * \brief	observe a specific resource.
 */
function observe(endpoint, uri, handleValues) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			console.error("\nLwm2m : Observer failed:\tCan not find device: %s", endpoint);
			return;
		}

		var obj = parseResourceId(uri, false);
	    if (obj) {
	        lwm2mServer.observe(device.id, obj.objectType, obj.objectId, obj.resourceId,
	        	handleValues, 
	        	function handleObserve(error) {
			        if (error) {
			            handleResult()(error);
			        } else {
			            console.log('\nLwm2m : Observer successfully-[%s]', uri);
			        }
		    	});
	    } else {
	        console.error('\nLwm2m : Observer failed:\tCouldn\'t parse resource URI: ' + uri);
	    }
	});
}

/**
 * \brief	execute the command of a specific resource.
 */
function execute(endpoint, uri)
{
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			return;
		}

		var obj = parseResourceId(uri, false);
		if (obj) {
			lwm2mServer.execute(device.id, obj.objectType, obj.objectId, obj.resourceId, 
				null, 
				function(error){
	            	if (error) {
	            		handleResult()(error);
	            	}else{
	            		console.log('\nLwm2m : Execute to %s successfully:\n----------------------------', endpoint);
		                console.log('uri: [%s]', uri);
	            	}
	            });
		}else{
			console.error('\nLwm2m : Execute failed:\tCouldn\'t parse resource URI: ' + uri);
		}
	});
}

function parseAttributes(payload) {
    function split(pair) {
        return pair.split('=');
    }

    function group(previous, current) {
        if (current && current.length === 2) {
            previous[current[0]] = current[1];
        }

        return previous;
    }

    return payload.split(',').map(split).reduce(group, {});
}

/**
 * \brief	write attributes to a specific resource who has been observed.
 */
function writeAttributes(endpoint, uri, attributes) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			console.error("\nLwm2m : writeAttributes failed:\tCan not find device: %s", endpoint);
			return;
		}

		var obj = parseResourceId(uri, false);
		var attr = parseAttributes(attributes);
	    if (obj) {
	    	if (attr) {
	    		lwm2mServer.writeAttributes(device.id, obj.objectType, obj.objectId, obj.resourceId,
	    		 	attr, 
	    			function handleObserve(error) {
			            if (error) {
			                handleResult()(error);
			            } else {
			                console.log('\nLwm2m : writeAttributes successfully-[%s]\n', uri);
			            }
			        });
	    	}else{
	    		console.log('\nLwm2m : Attributes [%s] written for resource [%s]\n', attributes, uri);
	    	}
	    } else {
	        console.error('\nLwm2m : writeAttributes failed:\tCouldn\'t parse resource URI: ' + uri);
	    }
	});
}

/**
 * \brief	cancel observe a specific resource.
 */
function cancelObservation(endpoint, uri) {
	lwm2mServer.getDevice(endpoint, function (num, device) {
		if (device === undefined) {
			console.error("\nLwm2m : cancelObservation failed:\tCan not find device: %s", endpoint);
			return;
		}

		var obj = parseResourceId(uri, false);
	    if (obj) {
	        lwm2mServer.cancelObserver(device.id, obj.objectType, obj.objectId, obj.resourceId, 
	        	function handleCancel(error) {
			        if (error) {
			            handleResult()(error);
			        } else {
			            console.log('\nLwm2m : cancelObservation successfully-[%s]\n', uri);
			        }
			    });
	    } else {
	        console.error('\nLwm2m : cancelObservation failed:\tCouldn\'t parse resource URI: ' + uri);
	    }
	});
}

module.exports.start = start;
module.exports.listClients = listClients;
module.exports.write = write;
module.exports.writeToPackage = writeToPackage;
module.exports.read = read;
module.exports.observe = observe;
module.exports.execute = execute;
module.exports.writeAttributes = writeAttributes;
module.exports.cancelObservation = cancelObservation;
module.exports.registerParser = registerParser;
module.exports.resourceShow = resourceShow;
module.exports.parseResourceId = parseResourceId;






