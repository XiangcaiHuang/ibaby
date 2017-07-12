/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-5-13
 * \author  Xiangcai Huang
 * \brief   configuration of lwm2m aws and http.
--------------------------------------------- */
var config = {};

// Configuration of the LWTM2M Server
//--------------------------------------------------
config.lwm2mServer = {
    port: 5683,                         // Port where the server will be listening
    lifetimeCheckInterval: 1000,        // Minimum interval between lifetime checks in ms
    udpWindow: 100,
    defaultType: 'Device',
    logLevel: 'FATAL',
    ipProtocol: 'udp4',
    serverProtocol: 'udp4',
    formats: [
        {
            name: 'application-vnd-oma-lwm2m/text',
            value: 1541
        },
        {
            name: 'application-vnd-oma-lwm2m/tlv',
            value: 1542
        },
        {
            name: 'application-vnd-oma-lwm2m/json',
            value: 1543
        },
        {
            name: 'application-vnd-oma-lwm2m/opaque',
            value: 1544
        }
    ],
    writeFormat: 'application-vnd-oma-lwm2m/text'
};

// Configuration of the AWS Iot
//--------------------------------------------------
config.awsClient = {
	keyPath: './cert/privateKey.pem' ,
	certPath: './cert/cert.crt' ,
	caPath: './cert/rootCA.crt' ,
	clientId: 'freeboard',
	region: 'ap-southeast-1',
	// debug: true
};

// Configuration of the http server
//--------------------------------------------------
config.httpServer = {
    port: 80,
};

module.exports = config;

