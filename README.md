# node-red-contrib-fs
[Node-Red](http://nodered.org) nodes that work with the host filing system.

# Nodes
- [file-lister](docs/file-lister.html) - List all files and/or folders from a given starting folder based on the search
option chosen. File and folder names allow filtering patterns. Also has options for file details and sub-folder recursion.
- file-copier - In progress. Simple node to copy files (optionally with wildcard specifications).

# Install

The recommended installation method is to use the Palette Manager in the Node-RED Editor.

Alternatively, run the following command in your Node-RED userDir folder.

	npm install node-red-contrib-fs

To install a development version, use:

    npm install https://github.com/TotallyInformation/node-red-contrib-fs/tarball/master

# Updates
- 0.0.9 - Initial release - File lister. 2016-06-14
- 1.0.0 - Reworked File lister, more options. 2016-06-14
- 1.0.1 - Fix from [Andreas Brain](https://github.com/abrain) correcting URLs in package.json. 2016-06-22

- 1.1.0 - 2019-09-22
   - PR from [juggledad](https://github.com/juggledad) (amended) adds option to exclude files/folders that start with a dot (e.g. hidden)
   - Fix from [Lena Derksen](https://github.com/boisei0) fixes [Issue #9](https://github.com/TotallyInformation/node-red-contrib-fs/issues/9) by sending new messages rather than overwriting the incoming message on every send.
   - Readiness for Node-RED v1.0
   - If root folder is empty, return an empty array or a warning payload (based suggestion from [jpmalich](https://github.com/jpmalich))
   - Fixed file stat output - `created` was reporting incorrect date/time except on Windows. `statusChanged` datetime now added - see [Node.js docs](https://nodejs.org/api/fs.html#fs_stat_time_values) for details.
   - Plus other minor updates/fixes.
   
- 1.1.1 - Bug fixes and tidy
   - Add GitHub templates
   - Minor tidy of main code
   - Improve NR v1 send/done functions
   - Remove spurious `console.log(file)`
   - Remove input `_msgid` from output so that all output messages get their own _msgid (Fixes [Issue #11](https://github.com/TotallyInformation/node-red-contrib-fs/issues/11))
   - Update dependencies to latest
   
- 1.2.0 - 2020-01-06 new functionality(\*)
   - Folder pattern matching added
   - Search for files, folders or both added
   - all options now set able the incoming msg
   - (\*) because of the new functionality, existing nodes may see more results returned

- 1.3.1 - 2020-01-13 new functionality & bug fix
   - Fix memory leak [Issue #18](https://github.com/TotallyInformation/node-red-contrib-fs/issues/18) - thanks to Colin for reporting.
   - Add configuration option to turn off output warnings - these can be excessive as they include "cannot access" general warnings (permissions).
   - Code tidy

- 1.3.2 - 2020-01-15 Bug Fix
   - Fix inability to pass in start folder via msg [Issue #19](https://github.com/TotallyInformation/node-red-contrib-fs/issues/19) - thanks to Paul for reporting.

- 1.3.3 - 2020-08-29 Bug Fix
   - Fix override of hidden flag not working [Issue #20](https://github.com/TotallyInformation/node-red-contrib-fs/issues/20) - thanks to Paul for reporting.
   - Update dependencies

- 1.4.1 - 2020-08-29 Additional file details added
   - Added the following flags to the `stat` object which is included if the "file details" flag is set:

     isBlockDevice, isCharacterDevice, isDirectory, isFIFO, isFile, isSocket, isSymbolicLink

# Depends On
- [readdirp](https://github.com/paulmillr/readdirp)

You need Node.JS v8.16+ and Node-RED v0.16+ to use this Node.

# To Do

Please see [Issue #3](https://github.com/TotallyInformation/node-red-contrib-fs/issues/3) on GitHub for details about where this Node will go next.

If you have other ideas for filing system related nodes, please [raise an issue](https://github.com/TotallyInformation/node-red-contrib-fs/issues).

# License

This code is Open Source under an Apache 2 License. Please see the [apache2-license.txt file](https://github.com/TotallyInformation/node-red-contrib-fs/apache2-license.txt) for details.

You may not use this code except in compliance with the License. You may obtain an original copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Please see the
License for the specific language governing permissions and limitations under the License.

# Author

[Julian Knight](https://uk.linkedin.com/in/julianknight2/) ([Totally Information](https://www.totallyinformation.com)), https://github.com/totallyinformation

#Feedback and Support

Please report any issues or suggestions via the [Github Issues list for this repository](https://github.com/TotallyInformation/node-red-contrib-fs/issues).

For more information, feedback, or community support see the Node-Red Google groups forum at https://groups.google.com/forum/#!forum/node-red
