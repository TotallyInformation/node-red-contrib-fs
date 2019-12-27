/**
 * Copyright (c) 2019 Julian Knight (Totally Information)
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
var moduleName = 'fs-file-lister'

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
        node.folders  = config.folders !== undefined ? config.folders : "*"
        node.lstype   = config.lstype  !== undefined ? config.lstype : "files"
        node.hidden   = config.hidden  !== undefined ? config.hidden : true  /** @since v1.0.2 */
        node.path     = config.path
        node.single   = config.single
        node.depth    = config.depth   
        node.stat     = config.stat
                
		if ( (node.pattern == "") || (node.pattern == "*") ) node.pattern = "*.*"
		if  (node.folders == "") node.folders = "*"


        // Make sure the parameters are strings
        if ( (typeof node.start !== 'string') || (typeof node.pattern !== 'string') ) {
            node.error('Either Folder or Ext is not a string, cannot process. Folder: ' + node.start + ', Pattern: ' + node.ext)
            return
        }

        // respond to inputs....
        /** @since v1.0.1, amended ready for Node-RED v1 */
        node.on('input', function(msg, send, done) {

          // If this is pre-1.0, 'send' will be undefined, so fallback to node.send
            send = send || function() { node.send.apply(node,arguments) }
            // If this is pre-1.0, 'done' will be undefined, so fallback to dummy function
            done = done || function() { if (arguments.length>0) node.error.apply(node,arguments) }

		// ---------------------------------------------------------
 		// this section handles the overriding 'config' if option coming in msg.payload
 		// ---------------------------------------------------------
            // override 'start if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('start' in msg.payload) ) {
                if ( validFolderName(msg.payload.start) ) {
                    node.start = msg.payload.start
               }
            }
            // override file 'pattern' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('pattern' in msg.payload) ) {
                if ( (typeof msg.payload.pattern === 'string') && (msg.payload.pattern.length < 1024) ) {
                    node.pattern = msg.payload.pattern
                }
            }
            // override 'folders' pattern if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('folders' in msg.payload) ) {
                if ( (typeof msg.payload.folders === 'string') && (msg.payload.folders.length < 1024) ) {
                    node.folders = msg.payload.folders
                }
            }
            // override 'lstype' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('lstype' in msg.payload) ) {
                if ( (typeof msg.payload.lstype === 'string') && (msg.payload.lstype.length < 50) ) {
                    node.lstype = msg.payload.lstype.toLowerCase()
                }
            }
            // override 'hidden' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('hidden' in msg.payload) ) {
                if ( (typeof msg.payload.hidden === 'boolean')  ) {
                    node.hidden = msg.payload.hidden
                }
            }
            // override 'path' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('path' in msg.payload) ) {
                if ( (typeof msg.payload.path === 'boolean')  ) {
                    node.path = msg.payload.path
                }
            }
            // override 'single' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('single' in msg.payload) ) {
                if ( (typeof msg.payload.single === 'boolean')  ) {
                    node.single = msg.payload.single
                }
            }
            // override 'depth' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('depth' in msg.payload) ) {
                if ( (typeof msg.payload.depth === 'number') && (msg.payload.depth < 11) ) {
                    node.depth = msg.payload.depth
                }
            }
            // override 'stat' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('stat' in msg.payload) ) {
                if ( (typeof msg.payload.stat === 'boolean')  ) {
                    node.stat = msg.payload.stat
                }
            }

            var clonedMsg = RED.util.cloneMessage(msg)
            // Remove original _msgid
            delete clonedMsg._msgid
            // Output the nodes config
            clonedMsg.config = {
                'start': node.start,
                'pattern': node.pattern,
                'folders': node.folders,
                'lstype': node.lstype, 
                'hidden': node.hidden, /** @since v1.0.2 */
                'path': node.path,
                'single': node.single,
                'depth': node.depth,
                'stat': node.stat
            }

            // Keep count of files found
            var totalFiles = 0

            var options = {}
            
            if (node.lstype == 'folders') {node.lstype = 'directories'}
            if (node.lstype == 'both') {node.lstype = 'files_directories'}
           	options.type = node.lstype
            	
            if ( node.depth > -1 ) {
                options.depth = Number(node.depth)
            }
            if ( node.stat ) options.alwaysStat = true
            /** Show hidden files/folders? Unless explicitly asked for, readdirp will ignore them
             * NB: doesn't help with Windows hidden files/folders
             **/
            node.pattern = node.pattern.replace(/ /g,"")
             if ( node.hidden === true ) {
                // No need for this if supplied patter starts with a dot
                if (node.pattern.charAt(0) !== '.') {
                    var np = node.pattern.replace(/,/g,",.")
                    node.pattern = node.pattern +",."+np
                }
                if (node.folders.charAt(0) !== '.') {
                    var nf = node.folders.replace(/,/g,",.")
                    node.folders = node.folders +",."+nf
                }
            }

//			change shashes (/) to commas (,) then get rid of extra spaces
            node.folders = node.folders.replace(/\//g,",")
            node.folders = node.folders.replace(/ /g,"")
            
//			split the file and directory options into arrays arguments for 'readdirp'
            options.fileFilter = node.pattern.split(',')
            options.directoryFilter = node.folders.split(',')

            var arrayOut = []          

            // Recursively read the folder using the stream API
            // @ts-ignore
            readdirp(path.join(node.start), options)
                // Called if a found entry cannot be accessed (e.g. permissions)
                .on('warn', (err) => {
                    node.warn('File could not be accessed', err)
                })
                // Fatal error
                .on('error', (err) => {
                    node.error('Error processing folder listing', err)
                    // Use done for NR 1.0+
                    done(err)
                })
                // called for each entry found
                .on('data', (entry) => {
                    var file = entry.basename

                    // Do we want just the file name output or the full path?
                    if ( node.path ) {
                        file = entry.fullPath
                    }
                    // Do we want to include file stats?
                    if ( node.stat ) {
                        file = {name: file}
                        try {
                            /** NB: some stats props are BigInt which cannot be serialised (e.g. break debug node)
                             *  so convert to Number but that may truncate the value.
                             * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
                             **/
                            file.stat = {
                                size: Number(entry.stats.size), //in bytes
                                created: entry.stats.birthtime, // @since v1.1.0 ctime no longer used - see Node.js docs
                                changed: entry.stats.mtime,
                                accessed: entry.stats.atime,
                                statusChanged: entry.stats.ctime, // @since v1.1.0
                                uid: Number(entry.stats.uid),
                                gid: Number(entry.stats.gid),
                                mode: '0x' + entry.stats.mode.toString(16)
                            }
                        } catch (err) {
                            file.stat = {'error': 'Cannot stat file', 'err': err}
                        }
                    }
                    // If only single output
                    if ( node.single ) {
                        // accumulate the output array (send later on end)
                        arrayOut.push(file)
                    } else {
                        // or send each file as separate msg
                        node.status({fill:'green',shape:'dot',text:'# files ' + ++totalFiles})
                        send({
                            topic: clonedMsg.topic,
                            origPayload: clonedMsg.origPayload,
                            config: clonedMsg.config,
                            payload: file,
                            // debug: entry
                        })
                    }
                })
                // called when all entries have been output
                .on('end', () => {
                    // Send a single msg if arrayOut contains anything
                    if ( node.single ) {
                        //if ( arrayOut.length > 0 ) {
                        node.status({fill:'blue',shape:'dot',text:'# files ' + arrayOut.length})
                        clonedMsg.payload = arrayOut
                        send(clonedMsg)
                    } else {
                        // Empty folder so output a warning
                        if ( totalFiles === 0 ) {
                            node.status({fill:'yellow',shape:'dot',text:'Empty Folder'})
                            clonedMsg.payload = 'Empty Folder'
                            send(clonedMsg)
                        }
                    }
                    // Finished processing input msg (NR 1+)
                    done()
                })

        }) // --- End of node input fn --- //

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
