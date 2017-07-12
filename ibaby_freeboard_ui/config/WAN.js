var WANConfig = {
	"version": 1,
	"allow_edit": true,
	"plugins": [],
	"panes": [
		{
			"title": "",
			"width": 1,
			"row": {
				"1": 1,
				"2": 1,
				"3": 1
			},
			"col": {
				"1": 1,
				"2": 1,
				"3": 1
			},
			"col_width": "3",
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"size": "regular",
						"value": "EMSK SMARTHOME",
						"sparkline": false,
						"animate": true
					}
				}
			]
		},
		{
			"title": "CONNECTION STATUS",
			"width": 1,
			"row": {
				"1": 5,
				"2": 5,
				"3": 5
			},
			"col": {
				"1": 1,
				"2": 1,
				"3": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "interactive_indicator",
					"settings": {
						"title": "AWS IOT CONNECTION STATUS",
						"value": "datasources[\"aws\"][\"connected\"]",
						"callback": "datasources[\"aws\"][\"connected\"]",
						"on_text": "CONNECTED",
						"off_text": "DISCONNECTED"
					}
				}
			]
		}
	],

	"datasources": [
		{
			"name": "aws",
			"type": "aws_iot",
			"settings": {
				"endpoint": "",
				"region": "",
				"clientId": "",
				"accessKey": "",
				"secretKey": "",
				"things": [
					{
						"thing": "SmartHome"
					}
				]
			}
		}
	],
	"columns": 3
};