/**
 * Copyright (c) 2015 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Node for Node-Red that lists all files from a given start folder
// with an optionally specified file extension.

module.exports = function(RED) {
	'use strict'

	// The main node definition - most things happen in here
	function fsFileLister(config) {
		// Create a RED node
		RED.nodes.createNode(this, config)

		// copy "this" object in case we need it in context of callbacks of other functions.
		var node = this

		// send out the message to the rest of the workspace.
		// ... this message will get sent at startup so you may not see it in a debug node.
		// Define OUTPUT msg...
		//var msg = {};
		//msg.topic = this.topic;
		//msg.payload = "Hello world !"
		//node.send(msg);

		// respond to inputs....
		node.on('input', function(msg) {
      // processing goes here ...

      // Finally send on the msg
			node.send(msg)
		})

		// Tidy up if we need to
		//node.on("close", function() {
		// Called when the node is shutdown - eg on redeploy.
		// Allows ports to be closed, connections dropped etc.
		// eg: node.client.disconnect();
		//});
	}
	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType('fs-file-lister', fsFileLister)
}
