(function() {

   freeboard.addStyle('.temperature-picture', "border-radius:20%;width:32px;height:32px;margin-top:-1px;float:left;margin-right:10px;");
    freeboard.addStyle('.temperature-picture.on', "box-shadow: inset -0.2em 0 0.3em #FFEC8B;border-color:#ff0000;");
    freeboard.addStyle('.temperature-text', "margin-top:1px;");
   var indicatorWidget = function (settings) {
        var self = this;
        var titleElement = $('<h2 class="section-title"></h2>');
        var stateElement = $('<div class="temperature-text"></div>');
        var indicatorElement = $('<div class="temperature-picture"></div>');
        var currentSettings = settings;
        var isOn = false;
        var onText=currentSettings.on_text;
        var offText=currentSettings.off_text;
        var data_body=37;
        function updateState() {
           // indicatorElement.toggleClass("on", isOn);

            if (isOn=='true') {
                stateElement.text((_.isUndefined(onText) ? (_.isUndefined(currentSettings.on_text) ? "" : currentSettings.on_text) : onText));
                 $(".temperature-text").append('<span style="font-size:170%;color:#EE5C42">&nbsp &nbsp &nbsp &nbsp'+data_body+'<span  style="font-size:70%"> &degC</span></span>');
            }
            else {
                stateElement.text((_.isUndefined(offText) ? (_.isUndefined(currentSettings.off_text) ? "" : currentSettings.off_text) : offText));
                $(".temperature-text").append('<span style="font-size:170%;color:#EE9A00">&nbsp &nbsp &nbsp &nbsp'+data_body+'<span  style="font-size:70%"> &degC</span></span>');
            }
        }

        this.render = function (element) {
            $(element).append(titleElement).append(indicatorElement).append(stateElement);
            $(".temperature-picture").append('<img src="../img/temperature.jpg">');
            updateState();
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
            titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
            updateState();
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == "value") {
                isOn = newValue;
              
            }
           
           if (settingName == "data") {
                data_body = newValue;
            }
 

            updateState();
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 1;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "temperature",
        display_name: "Temperature",
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            },
            {
                name: "on_text",
                display_name: "On Text",
                type: "calculated"
            },
            {
                name: "off_text",
                display_name: "Off Text",
                type: "calculated"
            },
            
              {
                name: "data",
                display_name: "date of value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new indicatorWidget(settings));
        }
    });

}());