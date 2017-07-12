
var LANConfig = {
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
					"type": "picture",
					"settings": {
                               "src":"../img/title.jpg"
					}
				}
			]
		},
		{
			"title": "连接状态",
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
						"title": "本地连接",
						"value": "datasources[\"lan\"][\"connected\"]",
						"callback": "datasources[\"lan\"][\"connected\"]",
						"on_text": "已连接",
						"off_text": "未连接"
					}
				}
			]
		}
	],
	"datasources": [
		{
			"name": "lan",
			"type": "websocket_client",
			"settings": {
				"host": document.location.hostname,
				"port": 3001,
				"refresh_time": 500,
				"name": "lan"
			}
		}
	],
	"columns": 3
};
