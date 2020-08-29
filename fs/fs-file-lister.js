/**
 * Copyright (c) 2020 Julian Knight (Totally Information)
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
const path = require('path')
const readdirp = require('readdirp')

// Module name must match this nodes html file
const moduleName = 'fs-file-lister'

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

module.exports = function(RED) {
    'use strict'

    // The main node definition - most things happen in here
    function nodeGo(config) {
        // Create a RED node
        RED.nodes.createNode(this, config)

        // copy "this" object in case we need it in context of callbacks of other functions.
        const node = this

        // Store local copies of the node configuration (as defined in the .html)
        node.topic    = config.topic
        node.name     = config.name
        node.start    = config.start
        node.pattern  = config.pattern
        node.folders  = config.folders !== undefined ? config.folders : '*'
        node.lstype   = config.lstype  !== undefined ? config.lstype : 'files'
        node.hidden   = config.hidden  !== undefined ? config.hidden : true  /** @since v1.0.2 */
        node.path     = config.path
        node.single   = config.single
        node.depth    = config.depth   
        node.stat     = config.stat
        node.showWarnings = config.showWarnings !== undefined ? config.showWarnings : true
                
        if ( (node.pattern == '') || (node.pattern == '*') ) node.pattern = '*.*'
        if  (node.folders == '') node.folders = '*'


        // Make sure the parameters are strings
        if ( (typeof node.start !== 'string') || (typeof node.pattern !== 'string') ) {
            node.error('Either Folder or Ext is not a string, cannot process. Folder: ' + node.start + ', Pattern: ' + node.ext)
            return
        }

        // change shashes (/) to commas (,) then get rid of extra spaces
        node.folders = node.folders.replace(/\//g, ',')
        node.folders = node.folders.replace(/ /g, '')

        // respond to inputs....
        /** @since v1.0.1, amended ready for Node-RED v1 */
        node.on('input', function(msg, send, done) {

            // If this is pre-1.0, 'send' will be undefined, so fallback to node.send
            send = send || function() { node.send.apply(node,arguments) }
            // If this is pre-1.0, 'done' will be undefined, so fallback to dummy function
            done = done || function() { if (arguments.length>0) node.error.apply(node,arguments) }

            let clonedMsg = RED.util.cloneMessage(msg)
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

            // ---------------------------------------------------------
            // this section handles the overriding 'config' if option coming in msg.payload
            // ---------------------------------------------------------
            // override 'start if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('start' in msg.payload) ) {
                if ( validFolderName(msg.payload.start) ) {
                    clonedMsg.config.start = msg.payload.start
                }
            }
            // override file 'pattern' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('pattern' in msg.payload) ) {
                if ( (typeof msg.payload.pattern === 'string') && (msg.payload.pattern.length < 1024) ) {
                    clonedMsg.config.pattern = msg.payload.pattern
                }
            }
            // override 'folders' pattern if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('folders' in msg.payload) ) {
                if ( (typeof msg.payload.folders === 'string') && (msg.payload.folders.length < 1024) ) {
                    clonedMsg.config.folders = msg.payload.folders
                }
            }
            // override 'lstype' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('lstype' in msg.payload) ) {
                if ( (typeof msg.payload.lstype === 'string') && (msg.payload.lstype.length < 50) ) {
                    clonedMsg.config.lstype = msg.payload.lstype.toLowerCase()
                }
            }
            // override 'hidden' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('hidden' in msg.payload) ) {
                if ( (typeof msg.payload.hidden === 'boolean')  ) {
                    clonedMsg.config.hidden = msg.payload.hidden
                }
            }
            // override 'path' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('path' in msg.payload) ) {
                if ( (typeof msg.payload.path === 'boolean')  ) {
                    clonedMsg.config.path = msg.payload.path
                }
            }
            // override 'single' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('single' in msg.payload) ) {
                if ( (typeof msg.payload.single === 'boolean')  ) {
                    clonedMsg.config.single = msg.payload.single
                }
            }
            // override 'depth' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('depth' in msg.payload) ) {
                if ( (typeof msg.payload.depth === 'number') && (msg.payload.depth < 11) ) {
                    clonedMsg.config.depth = msg.payload.depth
                }
            }
            // override 'stat' if passed suitable payload
            if ( (typeof msg.payload === 'object') && ('stat' in msg.payload) ) {
                if ( (typeof msg.payload.stat === 'boolean')  ) {
                    clonedMsg.config.stat = msg.payload.stat
                }
            }
            
            if (node.lstype == 'folders') {clonedMsg.config.lstype = 'directories'}
            if (node.lstype == 'both') {clonedMsg.config.lstype = 'files_directories'}

            // Keep count of files found
            let totalFiles = 0

            let options = {}

            options.type = clonedMsg.config.lstype
	
            if ( clonedMsg.config.depth > -1 ) {
                options.depth = Number(clonedMsg.config.depth)
            }
            if ( clonedMsg.config.stat ) options.alwaysStat = true
            
            /** Show hidden files/folders? Unless explicitly asked for, readdirp will ignore them
             * NB: doesn't help with Windows hidden files/folders
             * @since v1.3.3, moved to fix Issue #20
             **/
            //node.pattern = node.pattern.replace(/ /g,'')
            if ( clonedMsg.config.hidden === true ) {
                // No need for this if supplied patter starts with a dot
                if (clonedMsg.config.pattern.charAt(0) !== '.') {
                    clonedMsg.config.pattern = clonedMsg.config.pattern + ',.' + clonedMsg.config.pattern.replace(/,/g, ',.')
                }
                if (clonedMsg.config.folders.charAt(0) !== '.') {
                    clonedMsg.config.folders = clonedMsg.config.folders + ',.' + clonedMsg.config.folders.replace(/,/g, ',.')
                }
            }

            // split the file and directory options into arrays arguments for 'readdirp'
            options.fileFilter = clonedMsg.config.pattern.split(',')
            options.directoryFilter = clonedMsg.config.folders.split(',')

            let arrayOut = []

            // Recursively read the folder using the stream API
            // @ts-ignore
            readdirp(path.join(clonedMsg.config.start), options)
                // Called if a found entry cannot be accessed (e.g. permissions)
                .on('warn', (err) => {
                    if ( node.showWarnings === true ) node.warn('File could not be accessed', err)
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
                    if ( clonedMsg.config.path ) {
                        file = entry.fullPath
                    }
                    // Do we want to include file stats?
                    if ( clonedMsg.config.stat ) {
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
                                mode: '0x' + entry.stats.mode.toString(16),
                                isBlockDevice: entry.stats.isBlockDevice(),
                                isCharacterDevice: entry.stats.isCharacterDevice(),
                                isDirectory: entry.stats.isDirectory(),
                                isFIFO: entry.stats.isFIFO(),
                                isFile: entry.stats.isFile(),
                                isSocket: entry.stats.isSocket(),
                                isSymbolicLink: entry.stats.isSymbolicLink(),
                            }
                        } catch (err) {
                            file.stat = {'error': 'Cannot stat file', 'err': err}
                        }
                    }
                    // If only single output
                    if ( clonedMsg.config.single ) {
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

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(moduleName, nodeGo)
} // ---- End of Mobule ---- //
