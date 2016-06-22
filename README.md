# node-red-contrib-fs
[Node-Red](http://nodered.org) nodes that work with the host filing system.

#Nodes
- [file-lister](docs/file-lister.html) - List all files in a given starting folder optionally with a filename filter pattern. Also has options for file details and sub-folder recursion.
- file-copier - In progress. Simple node to copy files (optionally with wildcard specifications).

#Install

Run the following command in the root directory of your Node-RED install

	npm install node-red-contrib-fs

While in development, install with:

    npm install https://github.com/TotallyInformation/node-red-contrib-fs/tarball/master

#Updates
- 0.0.9 - Initial release - File lister. 2016-06-14
- 1.0.0 - Reworked File lister, more options. 2016-06-14
- 1.0.1 - Fix from [Andreas Brain](https://github.com/abrain) correcting URLs in package.json. 2016-06-22

#Depends On
- [readdirp](https://github.com/thlorenz/readdirp)

#To Do
- Add additional input overrides to file lister
- Additional nodes: Create/Move/Delete file/folder

If you have other ideas for filing system related nodes, please [raise an issue](https://github.com/TotallyInformation/node-red-contrib-fs/issues).

#License

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
