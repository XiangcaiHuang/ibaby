// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard.io-highcharts                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2014 Hugo Sequeira (https://github.com/hugocore)       │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard widget plugin for Highcharts.                            │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

			Highcharts.theme = {
				global: {
					useUTC: false
				},
				colors: ['#43CD80', '#EE9A00', '#EE9A00', '#DDDF00', '#24CBE5', '#64E572', '#FF9655','#FFF263', '#6AF9C4'],
				chart: {
					backgroundColor: null,
					style: {
						fontFamily: "'Open Sans', sans-serif"
					},
					plotBorderColor: '#606063'
				},
				title: {
					style: {
						color: '#E0E0E3',
						fontSize: '20px'
					}
				},
				subtitle: {
					style: {
						color: '#E0E0E3',
						textTransform: 'uppercase'
					}
				},
				xAxis: {
					

					//gridLineColor: '#707073',
					labels: {
						style: {
							color: '#4D4D4D'
						}
					},
					//lineColor: '#FF0000',//x轴
					//minorGridLineColor: '#ff0000',
					//tickColor: '#707073',
					title: {
						style: {
							color: '#4D4D4D'

						}
					}
				},
				yAxis: {
					

					//gridLineColor: '#707073',/*100,75等对应直线颜色*/
					labels: {
						style: {
							color: '#4D4D4D'/*数字颜色*/
						}
					},
					//lineColor: '#707073',
					//minorGridLineColor: '#8FBC8F',
					//tickColor: '#707073',
					tickWidth: 1,
					title: {
						style: {
							color: '#4D4D4D'
						}
					}
				},
				tooltip: {
					backgroundColor: 'rgba(100, 100, 100, 0.85)',
					style: {
						color: '#F0F0F0'
					}
				},
				plotOptions: {
					series: {
						dataLabels: {
							color: '#B0B0B3'
						},
						marker: {
							lineColor: '#333'
						}
					},
					boxplot: {
						fillColor: '#505053'
					},
					candlestick: {
						lineColor: 'white'
					},
					errorbar: {
						color: 'white'
					}
				},
				legend: {
					itemStyle: {
						color: '#000000'
					},
					itemHoverStyle: {
						color: '#FFF'
					},
					itemHiddenStyle: {
						color: '#606063'
					}
				},
				credits: {
					style: {
						color: '#666'
					}
				},
				labels: {
					style: {
						color: '#707073'
					}
				},

				drilldown: {
					activeAxisLabelStyle: {
						color: '#F0F0F3'
					},
					activeDataLabelStyle: {
						color: '#F0F0F3'
					}
				},

				navigation: {
					buttonOptions: {
						symbolStroke: '#DDDDDD',
						theme: {
							fill: '#505053'
						}
					}
				},

				// scroll charts
				rangeSelector: {
					buttonTheme: {
						fill: '#505053',
						stroke: '#000000',
						style: {
							color: '#CCC'
						},
						states: {
							hover: {
								fill: '#707073',
								stroke: '#000000',
								style: {
									color: 'white'
								}
							},
							select: {
								fill: '#000003',
								stroke: '#000000',
								style: {
									color: 'white'
								}
							}
						}
					},
					inputBoxBorderColor: '#505053',
					inputStyle: {
						backgroundColor: '#333',
						color: 'silver'
					},
					labelStyle: {
						color: 'silver'
					}
				},

				navigator: {
					handles: {
						backgroundColor: '#666',
						borderColor: '#AAA'
					},
					outlineColor: '#CCC',
					maskFill: 'rgba(255,255,255,0.1)',
					series: {
						color: '#7798BF',
						lineColor: '#A6C7ED'
					},
					xAxis: {
						gridLineColor: '#505053'
					}
				},

				scrollbar: {
					barBackgroundColor: '#808083',
					barBorderColor: '#808083',
					buttonArrowColor: '#CCC',
					buttonBackgroundColor: '#606063',
					buttonBorderColor: '#606063',
					rifleColor: '#FFF',
					trackBackgroundColor: '#404043',
					trackBorderColor: '#404043'
				},

				// special colors for some of the
				legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
				background2: '#505053',
				dataLabelsColor: '#B0B0B3',
				textColor: '#C0C0C0',
				contrastTextColor: '#F0F0F3',
				maskColor: 'rgba(255,255,255,0.3)'
			};

			Highcharts.setOptions(Highcharts.theme);