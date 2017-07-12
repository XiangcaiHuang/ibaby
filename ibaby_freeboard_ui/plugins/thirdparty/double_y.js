(function() {

	//
	// DECLARATIONS
	//
	var HIGHCHARTS_ID = 0;
	var ONE_SECOND_IN_MILIS = 1000;
	var MAX_NUM_SERIES = 2;

	//
	// HELPERS
	//

	// Get coordinates of point
	function xy(obj, x, y) {
		return [obj[x], obj[y]]
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	//
	// TIME SERIES CHARTS
	//
	var highchartsLineWidgetSettings = [{
		"name": "timeframe",
		"display_name": "Timeframe (s)",
		"type": "text",
		"description": "Specify the last number of seconds you want to see.",
		"default_value": 60
	}, {
		"name": "blocks",
		"display_name": "Height (No. Blocks)",
		"type": "text",
		"default_value": 4
	}, {
		"name": "chartType",
		"display_name": "Chart Type",
		"type": "option",
		"options": [
		{
			"name": "Spline",
			"value": "spline"
		},
		{
			"name": "Area",
			"value": "area"
		}]
	}, {
		"name": "title",
		"display_name": "Title",
		"type": "text"
	}];

	for (i = 1; i <= MAX_NUM_SERIES; i++) {
		var dataSource = {
			"name": "series" + i,
			"display_name": "Series " + i + " - Datasource",
			"type": "calculated"
		};

		var xField = {
			"name": "series" + i + "label",
			"display_name": "Series " + i + " - Label",
			"type": "text",
		};

		highchartsLineWidgetSettings.push(dataSource);
		highchartsLineWidgetSettings.push(xField);
	}

	freeboard
		.loadWidgetPlugin({
			"type_name": "double_y",
			"display_name": "y_series (Highcharts)",
			"description": "Time series line chart.",
			"external_scripts": [
				"highcharts/highcharts.js",
				"highcharts/exporting.js",
				"plugins/plugin_highcharts_theme.js",
				
				
			],
			"fill_size": true,
			"settings": highchartsLineWidgetSettings,
			newInstance: function(settings, newInstanceCallback) {
				newInstanceCallback(new highchartsTimeseriesWidgetPlugin(
					settings));
			}
		});

	var highchartsTimeseriesWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-timeseries-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="' + thisWidgetId + '"></div>');

		function createWidget() {

		
			// Get widget configurations
			//var thisWidgetXAxis = JSON.parse(currentSettings.xaxis);
			//var thisWidgetYAxis = JSON.parse(currentSettings.yaxis);
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetChartType = currentSettings.chartType;
			//console.log('chartType:' + currentSettings.chartType + ' ' + thisWidgetChartType);
			



			// Create widget
			thisWidgetContainer
				.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');

			thisWidgetContainer.highcharts({
				chart: {
					type: thisWidgetChartType,
					animation: Highcharts.svg,
                   // marginleft: 60,
					marginRight: 60,
					width:300,//插件宽度
					zoomType: 'xy'//支持图表放大缩小的范围
				},
				title: {
					text: thisWidgetTitle
				},
				xAxis:{title:{text:'Time'},type:'datetime',floor:0}, //thisWidgetXAxis,
				yAxis: [
					{ // 第一条Y轴

				      labels: {
				        // format: '{value}\xB0C',
				         style: {
				            color: Highcharts.getOptions().colors[1]
				         }
				      },
				      title: {
				         text: '活动强度',
				         style: {
				            color: Highcharts.getOptions().colors[1]
				         }
				      },
				      min:0,max:30000
				     

				   },

					{ // 第二条Y轴
					 title: {
				      	 text: '状态',
				         style: {color: Highcharts.getOptions().colors[0]}
				      },
					  labels: {
			        //  format: '{value}\xB0C',
			          style: { color: Highcharts.getOptions().colors[0] }
				      },
				     max:2.5,min:0,
				     
					   opposite: true//这个属性的作用是说 是否与第一条y轴相反 
					  }

				],
				plotOptions: {
					area: {
						marker: {
							enabled: false,
							symbol: 'circle',
							radius: 1.5,
							hover: {
								enabled: true
							}
						},
						lineWidth: 1,
						states: {
							hover: {
								lineWidth: 2
							}
						},
						threshold: null
					}
				},

				tooltip: {
					/*formatter: function() {
						return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',
							this.x) + '<br/>' + Highcharts.numberFormat(this.y, 1);
					},*/
					shared: true

				},
				legend:{
					      enabled:false,
					      layout: 'vertical',
					      align: 'left',
					      verticalAlign: 'top',
					      floating: true
					     
				},

				series: [
						{
							id: 'series1',
							name: currentSettings["series1label"],//label,
							yAxis: 1,
							fillColor: {
								linearGradient: {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 1
								},
								stops: [
									[0, Highcharts.getOptions().colors[0]],
									//[1, 'rgba(2,0,0,0)']
									[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
								]
							},

							data: [],
							connectNulls: true
						},
						{
							id: 'series2',
							name: currentSettings["series2label"],//label,
							//yAxis: 1,
							fillColor: {
								linearGradient: {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 1
								},
								stops: [
									[0, Highcharts.getOptions().colors[1]],
									//[1, 'rgba(2,0,0,0)']
									[1, Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0).get('rgba')]
								]
							},

							data: [],
							connectNulls: true
						}]//thisWidgetSeries
			});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.blocks;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {
			// console.log(settingName, 'newValue:', newValue);

			var chart = thisWidgetContainer.highcharts();
			var series = chart.get(settingName);
			if (series) {
				var timeframeMS = currentSettings.timeframe * ONE_SECOND_IN_MILIS;//////////////////////////////////////
				var seriesno = settingName;
				var len = series.data.length;
				var shift = false;

				// Check if it should shift the series
				if (series.data.length > 1) {

					var first = series.data[0].x;
					//var last = series.data[series.data.length-1].x;
					var last = new Date().getTime();
					// Check if time frame is complete
					var diff = last - first;
					//                                         console.log('last :', last);
					//                                         console.log('first:', first);
					//                                         console.log('diff :', diff);

					if (last - first > timeframeMS) {
						shift = true;
					}
				}

				if (isNumber(newValue)) { //check if it is a real number and not text
					var x = (new Date()).getTime();
					// console.log('addPoint:', x,currentSettings[seriesno], Number(newValue));
					var plotMqtt = [x, Number(newValue)]; //create the array+ "Y"
					series.addPoint(plotMqtt, true, shift);
				};
			}
		}

		self.onDispose = function() {
			return;
		}
	}

}());