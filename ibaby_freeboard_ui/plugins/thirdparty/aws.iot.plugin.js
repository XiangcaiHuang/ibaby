// # A Freeboard Plugin that uses the Eclipse Paho javascript client to read MQTT messages

(function() {
	// ### Datasource Definition
	//
	// -------------------
	freeboard.loadDatasourcePlugin({
		"type_name": "aws_iot",
		"display_name": "AWS IoT",
		"description": "Receive data from an MQTT server.",
		"external_scripts": [
			// For development uncomment below
			// "bower_components/cryptojslib/rollups/sha256.js",
			// "bower_components/cryptojslib/rollups/hmac-sha256.js",
			// "bower_components/random/lib/random.min.js",
			// "bower_components/moment/min/moment.min.js",
			// "bower_components/paho-mqtt-js/mqttws31.js"
			// For publish uncomment below
			"js/bower_components.min.js"
		],
		"settings": [{
			"name": "endpoint",
			"display_name": "AWS IoT Endpoint",
			"type": "text",
			"default_value": "",
			"description": "Your AWS account-specific AWS IoT endpoint. You can use the AWS IoT CLI describe-endpoint command to find this endpoint",
			"required": true
		}, {
			"name": "region",
			"display_name": "Region",
			"type": "text",
			"default_value": "",
			"description": "The AWS region of your AWS account",
			"required": true
		}, {
			"name": "clientId",
			"display_name": "Client Id",
			"type": "text",
			"default_value": "",
			"description": "MQTT client ID should be unique for every device",
			"required": false
		}, {
			"name": "accessKey",
			"display_name": "Access Key",
			"type": "text",
			"default_value": "",
			"description": "Access Key of AWS IAM",
			"required": true
		}, {
			"name": "secretKey",
			"display_name": "Secret Key",
			"type": "text",
			"default_value": "",
			"description": "Secret Key of AWS IAM",
			"required": true
		}, {
			"name": "things",
			"display_name": "Things",
			"type": "array",
			"settings": [{
				"name": "thing",
				"display_name": "Thing",
				"type": "text"
			}],
			"description": "AWS IoT Thing Name of the Shadow this device is associated with",
			"required": true
		}],
		// **newInstance(settings, newInstanceCallback, updateCallback)** (required) : A function that will be called when a new instance of this plugin is requested.
		// * **settings** : A javascript object with the initial settings set by the user. The names of the properties in the object will correspond to the setting names defined above.
		// * **newInstanceCallback** : A callback function that you'll call when the new instance of the plugin is ready. This function expects a single argument, which is the new instance of your plugin object.
		// * **updateCallback** : A callback function that you'll call if and when your datasource has an update for freeboard to recalculate. This function expects a single parameter which is a javascript object with the new, updated data. You should hold on to this reference and call it when needed.
		newInstance: function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new mqttDatasourcePlugin(settings, updateCallback));
		}
	});

	var mqttDatasourcePlugin = function(settings, updateCallback) {
		var self = this;
		var data = {};

		var currentSettings = settings;
		var oldSettings = settings;
		var aws_delta_topic_template = "$aws/things/&/shadow/update/delta";
		var aws_topic_update_accepted_template = "$aws/things/&/shadow/update/accepted";
		var aws_get_thing_template = "$aws/things/&/shadow/get";
		var aws_topic_pub_template = "$aws/things/&/shadow/update";

		var delta_topics = {};
		var accepted_topics = {};
		var aws_data = {};

		var client = null;

		var panesLoaded = {};
		var col = [1, 1],
			row = [
				[9, 5],
				[9, 5, 5]
			];

		function cmp_things(x, y) {
			if (x === y) {
				return true;
			}
			if (!(x instanceof Object) || !(y instanceof Object)) {
				return false;
			}
			if (x.constructor !== y.constructor) {
				return false;
			}
			if (x.length != y.length) {
				return false;
			}
			var match = 0;
			for (var i = x.length - 1; i >= 0; i--) {
				for (var j = y.length - 1; j >= 0; j--) {
					if (x[i].thing === y[j].thing) {
						match++;
						break;
					}
				}
			}
			if (match == x.length) {
				return true;
			} else {
				return false;
			}
		}

		function client_disconnect() {
			console.log("Try to disconnect current client.");
			if (client && client.connected) {
				client.on('connectionLost', function() {});
				client.disconnect();
			}
		}

		function client_connect(newSettings) {
			client_disconnect();
			console.log("Try to connect a new client.");
			currentSettings = newSettings;
			oldSettings = newSettings;
			client = create_AWSClient(currentSettings);
			delta_topics = {};
			aws_data = {};
			client.connect();
		}

		function connection_changed(newSettings) {
			client_connect(newSettings);
		}

		function things_changed(newSettings) {
			if (client) {
				if (client.connected) {
					unsubsribe_topics(currentSettings);
					oldSettings = newSettings;
					currentSettings = newSettings;
					subscribe_topics(currentSettings);
				} else {
					connection_changed(newSettings);
				}
			}
		}

		function unsubsribe_topics(Settings) {
			var thing;
			for (var i = Settings.things.length - 1; i >= 0; i--) {
				thing = Settings.things[i].thing;
				delta_topics[thing] = aws_delta_topic_template.replace("&", thing);
				accepted_topics[thing] = aws_topic_update_accepted_template.replace("&", thing);
				console.log("Start unsubscribe topic:" + delta_topics[thing]);
				console.log("Start unsubscribe topic:" + accepted_topics[thing]);
				client.unsubscribe(delta_topics[thing]);
				client.unsubscribe(accepted_topics[thing]);
			}
		}

		function subscribe_topics(Settings) {
			var thing;
			for (var i = Settings.things.length - 1; i >= 0; i--) {
				thing = Settings.things[i].thing;
				delta_topics[thing] = aws_delta_topic_template.replace("&", thing);
				accepted_topics[thing] = aws_topic_update_accepted_template.replace("&", thing);
				console.log("Start subscribe topic:" + delta_topics[thing]);
				console.log("Start subscribe topic:" + accepted_topics[thing]);
				client.subscribe(delta_topics[thing]);
				client.subscribe(accepted_topics[thing]);
			}
		}

		function checkSettingsUpdated(newSettings, things_changedCB, connection_changedCB) {
			// Check whether connection changed
			if ((newSettings.endpoint.toLowerCase() != oldSettings.endpoint.toLowerCase()) ||
				(newSettings.clientId != oldSettings.clientId) ||
				(newSettings.accessKey != oldSettings.accessKey) ||
				(newSettings.secretKey != oldSettings.secretKey) ||
				(newSettings.region != oldSettings.region)) {
				if (connection_changedCB) {
					connection_changedCB(newSettings);
				}
			} else {
				if (cmp_things(newSettings.things, oldSettings.things) === false) {
					if (things_changedCB) {
						things_changedCB(newSettings);
					}
				}
			}
		}

		function onConnect() {
			console.log("Connected");
			getThingsState(currentSettings);
			subscribe_topics(currentSettings);
			aws_data["connected"] = true;
			updateCallback(aws_data);
		}

		function onConnectionLost() {
			console.log("Connection Lost");
			aws_data["connected"] = false;
			updateCallback(aws_data);
		}

		function publish_msg(topic, msg) {
			if (client && client.connected) {
				console.log("Public msg to " + topic + ":" + msg);
				client.publish(topic, msg);
			}
		}

		function getThingsState(Settings) {
			updateCallback(aws_data);
			if (client && client.connected) {
				var thing, thingstate_topicpub, thingstate_topic;
				for (var i = Settings.things.length - 1; i >= 0; i--) {
					thing = Settings.things[i].thing;
					thingstate_topicpub = aws_get_thing_template.replace("&", thing);
					thingstate_topic = thingstate_topicpub + "/accepted";
					console.log("Start subscribe " + thingstate_topic);
					client.subscribe(thingstate_topic, function() {
						console.log("Start get state of " + thingstate_topicpub);
						client.publish(thingstate_topicpub, "{}");
					});
				}
			}
		}

		function getOneThingState(thing) {
			updateCallback(aws_data);
			if (client && client.connected) {
				var thingstate_topicpub, thingstate_topic;
				thingstate_topicpub = aws_get_thing_template.replace("&", thing);
				thingstate_topic = thingstate_topicpub + "/accepted";
				console.log("Start subscribe " + thingstate_topic);
				client.subscribe(thingstate_topic);
				console.log("Start get state of " + thingstate_topicpub);
				client.publish(thingstate_topicpub, "{}");
			}
		}

		function onMessageArrived(message) {
			console.log("Message Arrived:" + message.destinationName + '->' + message.payloadString);
			var topicTokens = message.destinationName.split('/');
			var thing = topicTokens[2];
			var operation = topicTokens[4];
			var operationStatus = topicTokens[5];
			var msg = JSON.parse(message.payloadString);
			var key, endpoint, Rid, i, Oid;
			if (aws_data[thing] === undefined) {
				aws_data[thing] = {};
			}
			if (aws_data[thing]["desired"] === undefined) {
				aws_data[thing]["desired"] = {};
			}
			if (aws_data[thing]["reported"] === undefined) {
				aws_data[thing]["reported"] = {};
			}
			if ((operation === "update") && (operationStatus === "delta")) {

			}
			if (((operation === "update") && (operationStatus === "accepted")) || ((operation === "get") && (operationStatus === "accepted"))) {
				for (endpoint in msg.state.reported) {
					if (msg.state.reported[endpoint] === null) {
						//delete UI
					} else if (aws_data[thing].reported[endpoint] === undefined && panesLoaded[endpoint] === undefined) {
						//add UI
						var pane = {};
						var widgets = [];
						var widget = {};
						pane.title = endpoint;
						pane.width = 1;
						pane.col_width = 1;
						pane.row = {
							"1": row[0][0] + row[0][1] - 5,
							"2": row[0][col[0]],
							"3": row[1][col[1]]
						};
						pane.col = {
							"1": 1,
							"2": col[0] + 1,
							"3": col[1] + 1
						};
						widget.type = "indicator";
						widget.settings = {
							"title": "connected",
							"value": '!(datasources["' + ["aws", thing, "reported", endpoint].join('"]["') + '"] == undefined)',
							"on_text": "ONLINE",
							"off_text": "OFFLINE"
						};
						row[0][col[0]] += 1;
						row[1][col[1]] += 1;
						widgets.push(widget);
						widget = {};
						for (Oid in msg.state.reported[endpoint]) {
							for (i in msg.state.reported[endpoint][Oid]) {
								if (Oid == "3303") {
									//temp
									widget.type = "sparkline";
									widget.settings = {
										"title": "temperature" + i,
										"value": ['datasources["' + ["aws", thing, "reported", endpoint, Oid, i, "5700"].join('"]["') + '"]'],
										"include_legend": true,
										"legend": "C"
									};
									row[0][col[0]] += 6;
									row[1][col[1]] += 6;
								} else if (Oid == "3311") {
									//light
									widget.type = "interactive_indicator";
									widget.settings = {
										"title": "light" + i,
										"value": 'datasources["' + ["aws", thing, "reported", endpoint, Oid, i, "5850"].join('"]["') + '"]',
										"callback": 'datasources["' + ["aws", thing, "desired", endpoint, Oid, i, "5850"].join('"]["') + '"]',
										"on_text": "ON",
										"off_text": "OFF"
									};
									row[0][col[0]] += 2;
									row[1][col[1]] += 2;
								} else {
									continue;
								}
								widgets.push(widget);
								widget = {};
							}
						}
						pane.widgets = widgets;
						freeboard.addPane(pane);
						col[0] += 1;
						col[0] %= 2;
						col[1] += 1;
						col[1] %= 3;
						panesLoaded[endpoint] = true;
					}
				}
				for (key in msg.state) {
					if (key === "delta"){
						continue;
					}
					if (aws_data[thing][key] === undefined) {
						aws_data[thing][key] = {};
					}
					for (endpoint in msg.state[key]) {
						if (msg.state[key][endpoint] === null) {
							aws_data[thing][key][endpoint] = undefined;
						} else {
							if (aws_data[thing][key][endpoint] === undefined) {
								aws_data[thing][key][endpoint] = {};
							}
							for (Oid in msg.state[key][endpoint]) {
								if (aws_data[thing][key][endpoint][Oid] === undefined) {
									aws_data[thing][key][endpoint][Oid] = {};
								}
								for (i in msg.state[key][endpoint][Oid]) {
									if (aws_data[thing][key][endpoint][Oid][i] === undefined) {
										aws_data[thing][key][endpoint][Oid][i] = {};
									}
									for (Rid in msg.state[key][endpoint][Oid][i]) {
										aws_data[thing][key][endpoint][Oid][i][Rid] = msg.state[key][endpoint][Oid][i][Rid];
									}
								}
							}
						}
					}
				}
				for (key in msg.state) {
					if (msg.state[key] === null) {
						aws_data[thing][key] = {};
					}
					for (endpoint in msg.state[key]) {
						if(key === "delta"){
							continue;
						}
						if(msg.state[key][endpoint] === null){
							aws_data[thing][key][endpoint] = undefined;
						}
						for (Oid in msg.state[key][endpoint]) {
							for (i in msg.state[key][endpoint][Oid]) {
								for (Rid in msg.state[key][endpoint][Oid][i]) {
									aws_data[thing][key][endpoint][Oid][i][Rid] = msg.state[key][endpoint][Oid][i][Rid];
								}
							}
						}
					}
				}
			}
			console.log("IoT Data parsed" + JSON.stringify(aws_data));
			updateCallback(aws_data);
		}

		// **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
		self.onSettingsChanged = function(newSettings) {
			checkSettingsUpdated(newSettings, things_changed, connection_changed);
		};

		// **updateNow()** (required) : A public function we must implement that will be called when the user wants to manually refresh the datasource
		self.updateNow = function() {
			if (client && client.connected) {
				console.log("Always in connected state!");
				// Connected Case
				getThingsState(currentSettings);
			} else {
				connection_changed(currentSettings);
			}
			// Don't need to do anything here, can't pull an update from MQTT.
		};

		// **onDispose()** (required) : A public function we must implement that will be called when this instance of this plugin is no longer needed. Do anything you need to cleanup after yourself here.
		self.onDispose = function() {
			if (client.connected) {
				client.disconnect();
			}
			client = {};
		};

		// **send(datasource, value)** (not required) :
		// A public function to send data to datasource
		// datasource: eg. ["xx"] or ["xx"]["xx"]
		// datasource : <thing>:<reported/desired>/<attribute>
		self.send = function(datasource, value) {
			var re = /\[\"([\w\_\-\$]+)\"\]/g;
			var msg2send = {
				state: {}
			};
			var thing = re.exec(datasource)[1];
			if (thing === "connected") { // Connect or disconnect
				if (value) {
					client_connect(currentSettings);
				} else {
					client_disconnect();
				}
			} else {
				if (client.connected === false) {
					console.log("Not connected, unable to send any messages!");
					return;
				}
				var match;
				var msg = "";
				var match_cnt = 0;
				var last_match;
				while ((match = re.exec(datasource))) {
					last_match = match[1];
					msg += '{' + '"' + last_match + '":';
					match_cnt += 1;
				}
				if (match_cnt > 1) {
					msg += value.toString();
					do {
						msg += '}';
						match_cnt--;
					} while (match_cnt);
					msg2send.state = JSON.parse(msg);
					var topic = aws_topic_pub_template.replace('&', thing);
					msg = JSON.stringify(msg2send);
					publish_msg(topic, msg);
				} else {
					console.log("Not a valid topic to publish!");
				}
			}
			updateCallback(aws_data);
		};

		function create_AWSClient(settings) {
			var clientId = settings.clientId;
			if ((clientId === undefined) || (clientId.trim() === "")) {
				var random = new Random();
				clientId = 'iotjs_' + random.string(6);
				///settings.clientId = clientId;
			}
			var options = {
				clientId: clientId,
				endpoint: settings.endpoint.toLowerCase(),
				accessKey: settings.accessKey,
				secretKey: settings.secretKey,
				regionName: settings.region
			};
			var client = new MQTTClient(options);
			client.on('connectionLost', onConnectionLost);
			client.on('messageArrived', onMessageArrived);
			client.on('connected', onConnect);
			client.on('subscribeFailed', function(e) {
				console.log('subscribeFailed ' + e);
			});
			client.on('subscribeSucess', function() {
				console.log('subscribeSucess');
			});
			client.on('publishFailed', function(e) {
				console.log('publishFailed');
			});
			console.log("Client " + clientId + " is created!");
			return client;
		}
	};


	function SigV4Utils() {}

	SigV4Utils.sign = function(key, msg) {
		var hash = CryptoJS.HmacSHA256(msg, key);
		return hash.toString(CryptoJS.enc.Hex);
	};

	SigV4Utils.sha256 = function(msg) {
		var hash = CryptoJS.SHA256(msg);
		return hash.toString(CryptoJS.enc.Hex);
	};

	SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
		var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
		var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
		var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
		var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
		return kSigning;
	};

	/**
	  * AWS IOT MQTT Client
	  * @class MQTTClient
	  * @param {Object} options - the client options
	  * @param {string} options.endpoint
	  * @param {string} options.regionName
	  * @param {string} options.accessKey
	  * @param {string} options.secretKey
	  * @param {string} options.clientId
	  * @param {angular.IScope}  [scope]  - the angular scope used to trigger UI re-paint, you can
	  omit this if you are not using angular
	  */
	function MQTTClient(options, scope) {
		this.options = options;
		this.scope = scope;

		this.endpoint = this.computeUrl();
		this.clientId = options.clientId;
		this.name = this.clientId + '@' + options.endpoint;
		this.connected = false;
		this.client = new Paho.MQTT.Client(this.endpoint, this.clientId);
		this.listeners = {};
		var self = this;
		this.client.onConnectionLost = function() {
			self.emit('connectionLost');
			self.connected = false;
		};
		this.client.onMessageArrived = function(msg) {
			self.emit('messageArrived', msg);
		};
		this.on('connected', function() {
			self.connected = true;
		});
	}

	/**
	 * compute the url for websocket connection
	 * @private
	 *
	 * @method	 MQTTClient#computeUrl
	 * @return	 {string}  the websocket url
	 */
	MQTTClient.prototype.computeUrl = function() {
		// must use utc time
		var time = moment.utc();
		var dateStamp = time.format('YYYYMMDD');
		var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
		var service = 'iotdevicegateway';
		var region = this.options.regionName;
		var secretKey = this.options.secretKey;
		var accessKey = this.options.accessKey;
		var algorithm = 'AWS4-HMAC-SHA256';
		var method = 'GET';
		var canonicalUri = '/mqtt';
		var host = this.options.endpoint;

		var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
		var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
		canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
		canonicalQuerystring += '&X-Amz-Date=' + amzdate;
		canonicalQuerystring += '&X-Amz-Expires=86400';
		canonicalQuerystring += '&X-Amz-SignedHeaders=host';

		var canonicalHeaders = 'host:' + host + '\n';
		var payloadHash = SigV4Utils.sha256('');
		var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;
		console.log('canonicalRequest ' + canonicalRequest);

		var stringToSign = algorithm + '\n' + amzdate + '\n' + credentialScope + '\n' + SigV4Utils.sha256(canonicalRequest);
		var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
		console.log('stringToSign-------');
		console.log(stringToSign);
		console.log('------------------');
		console.log('signingKey ' + signingKey);
		var signature = SigV4Utils.sign(signingKey, stringToSign);

		canonicalQuerystring += '&X-Amz-Signature=' + signature;
		var requestUrl = 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
		console.log('requestUrl :' + requestUrl);
		return requestUrl;
	};

	/**
	 * listen to client event, supported events are connected, connectionLost,
	 * messageArrived(event parameter is of type Paho.MQTT.Message), publishFailed,
	 * subscribeSucess and subscribeFailed
	 * @method	 MQTTClient#on
	 * @param	  {string}  event
	 * @param	  {Function}  handler
	 */
	MQTTClient.prototype.on = function(event, handler) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(handler);
	};

	/** emit event
	 *
	 * @method MQTTClient#emit
	 * @param {string}  event
	 * @param {...any} args - event parameters
	 */
	MQTTClient.prototype.emit = function(event) {
		var listeners = this.listeners[event];
		if (listeners) {
			var args = Array.prototype.slice.apply(arguments, [1]);
			for (var i = 0; i < listeners.length; i++) {
				var listener = listeners[i];
				listener.apply(null, args);
			}
			// make angular to repaint the ui, remove these if you don't use angular
			if (this.scope && !this.scope.$$phase) {
				this.scope.$digest();
			}
		}
	};

	/**
	 * connect to AWS, should call this method before publish/subscribe
	 * @method MQTTClient#connect
	 */
	MQTTClient.prototype.connect = function() {
		var self = this;
		var connectOptions = {
			onSuccess: function() {
				self.emit('connected');
			},
			useSSL: true,
			timeout: 10,
			mqttVersion: 4,
			onFailure: function() {
				self.emit('connectionLost');
			}
		};
		this.client.connect(connectOptions);
	};

	/**
	 * disconnect
	 * @method MQTTClient#disconnect
	 */
	MQTTClient.prototype.disconnect = function() {
		this.client.disconnect();
	};

	/**
	 * publish a message
	 * @method	 MQTTClient#publish
	 * @param	  {string}  topic
	 * @param	  {string}  payload
	 */
	MQTTClient.prototype.publish = function(topic, payload) {
		try {
			var message = new Paho.MQTT.Message(payload);
			message.destinationName = topic;
			message.qos = 1;
			this.client.send(message);
		} catch (e) {
			this.emit('publishFailed', e);
		}
	};

	/**
	 * subscribe to a topic
	 * @method	 MQTTClient#subscribe
	 * @param	  {string}  topic
	 */
	MQTTClient.prototype.subscribe = function(topic, callback) {
		var self = this;
		try {
			this.client.subscribe(topic, {
				onSuccess: function() {
					self.emit('subscribeSucess');
					if (_.isFunction(callback))
						callback();
				},
				onFailure: function() {
					self.emit('subscribeFailed');
				}
			});
		} catch (e) {
			this.emit('subscribeFailed', e);
		}
	};

	/**
	 * unsubscribe to a topic
	 * @method	 MQTTClient#unsubscribe
	 * @param	  {string}  topic
	 */
	MQTTClient.prototype.unsubscribe = function(topic) {
		var self = this;
		try {
			this.client.unsubscribe(topic);
		} catch (e) {
			this.emit('unsubscribeFailed', e);
		}
	};

}());