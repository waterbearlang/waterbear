// All File-like I/O functions, including:
//
// * Loading and saving to Gists
// * Loading and saving to MakeAPI (not implemented yet)
// * Loading and saving to Filesystem
// * Loading and saving to LocalStorage (including currentScript)
// * Loading examples
// * etc.
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
    function saveCurrentScripts(){
        if (!wb.scriptModified){
            // console.log('nothing to save');
            // nothing to save
            return;
        }
        document.querySelector('#block_menu').scrollIntoView();
        localStorage['__' + wb.language + '_current_scripts'] = scriptsToString();
    }

    // Save script to gist;
    function saveCurrentScriptsToGist(event){
        event.preventDefault();
        // console.log("Saving to Gist");
        var title = prompt("Save to an anonymous Gist titled: ");
        if ( !title ) return;
        ajax.post("https://api.github.com/gists", function(data){
            //var raw_url = JSON.parse(data).files["script.json"].raw_url;
            var gistID = JSON.parse(data).url.split("/").pop();
            prompt("This is your Gist ID. Copy to clipboard: Ctrl+C, Enter", gistID);

            //save gist id to local storage
            var localGists = localStorage['__' + wb.language + '_recent_gists'];
            var gistArray = localGists === undefined ? [] : JSON.parse(localGists);
            gistArray.push(gistID);
            localStorage['__' + wb.language + '_recent_gists'] = JSON.stringify(gistArray);

        }, JSON.stringify({
            "description": title,
            "public": true,
            "files": {
                "script.json": {
                    "content": scriptsToString(title, '', title)
                },
            }
        }), function(statusCode, x){
            alert("Can't save to Gist:\n" + statusCode + " (" + x.statusText + ") ");
        });
    }
    //populate the gist submenu with recent gists
    function loadRecentGists() {
        var localGists = localStorage['__' + wb.language + '_recent_gists'];
        var gistArray = localGists === undefined ? [] : JSON.parse(localGists);
        var gistContainer = document.querySelector("#recent_gists");
        gistContainer.innerHTML = '';

        for (var i = 0; i < gistArray.length; i++) {
            //add a new button to the gist sub-menu
            var gist = gistArray[i];
            var node = document.createElement("li");
            var button = document.createElement('button');
            var buttonText = document.createTextNode("#" + gist);

            button.appendChild(buttonText);
            button.classList.add('load-gist');
            button.dataset.href = wb.language + ".html?gist=" + gist;
            button.dataset.gist = gist;

            node.appendChild(button);
            gistContainer.appendChild(node);

            button.addEventListener('click', function(){
                wb.loadScriptsFromGistId(this.dataset.gist);
            });
        }
    }

    //Potential FIXME: I feel that title should be the filename, but uName || name
    //determines what is shown in the workspace.
    function scriptsToString(title, description, name){
        if (!title){ title = ''; }
        if (!description){ description = ''; }
        if (!name){ name = 'Workspace';}
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        var json = {
            title: title,
            description: description,
            date: Date.now(),
            waterbearVersion: '2.0',
            blocks: blocks.map(wb.blockDesc)
        };

        if(json.blocks[0].sockets[0].name){
            json.blocks[0].sockets[0].name = name;
        }else if(json.blocks[0].sockets[0].uName){
            json.blocks[0].sockets[0].uName = name;
        }

        return JSON.stringify(json, null, '    ');
    }


    function createDownloadUrl(evt){
        evt.preventDefault();
        var name = prompt("Save file as: ");
        if( !name ) return;
        // var URL = window.webkitURL || window.URL;
        var file = new Blob([scriptsToString('','',name)], {type: 'application/json'});
        var reader = new FileReader();
        var a = document.createElement('a');
        reader.onloadend = function(){
            a.href = reader.result;
            a.download = name + '.json';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
        };
        reader.readAsDataURL(file);
    }

    function loadScriptsFromGistId(id){
        //we may get an event passed to this function so make sure we have a valid id or ask for one
        var gistID = isNaN(parseInt(id)) ? prompt("What Gist would you like to load? Please enter the ID of the Gist: ")  : id;
        // console.log("Loading gist " + id);
        if( !gistID ) return;
        ajax.get("https://api.github.com/gists/"+gistID, function(data){
            loadScriptsFromGist({data:JSON.parse(data)});
        }, function(statusCode, x){
            alert("Can't load from Gist:\n" + statusCode + " (" + x.statusText + ") ");
        });
        var path = location.href.split('?')[0];
        path += "?gist=" + gistID;
        history.pushState(null, '', path);
    }

    function loadScriptsFromFilesystem(event){
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'application/json');
        input.addEventListener('change', function(evt){
            var file = input.files[0];
            loadScriptsFromFile(file);
        });
        input.click();
    }

    function loadScriptsFromObject(fileObject){
        // console.info('file format version: %s', fileObject.waterbearVersion);
        // console.info('restoring to workspace %s', fileObject.workspace);
        if (!fileObject) return wb.createWorkspace();
        var blocks = fileObject.blocks.map(wb.Block);
        if (!blocks.length){
            return wb.createWorkspace();
        }
        if (blocks.length > 1){
            console.error('not really expecting multiple blocks here right now');
            console.error(blocks);
        }
        blocks.forEach(function(block){
            wb.wireUpWorkspace(block);
            Event.trigger(block, 'wb-add');
        });
        wb.loaded = true;
        Event.trigger(document.body, 'wb-script-loaded');
    }

    function loadScriptsFromGist(gist){
        var keys = Object.keys(gist.data.files);
        var file;
        keys.forEach(function(key){
            if (/.*\.json/.test(key)){
                // it's a json file
                file = gist.data.files[key].content;
            }
        });
        if (!file){
            console.error('no json file found in gist: %o', gist);
            return;
        }
        loadScriptsFromJson(file);
    }

    function loadScriptsFromExample(name){
        ajax.get('examples/' + name + '.json?b=' + Math.random(), function(exampleJson){
            loadScriptsFromJson(exampleJson);
        }, function(statusCode, xhr){
            console.error(statusCode + xhr);
        });
    }

    function loadScriptsFromJson(jsonblob){
        // wb.clearScripts(null, true);
        wb.loaded = true;
        loadScriptsFromObject(JSON.parse(jsonblob));
        wb.scriptModified = true;
    }

    function loadCurrentScripts(queryParsed){
        // console.log('loadCurrentScripts(%s)', JSON.stringify(queryParsed));
        if (wb.loaded) return;
        wb.scriptLoaded = false;
        if (queryParsed.gist){
            //console.log("Loading gist %s", queryParsed.gist);
            ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
                loadScriptsFromGist({data:JSON.parse(data)});
            }, function(statusCode, x){
              alert("Can't save to gist:\n" + statusCode + " (" + x.statusText + ") ");
            });
        }else if (queryParsed.example){
            //console.log('loading example %s', queryParsed.example);
            loadScriptsFromExample(queryParsed.example);
        }else if (localStorage['__' + wb.language + '_current_scripts']){
            //console.log('loading current script from local storage');
            var fileObject = JSON.parse(localStorage['__' + wb.language + '_current_scripts']);
            if (fileObject){
                loadScriptsFromObject(fileObject);
            }
        }else{
            //console.log('no script to load, starting a new script');  
            wb.scriptLoaded = true;
            wb.createWorkspace('Workspace');
        }
        wb.loaded = true;
        Event.trigger(document.body, 'wb-loaded');
    }

	function loadScriptsFromFile(file){
		var fileName = file.name;
		if (fileName.indexOf('.json', fileName.length - 5) === -1) {
			console.error("File is not a JSON file");
			return;
		}
		var reader = new FileReader();
		reader.readAsText( file );
		reader.onload = function (evt){
            loadScriptsFromJson(evt.target.result);
		};
	}

    function getFiles(evt){
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        if ( files.length > 0 ){
            // we only support dropping one file for now
            var file = files[0];
            loadScriptsFromFile(file);
        }
    }

    wb.saveCurrentScripts = saveCurrentScripts;
    wb.saveCurrentScriptsToGist = saveCurrentScriptsToGist;
    wb.loadRecentGists = loadRecentGists;
    wb.createDownloadUrl = createDownloadUrl;
    wb.loadScriptsFromGistId = loadScriptsFromGistId;
    wb.loadScriptsFromFilesystem = loadScriptsFromFilesystem;
    wb.loadCurrentScripts = loadCurrentScripts;
    wb.getFiles = getFiles;

})(wb);
