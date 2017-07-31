# iBaby Smarthome Gateway

## Index ##
* [Overview](#overview)
* [Fuctions](#functions)
* [Usage](#usage)
* [Commands](#commands)
 
## Overview

## Functions
- LwM2M Server (Communicate with EMSK Nodes)
    - **OTA** based on LwM2M protocol (Supports file transfer over 2k size)
    - **Multi-node** access, connecting and communicating with each other.
      Control **Lamp Node** to turn on automatically when the **Wearable Node** detecting baby sleep on his stomach.
      ( Indirectly control ! Wearable node sends the warnning information to gateway when it detecting exceptional situations,then the gateway transmits the information to lamp node and turns the lamp on.)
- Http Server (Response to url request locally or remote)
- Web Socket Server (Communicate with Freeboard locally)
- AWS Client (Communicate with AWS IOT)
- Web App (Freeboard)

## Usage
- Requirements

        PC or Raspberry Pi with Windows or Linux OS
		![nodejs][30] installed

    You need an ![AWS][31] account, and create things for ibaby nodes, generate and save the certs for different nodes, and modify specific `config.js`(path: `./ibaby_smarthome_gateway/config.js`) for your project:

        // Configuration of the AWS Iot
        //--------------------------------------------------
            config.awsClient = {
            keyPath: './cert/privateKey.pem' ,
            certPath: './cert/cert.crt' ,
            caPath: './cert/rootCA.crt' ,
            clientId: 'freeboard',
            region: 'ap-southeast-1',
        };

- How to Start
        
		npm install
		node gateway.js / npm start

- Modules Enable

Comments the functional modules that you don't need:
(path: `./ibaby_smarthome_gateway/gateway.js`):

	    console.log("\n\n*************** iBaby Gateway is starting ***************");
		clUtils.initialize(commands, 'iBaby-Gateway> ');
		lwm2mServer.start(registrationHandler, unregistrationHandler);
		httpServer.start();
		wsServer.start(WSMessageHandle);
		awsClient.start(deltaFromAWS);


## Commands
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


[30]: https://nodejs.org/en/    "nodejs"
[31]: https://aws.amazon.com/free/?nc1=h_ls    "AWS"
