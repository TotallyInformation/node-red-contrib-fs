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
//var fs = require('fs')
var path = require('path')
var readdirp = require('readdirp')

// Module name must match this nodes html file
var moduleName = 'fs-file-copier'

module.exports = function(RED) {
	'use strict'

	// The main node definition - most things happen in here
	function nodeGo(config) {
		// Create a RED node
		RED.nodes.createNode(this, config)

		// copy "this" object in case we need it in context of callbacks of other functions.
		var node = this

		// Store local copies of the node configuration (as defined in the .html)
		node.topic    = config.topic
		node.name     = config.name
		node.start    = config.start
		node.pattern  = config.pattern
		node.path     = config.path
		node.single   = config.single
		node.depth    = config.depth
		node.stat     = config.stat

		// Make sure the parameters are strings
		if ( (typeof node.start !== 'string') || (typeof node.pattern !== 'string') ) {
			node.error('Either Folder or Ext is not a string, cannot process. Folder: ' + node.start + ', Pattern: ' + node.ext)
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
				'pattern': node.pattern,
				'path': node.path,
				'single': node.single,
				'depth': node.depth,
				'stat': node.stat
			}

			// override config if passed suitable payload
			if ( (typeof msg.payload === 'object') && ('start' in msg.payload) ) {
				if ( validFolderName(msg.payload.start) ) {
					node.start = msg.payload.start
				}
			}
			if ( (typeof msg.payload === 'object') && ('pattern' in msg.payload) ) {
				if ( (typeof msg.payload.pattern === 'string') && (msg.payload.pattern.length < 1024) ) {
					node.pattern = msg.payload.pattern
				}
			}

			// Keep count of files found
			var totalFiles = 0

			var options = {}
			options.root = path.join(node.start),
			options.fileFilter = node.pattern
			options.entryType = 'files'
			if ( node.depth > -1 ) {
				options.depth = Number(node.depth)
			}

			var arrayOut = []

			// Recursively read the folder using the stream API
			readdirp(options)
				// Called if a found entry cannot be accessed (e.g. permissions)
				.on('warn', function (err) {
					node.warn('File could not be accessed', err)
				})
				// Fatal error
				.on('error', function (err) {
					node.error('Error processing folder listing', err)
				})
				// called for each entry found
				.on('data', function (entry) {
					var file = entry.name
					// Do we want just the file name output or the full path?
					if ( node.path ) {
						file = entry.fullPath
					}
					// Do we want to include file stats?
					if ( node.stat ) {
						file = {name: file}
						file.stat = {
							size: entry.stat.size,
							created: entry.stat.ctime,
							changed: entry.stat.mtime,
							accessed: entry.stat.atime,
							uid: entry.stat.uid,
							gid: entry.stat.gid,
							mode: '0x' + entry.stat.mode.toString(16)
						}
					}
					// If only single output
					if ( node.single ) {
						// accumulate the output array (send later on end)
						arrayOut.push(file)
					} else {
						// or send each file as separate msg
						node.status({fill:'green',shape:'dot',text:'# files ' + ++totalFiles})
						msg.payload = file
						//msg.debug = entry
						node.send( msg )
					}
				})
				// called when all entries have been output
				.on('end', function () {
					// Send a single msg if arrayOut contains anything
					if ( arrayOut.length > 0 ) {
						node.status({fill:'blue',shape:'dot',text:'# files ' + arrayOut.length})
						msg.payload = arrayOut
						node.send(msg)
					}
				})

			/*
			// Async read the folder
			fs.readdir(node.start, function (err, files) {
				if (err) {
					node.error('Oops! Folder does not exist: ' + node.start, err)
					return
				}

				totalFiles = files.length
				node.status({fill:'blue',shape:'dot',text:filteredFiles + '/' + totalFiles})

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
			*/

		}) // --- End of node input fn --- //

		// Tidy up if we need to
			//node.on("close", function() {
			// Called when the node is shutdown - eg on redeploy.
			// Allows ports to be closed, connections dropped etc.
			// eg: node.client.disconnect();
		//});

	} // --- End of fnFileLister --- //

	// Check if a folder name is safe
	function validFolderName(folder) {
		var isValid = true
		if ( typeof folder !== 'string' ) {
			isValid = false
		} else {
			if ( folder.length > 1023 ) {
				isValid = false
			}
		}
		return isValid
	} // --- End of validFolderName function --- //

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType(moduleName, nodeGo)
} // ---- End of Mobule ---- //
