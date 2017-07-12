# iBaby-gateway-v1.3.1

## Index ##
* [Overview](#overview)
* [Fuction](#function)
* [Usage](#usage)
* [Command](#command)
* [Notice](#notice)
 
## <a name="overview"/> Overview

## <a name="function"/> Function
- LwM2M Server (Communicate with EMSK Nodes)
- Http Server (Response to url request locally or remote)
- Web Socket Server (Communicate with Freeboard locally)
- AWS Client (Communicate with AWS IOT)
- Web App (Freeboard)

## <a name="usage"/> Usage
- Requirements

		linux(Ubuntu17.0.4)
		nodejs
- How to start

		npm install
		node gateway.js/npm start

- Modules

	    console.log("\n\n*************** iBaby Gateway is starting ***************");
		clUtils.initialize(commands, 'iBaby-Gateway> ');
		lwm2mServer.start(registrationHandler, unregistrationHandler);
		httpServer.start();
		wsServer.start(WSMessageHandle);
		awsClient.start(deltaFromAWS);


## <a name="command"/> Command
- LwM2M Server:

	's': 

        parameters: [],
        description: '\tList all the resource in iState and iStateNew.',
        handler: showiState
    
	'l': 

        parameters: [],
        description: '\tList all the devices connected to the server.',
        handler: listClients

    'w': 

        parameters: ['endpoint', 'uri', 'resourceValue'],
        description: '\tWrites the given value to the resource indicated by the URI (in LWTM2M format) in the given' +
            'device.' + 'The uri should be in the following format: /objectType/objectId/resourceId. E.g.: /3/0/1.',
        handler: write

    'r': 

        parameters: ['endpoint', 'uri'],
        description: '\tReads the value of the resource indicated by the URI (in LWTM2M format) in the given device.',
        handler: read

    'o':

        parameters: ['endpoint', 'uri'],
        description: '\tStablish an observation over the selected resource.',
        handler: observe

    'w-a': 

        parameters: ['endpoint', 'uri', 'attributes'],
        description: '\tWrite a new set of observation attributes to the selected resource. The attributes should be\n\t ' +
            'in the following format: name=value(,name=value)*. E.g.: pmin=1,pmax=2.',
        handler: writeAttributes

	'ul': 

        parameters: ['endpoint', 'filePath'],
        description: 'Uploads the file from given filePath to' +
            'device.',
        handler: upload  

    'dibf': 

        parameters: [],
        description: 'Divide the big file - boot.bin into various files from current path.',
        handler: divideBigFile

    'ulbf': 

        parameters: ['endpoint'],
        description: 'Uploads the big file - boot.bin from current path to' +
            'device.',
        handler: uploadBigFile  

    'c': 

        parameters: ['endpoint', 'uri'],
        description: '\tCancel the observation order for the given resource (defined with a LWTM2M URI) ' +
            'to the given device.',
        handler: cancelObservation

	'test': 

        parameters: ['operation'],
        description: '\tTry to operate clients for iStateNew.',
        handler: test

- Config:

    'cfg-l': 

        parameters: [],
        description: '\tPrint the current config of lwm2mServer.',
        handler: clUtils.showConfig(config, 'lwm2mServer')

    'cfg-a': 

        parameters: [],
        description: '\tPrint the current config of awsClient.',
        handler: clUtils.showConfig(config, 'awsClient')

    'cfg-h': 

        parameters: [],
        description: '\tPrint the current config of httpServer.',
        handler: clUtils.showConfig(config, 'httpServer')

## <a name="notice"/> Notice
- You should modify some code in node_modules about lwm2m when you want to use **iBaby-gateway**

		path: iBaby-gateway\node_modules\lwm2m-node-lib\lib\services\server\informationReporting.js

in function observe():

	host: obj.address,
    port: obj.port,
	...

modify it to :

    host: (config.ipProtocol === 'udp6')?'::1':'127.0.0.1',
    port: config.port,
	...

***
Date: 2017.6.21     
Author: Xiangcai Huang