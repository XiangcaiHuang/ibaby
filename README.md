# iBaby Smarthome Gateway and UI

## Overview

This application is designed for **iBaby Infant Sleeping Monitoring System**, you can download the source code of ![ibaby_smarthome_multinode][30] based on ![EMSK][31], ![embARC OSP][32] and ![embARC Applications][33]. It shows how to connect 1 or more EMSKs with **iBaby Smarthome Gateway**. The connection between EMSK and Gateway is based on **LwM2M** protocol as shown in the following figure. Users can view all data via iBaby Freeboard UI remotely.

![ibaby_function][0]

![system_architecture][1]

![freeboard_ui][2]

* ibaby_smarthome_gateway

Gateway for iBaby Smarthome. See ![iBaby Smarthome Gateway README][34] for more information.

* ibaby_freeboard_ui

UI for iBaby Smarthome. See ![iBaby Freeboard UI README][35] for more information.

## Usage

	git clone https://github.com/XiangcaiHuang/ibaby.git


[0]: ./doc/screenshots/ibaby_function.PNG         "ibaby_function"
[1]: ./doc/screenshots/system_architecture.PNG    "system_architecture"
[1]: ./doc/screenshots/freeboard_ui.PNG           "freeboard_ui"

[30]: https://github.com/XiangcaiHuang/embarc_applications/tree/master/ibaby_smarthome_multinode    "ibaby_smarthome_multinode"
[31]: https://www.synopsys.com/dw/ipdir.php?ds=arc_em_starter_kit    "DesignWare ARC EM Starter Kit(EMSK)"
[32]: https://github.com/foss-for-synopsys-dwc-arc-processors/embarc_osp    "embARC OSP"
[33]: https://github.com/foss-for-synopsys-dwc-arc-processors/embarc_applications    "embARC Applications"
[34]: https://github.com/XiangcaiHuang/ibaby/blob/master/ibaby_smarthome_gateway/README.md    "iBaby Smarthome Gateway README"
[35]: https://github.com/XiangcaiHuang/ibaby/blob/master/ibaby_freeboard_ui/README.md    "iBaby Freeboard UI README"

