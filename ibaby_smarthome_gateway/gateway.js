/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-6-2
 * \author  Xiangcai Huang
 * \brief	The main funcion of the iBaby Gateway.
--------------------------------------------- */

var config = require('./config'),
    fs = require('fs'),
    lwm2mServer = require('./lwm2mServer'),
    httpServer = require('./httpServer'),
    wsServer = require('./webSocketServer'),
    awsClient = require('./awsClient'),
    async = require('async'),
    clUtils = require('command-node'),
    iStateNew = require('./iState').iStateNew,
    iState = require('./iState').iState,
    utils = require('./utils'),
    lwm2mId = require('lwm2m-id');

/**************************************************************************************************/
/**
 * \brief   handler function when a new client registering.
 * \param   endpoint    the name of clientget.
 * \param   payload     the resources information of this client.
 */
function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    console.log("\n*************** Receive message from Node ***************\n");
    console.log('Gateway : Device registration:\n----------------------------');
    console.log('Client name: %s\nLifetime: %s\n', endpoint, lifetime);

    //add a new client to iBaby Gateway
    addNewClient(endpoint, payload);
    callback();
}

/**
 * \brief   add a new client to iBaby Gateway.
 */
 function addNewClient(endpoint, payload)
{
    //parser the payload of new client and add them to iStateNew
    lwm2mServer.registerParser(endpoint, payload, iStateNew);

    //show the resources of new client
    //lwm2mServer.resourceShow(endpoint, iStateNew);

    //observe some resources for Wearable Node
    switch(endpoint){
        case "wn": 
            var uri = '/3303/0/5700';//btemp
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            var uri = '/3346/0/5700';//hrate
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));

            var uri = '/3300/0/5700';//state
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            var uri = '/3323/0/5700';//motion intensity
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));

            var uri = '/3338/0/5800';//warn_hrate_abnor
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            var uri = '/3339/0/5800';//warn_btemp
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            var uri = '/3341/0/5800';//warn_downward
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            var uri = '/3342/0/5800';//event_aw
            lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
        break;

        case "ln":
            // var uri = '/3311/0/5850';//flag_lamp_work
            // lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
            // var uri = '/3340/0/5800';//warn_cry
            // lwm2mServer.observe(endpoint, uri , observeHandle(endpoint, uri));
        break;

        default:
        break;
    }
    
    //send iState change to AWS and App
    sendToAWSApp();
}

/**
 * \brief   send iState changed to AWS and App.
 */
 function sendToAWSApp()
 {
    var stateChange = utils.getDifferent(iStateNew, iState);
    if (stateChange !== undefined) {  
        console.log("Gateway : Send iState changed to AWS and App");

        console.log("\tiState changed : " + JSON.stringify(stateChange));     
        awsClient.send(stateChange);//send to AWS
        wsServer.send(stateChange); //send to App
        iState = utils.deepCopy(iStateNew);//update iState
    } 
 }

/**
 * \brief   handler function when notify come from iBaby Nodes.
 */
 function observeHandle(endpoint, uri)
{
    function obs(value) {
        if (iStateNew[endpoint] !== undefined){
            // console.log("\n*************** Receive message from Node ***************\n");

            var obj = lwm2mServer.parseResourceId(uri, false);
            // console.log('Gateway : Got new Value from Node - %s:\n----------------------------', endpoint);
            // console.log('uri:     [%s]', uri);
            // console.log('newValue: %s\n', value);
            console.log("Gateway : Got value-%s of [%s] from %s\n", value, uri, endpoint);

            //update iStateNew when iState change from iBaby Nodes
            iStateChangeFromNodes(endpoint, obj.objectType, obj.objectId, obj.resourceId, value);
        }
    }
    return obs; 
}

/**
 * \brief  update iStateNew when iState change from iBaby Nodes.
 * \param  value  new value of this resource.
 */
 function iStateChangeFromNodes(endpoint, oId, iId ,rId, value)
 {   
    if (oId == "3338" || oId == "3339" ||
        oId == "3341" || oId == "3342") {
        if (value == "1") 
            value = "true";
        else
            value = "false";
    }

    //update iStateNew
    iStateNew[endpoint][oId][iId][rId] = value;

    //send iState change to AWS and App
    sendToAWSApp();

    //if warn_downward == true
    //control lamp node to light on
    if(endpoint == "wn" && oId == "3341" && rId == "5800" && value == "true")
    {
        console.log('Gateway : Control lamp to light on\n');
        lwm2mServer.write("ln", "/3311/0/5850", "1");
    }
 }

/**
 * \brief   handler function when a client unregister.
 */
function unregistrationHandler(device, callback) {
    console.log("\n*************** Receive message from Node ***************\n");
    console.log('Gateway : Device unregistration:\n----------------------------\n');
    console.log("Node's name: %s", device.name);//device.name means endpoint(client' name)

    //delete data about this client from iStateNew
    deleteClient(device.name);
    clUtils.prompt();
    callback();
}

/**
 * \brief   delete a client from iStateNew, AWS and App.
 */
 function deleteClient(endpoint)
{
    if (iStateNew[endpoint] !== undefined) {
        console.log("Gateway : Delete this Node - %s from iStateNew, AWS and App.", endpoint);

        var stateChange={};
        iStateNew[endpoint] = undefined;//delete from iStateNew
        stateChange[endpoint] = null;
        awsClient.send(stateChange);    //delete from AWS
        wsServer.send(stateChange);     //delete from App
        iState = utils.deepCopy(iStateNew); //update iState
    }
}
/**************************************************************************************************/



/**************************************************************************************************/
/**
 * \brief   handle function when get the message from web socket(App UI).
 */
function WSMessageHandle(message)
{
    if (message.type === 'utf8') {
        var msg = message.utf8Data;
        console.log("\n*************** Receive message from App ****************\n");
        console.log("Gateway : Received package: " + msg);

        //get package "{}" means the App is start running, need to get all state - iStateNew.
        if (msg == "{}") {
            wsServer.send(iStateNew);//send iStateNew to App
            console.log("Gateway : Freeboard is start running");
        }else{
            var stateNew = JSON.parse(msg);

            for (var key in stateNew) {
                //get package "desired" means the App UI has changed
                if (key == "desired") {
                    console.log("Gateway : Freeboard UI changed");

                    //deal with the delta message from App
                    deltaFromApp(null, {state: stateNew[key]});
                } else {
                    console.error("Gateway : Can't recieved reported");
                }
            }
        }
    }else{
        console.error("Gateway : Unknow message type");
    }
}

/**
 * \brief   deal with the delta message from App.
 */
function deltaFromApp(thingName, stateObject)
{
    var iStateDelta = stateObject.state, newValue, endpoint, oId, iId, rId;

    for (endpoint in iStateDelta) {
        for (oId in iStateDelta[endpoint]) {
            for (iId in iStateDelta[endpoint][oId]) {
                for (rId in iStateDelta[endpoint][oId][iId]) {

                    //get new value from delta message
                    newValue = iStateDelta[endpoint][oId][iId][rId];

                    if (!iStateNew[endpoint]) {
                    console.error('Gateway : Can not find this client-%s in iStateNew', endpoint);
                    return;
                    }

                    //update iStateNew
                    iStateNew[endpoint][oId][iId][rId] = newValue;

                    //send "1"/"0" to node ,not "true" or "false"
                    if (newValue.toString() == "true") {//can't be deleted
                        newValue = "1";
                    }else{
                        newValue = "0";
                    }

                    //send iState changed to Node
                    console.log("Gateway : Send iState changed to Node");
                    var uri = '/'+oId.toString()+'/'+iId.toString()+'/'+rId.toString();
                    //must transfer all parameters into string ,or it will happen error
                    lwm2mServer.write(endpoint.toString(), uri, newValue);

                    //send iState changed to AWS
                    var stateChange = utils.getDifferent(iStateNew, iState);
                    if (stateChange !== undefined) { 
                        console.log("Gateway : Send iState changed to AWS");
                        console.log("\tiState changed : " + JSON.stringify(stateChange)); 

                        awsClient.send(stateChange);//send to AWS
                        //update all app UI
                        wsServer.send(stateChange);//send to App
                        iState = utils.deepCopy(iStateNew);//update iState
                    } 
                }
            }
        }
    }
    // console.log("\nGateway : Get a delta from App:%s\n", JSON.stringify(stateObject, null, 4));
}

/**
 * \brief   deal with the delta message from AWS.
 */
function deltaFromAWS(thingName, stateObject)
{
    var iStateDelta = stateObject.state, newValue, endpoint, oId, iId, rId;

    for (endpoint in iStateDelta) {
        for (oId in iStateDelta[endpoint]) {
            for (iId in iStateDelta[endpoint][oId]) {
                for (rId in iStateDelta[endpoint][oId][iId]) {

                    //get new value from delta message
                    newValue = iStateDelta[endpoint][oId][iId][rId];

                    console.log("\n*************** Receive message from AWS ****************\n");
                    if (!iStateNew[endpoint]) {
                    console.error('Gateway : Can not find this client-%s in iStateNew', endpoint);
                    return;
                    }

                    //update iStateNew
                    iStateNew[endpoint][oId][iId][rId] = newValue;
                    
                    //send "1"/"0" to node ,not "true" or "false"
                    // if (newValue.toString() == "true") {
                    //     newValue = "1";
                    // }else{
                    //     newValue = "0";
                    // }

                    //send iState changed to Node
                    console.log("Gateway : Send iState changed to Node");
                    var uri = '/'+oId.toString()+'/'+iId.toString()+'/'+rId.toString();
                    //must transfer all parameters into string ,or it will happen error
                    lwm2mServer.write(endpoint.toString(), uri, newValue.toString());

                    //send iState changed to App
                    var stateChange = utils.getDifferent(iStateNew, iState);
                    if (stateChange !== undefined) { 
                        console.log("Gateway : Send iState changed to App");
                        console.log("\tiState changed : " + JSON.stringify(stateChange)); 

                        wsServer.send(stateChange);//send to App
                        iState = utils.deepCopy(iStateNew);//update iState
                    } 
                }
            }
        }
    }
    // console.log("\nGateway : Get a delta from AWS:%s\n", JSON.stringify(stateObject, null, 4));
}
/**************************************************************************************************/





/**************************************************************************************************/
/*
 * here's some commands to debug lwm2mServer
 */
 function showiState()
{
    console.log("iStateNew:");
    console.log(JSON.stringify(iStateNew));
    console.log("\n");
    console.log("iState:");
    console.log(JSON.stringify(iState));
    clUtils.prompt();
}

function listClients()
{
    lwm2mServer.listClients();
    clUtils.prompt();
}

function write(commands)
{
    lwm2mServer.write(commands[0], commands[1], commands[2]);
}

function read(commands)
{
    lwm2mServer.read(commands[0], commands[1]);
}

 function handleTestObserve(value)
{
    console.log('\nGot new value: %s\n',value);
}

function observe(commands)
{
    lwm2mServer.observe(commands[0], commands[1], handleTestObserve);
    clUtils.prompt();
}

function writeAttributes(commands)
{
    lwm2mServer.writeAttributes(commands[0], commands[1], commands[2]);
    clUtils.prompt();
}

function cancelObservation(commands)
{
    lwm2mServer.cancelObservation(commands[0], commands[1]);
    clUtils.prompt();
}

function upload(commands)
{
    fs.readFile(commands[1], "utf8", function(err, data) {
        if (err){
            console.log("\nGateway : Read firmware failed\n%s", JSON.stringify(err, null, 4));
        }
        else {
            lwm2mServer.writeToPackage(commands[0], "/5/0/0", data, function callback(err) {
                if (err) {
                    console.log("\nGateway : Firmware upload failed  \t%s", JSON.stringify(err, null, 4));
                }
                else {
                    console.log("\nGateway : Firmware upload successfully");
                    lwm2mServer.execute(commands[0], "/5/0/2");
                }
            });
        }
    });
}

function divideBigFile(commands){
	utils.fileDivide(function(num){
	});
}

function uploadBigFile(commands){
	utils.fileDivide(function(num){
		for (var i = 0; i < num; i++) {
			var filePath = './img/boot' + i.toString() + '.bin';

			fs.readFile(filePath, "utf8", function(err, data){
				if (err){
		            console.log("\nGateway : Read file %s failed\n%s", filePath, JSON.stringify(err, null, 4));
		        }
		        else {
		        	lwm2mServer.writeToPackage(commands[0], "/5/0/0", data, function callback(err) {
		                if (err) {
		                    console.log("\nGateway : Send file %s failed  \t%s", filePath, JSON.stringify(err, null, 4));
		                }
		                else {
                            console.log("\nGateway : Send file successfully\tLength %d", data.length);
		                }
		            });
		        }
			});
		}
	});
}

function test(commands)
{
    switch(commands[0]){
        case 's':
            iStateNew = {
                "WearableNode":{
                            "3303":{"0":{"5700":"37"   }},//体温
                            "3346":{"0":{"5700":"70"   }},//心率

                            "3300":{"0":{"5700":"0"    }},//睡眠-觉醒状态
                            "3323":{"0":{"5700":"2000" }},//活动强度

                            "3338":{"0":{"5800":"false"}},//心率 正常/警报
                            "3339":{"0":{"5800":"false"}},//体温 正常/警报
                            "3340":{"0":{"5800":"false"}},//声音 正常/警报
                            "3341":{"0":{"5800":"false"}},//卧睡 正常/警报
                            "3342":{"0":{"5800":"false"}} //睡醒 否/是
                }
            };
            sendToAWSApp();
        break;

        case 'a':
            newClientState = {
                            "3311":{"0":{"5850":"false"}}//flag_lamp_work  RW 
            };
            iStateNew["CommonNode1"] = newClientState;
            sendToAWSApp();
        break;

        case 'd':
            deleteClient("WearableNode");
            deleteClient("CommonNode1");
        break;

        default:
            console.error("Wrong parameters for test command.");
        break;
    }
}

var commands = {
    's': {
        parameters: [],
        description: '\tList all the resource in iState and iStateNew.',
        handler: showiState
    },
    'l': {
        parameters: [],
        description: '\tList all the Nodes connected to iBaby Gateway.',
        handler: listClients
    },
    'w': {
        parameters: ['endpoint', 'uri', 'resourceValue'],
        description: '\tWrites the given value to the resource indicated by the URI (in LWTM2M format) in the given' +
            'device.' + 'The uri should be in the following format: /objectType/objectId/resourceId. E.g.: /3/0/1.',
        handler: write
    },
    'r': {
        parameters: ['endpoint', 'uri'],
        description: '\tReads the value of the resource indicated by the URI (in LWTM2M format) in the given device.',
        handler: read
    },
    'o': {
        parameters: ['endpoint', 'uri'],
        description: '\tStablish an observation over the selected resource.',
        handler: observe
    },
    'w-a': {
        parameters: ['endpoint', 'uri', 'attributes'],
        description: '\tWrite a new set of observation attributes to the selected resource. The attributes should be\n\t ' +
            'in the following format: name=value(,name=value)*. E.g.: pmin=1,pmax=2.',
        handler: writeAttributes
    },
    'c': {
        parameters: ['endpoint', 'uri'],
        description: '\tCancel the observation order for the given resource (defined with a LWTM2M URI) ' +
            'to the given device.',
        handler: cancelObservation
    },
    'ul': {
        parameters: ['endpoint', 'filePath'],
        description: 'Uploads the file from given filePath to' +
            'device.',
        handler: upload     
    },
    'dibf': {
        parameters: [],
        description: 'Divide the big file - boot.bin into various files from current path.',
        handler: divideBigFile     
    },
    'ulbf': {
        parameters: ['endpoint'],
        description: 'Uploads the big file - boot.bin from current path to' +
            'device.',
        handler: uploadBigFile     
    },
    'test': {
        parameters: ['operation'],
        description: '\tTry to operate clients from iStateNew.',
        handler: test
    },
    'cfg-l': {
        parameters: [],
        description: '\tPrint the current config of lwm2mServer.',
        handler: clUtils.showConfig(config, 'lwm2mServer')
    },
    'cfg-a': {
        parameters: [],
        description: '\tPrint the current config of awsClient.',
        handler: clUtils.showConfig(config, 'awsClient')
    },
    'cfg-h': {
        parameters: [],
        description: '\tPrint the current config of httpServer.',
        handler: clUtils.showConfig(config, 'httpServer')
    }
};
/**************************************************************************************************/




/**************************************************************************************************/
/*
 *start the lwm2m server, web socket server, http server, command line and connect to AWS IoT.
 */
console.log("\n\n*************** iBaby Gateway is starting ***************");
clUtils.initialize(commands, 'iBaby-Gateway> ');
lwm2mServer.start(registrationHandler, unregistrationHandler);
httpServer.start();
wsServer.start(WSMessageHandle);
// awsClient.start(deltaFromAWS);