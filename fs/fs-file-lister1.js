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

var moduleName = 'fs-file-lister'

module.exports = function(RED) {
	'use strict'

	var fs = require('fs')
	var path = require('path')

	// The main node definition - most things happen in here
	function fsFileLister(config) {
		// Create a RED node
		RED.nodes.createNode(this, config)

		// copy "this" object in case we need it in context of callbacks of other functions.
		var node = this

		// Store local copies of the node configuration (as defined in the .html)
		node.topic = config.topic
		node.start = config.start
		node.ext   = config.ext
		node.sub   = config.sub
		node.path  = config.path
		node.single= config.single

		// Make sure the parameters are strings
		if ( (typeof node.start !== 'string') || (typeof node.ext !== 'string') ) {
			node.error('Either Folder or Ext is not a string, cannot process. Folder: ' + node.start + ', Ext: ' + node.ext)
			return
		}

		// respond to inputs....
		node.on('input', function(msg) {

			// Keep the original topic and payload
			msg.topic = msg.topic
			msg.origPayload = msg.payload
			// Output the nodes config
			msg.config = {
				'start': node.start,
				'ext': node.ext,
				'sub': node.sub,
				'path': node.path,
				'single': node.single
			}

			// Async read the folder
			fs.readdir(node.start, function (err, files) {
				if (err) {
					node.error('Oops! Folder does not exist: ' + node.start, err)
					return
				}

				node.log('Total # files: ' + files.length)

				var arrayOut = []

				// Any error in here will crash Node-Red!! So catch them instead
				try {
					files
						// calls the given callback func for each file, will only pass names where fn returns true
						.filter( function (file) {
							var len = node.ext.length
							if (len === 0) return true
							// Returns TRUE only if the file name ends in the given extension
							return file.substr(0-len) === node.ext
						})
						.forEach( function (file) {
							if ( node.path ) {
								file = path.join(node.start, file)
							}
							// If only single output
							if ( node.single ) {
								// accumulate the output array (send later)
								arrayOut.push(file)
							} else {
								// or send each file as separate msg
								msg.payload = file
								node.send( msg )
							}
						})
				} catch (err) {
					node.error('Ouch! Something went badly wrong processing the files list', err)
					return
				}

				// Send a single msg if arrayOut contains anything
				if ( arrayOut.length > 0 ) {
					msg.payload = arrayOut
					node.send(msg)
				}

			}) // --- End of readdir callback --- //

		}) // --- End of node input fn --- //

		// Tidy up if we need to
		//node.on("close", function() {
		// Called when the node is shutdown - eg on redeploy.
		// Allows ports to be closed, connections dropped etc.
		// eg: node.client.disconnect();
		//});

	} // --- End of fnFileLister --- //

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType(moduleName, fsFileLister)
} // ---- End of Mobule ---- //
