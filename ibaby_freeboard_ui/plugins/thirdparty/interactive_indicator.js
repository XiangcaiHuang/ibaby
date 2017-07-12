(function() {

    freeboard.loadWidgetPlugin({
        type_name: "interactive_indicator",
        display_name: "Interactive Indicator Light",
        description: "Indicator which can send a value as well as receive one",
        settings: [{
                name: "title",
                display_name: "Title",
                type: "text"
            }, {
                name: "value",
                display_name: "Value",
                type: "calculated"
            }, {
                name: "callback",
                display_name: "Datasource to send to",
                type: "calculated"
            }, {
                name: "on_text",
                display_name: "On Text",
                type: "calculated"
            }, {
                name: "off_text",
                display_name: "Off Text",
                type: "calculated"
            },

        ],
        newInstance: function(settings, newInstanceCallback) {
            newInstanceCallback(new interactiveIndicator(settings));
        }
    });

    freeboard.addStyle('.indicator-light.interactive:hover', "box-shadow: 0px 0px 15px #FF9900; cursor: pointer;");
    var interactiveIndicator = function(settings) {
        var self = this;
        var titleElement = $('<h2 class="section-title"></h2>');
        var stateElement = $('<div class="indicator-text"></div>');
        var indicatorElement = $('<div class="indicator-light interactive"></div>');
        var currentSettings = settings;
        var isOn = false;
        var onText;
        var offText;

        function updateState() {
            indicatorElement.toggleClass("on", isOn);

            if (isOn) {
                stateElement.text((_.isUndefined(onText) ? (_.isUndefined(currentSettings.on_text) ? "" : currentSettings.on_text) : onText));
            } else {
                stateElement.text((_.isUndefined(offText) ? (_.isUndefined(currentSettings.off_text) ? "" : currentSettings.off_text) : offText));
            }
        }


        this.onClick = function(e) {
            e.preventDefault()

            if (currentSettings.callback && (currentSettings.callback.trim() !== "")) {
                var new_val = !isOn;
                this.onCalculatedValueChanged('value', new_val);
                this.sendValue(currentSettings.callback, new_val);
            }
        }


        this.render = function(element) {
            $(element).append(titleElement).append(indicatorElement).append(stateElement);
            $(indicatorElement).click(this.onClick.bind(this));
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
            updateState();
        }

        this.onCalculatedValueChanged = function(settingName, newValue) {
            if (settingName == "value") {
                isOn = newValue;
                // isOn = Boolean(newValue);
            }
            if (settingName == "on_text") {
                onText = newValue;
            }
            if (settingName == "off_text") {
                offText = newValue;
            }

            updateState();
        }

        this.onDispose = function() {}

        this.getHeight = function() {
            return 1;
        }

        this.onSettingsChanged(settings);
    };

}());