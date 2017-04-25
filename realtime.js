/*******************************************************************************
* Copyright (c) 2014 IBM Corporation and other Contributors.
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
* IBM - Initial Contribution
*******************************************************************************/

			var topic = msg.destinationName;
			console.log("topic: " + topic);
			
			var payload = JSON.parse(msg.payloadString);
			//First message, instantiate the graph  
		    if (firstMessage) {
		    	$('#chart').empty();
		    	firstMessage=false;
		    	rtGraph.displayChart(null,payload);
		    } else {
		    	rtGraph.graphData(payload);
		    }

			for (var j in payload.d) {
				if (typeof payload.d[j] !== 'string') {
					console.log("payload.d[j]: " + payload.d[j]);

					if(payload.d[j] > 20){
						var warningMsg = new Messaging.Message("{ \"cmd\" : \"warning (" + payload.d[j] + ")\" }");
						var commandTopic = "iot-2/type/" + typeID + "/id/" + deviceID + "/cmd/" + "cid" + "/fmt/json";
						warningMsg.destinationName = commandTopic;
						console.log("warningMsg.destinationName: " + commandTopic);
						client.send(warningMsg);
					}

				}
			}

		};

		client.onConnectionLost = function(e){
			console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
			this.connect(connectOptions);
		}

		var connectOptions = new Object();
		connectOptions.keepAliveInterval = 3600;
		connectOptions.useSSL=true;
		connectOptions.userName=api_key;
		connectOptions.password=auth_token;

		connectOptions.onSuccess = function() {
			console.log("MQTT connected to host: "+client.host+" port : "+client.port+" at " + Date.now());
		}

		connectOptions.onFailure = function(e) {
			console.log("MQTT connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);
		}

		console.log("about to connect to " + client.host);
		client.connect(connectOptions);
	}

	// Subscribe to the device when the device ID is selected.
	this.plotRealtimeGraph = function(){
		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		
		var item = $("#deviceslist").val();
		var tokens = item.split(':');
		typeID = tokens[2];
		deviceID = tokens[3];

		if(subscribeTopic != "") {
			console.log("Unsubscribing to " + subscribeTopic);
			client.unsubscribe(subscribeTopic);
		}

		//clear prev graphs
		$('#chart').hide(function(){ 
			$('#chart').empty(); 
			$('#chart').show();
			$('#chart').append(imageHTML);
		});
		
		$('#timeline').empty();
		$('#legend').empty();
		firstMessage = true;

		subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);
	}

	this.initialize();

	var imageHTML = '<div class="iotdashboardtext">The selected device is not currently sending events to the Internet of Things Foundation</div><br><div class="iotdashboardtext">Select to view historical data or select a different device.</div> <img class="iotimagesMiddle" align="middle" alt="Chart" src="images/IOT_Icons_Thing02.svg">';
}
