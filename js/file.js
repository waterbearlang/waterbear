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

/* WARNING !!!!

   Not everything in this file has been ported from the old waterbear
   Especially watch out for references to "wb"
*/

(function(){
'use strict';

    function saveCurrentScripts(){
        // super simplistic for now
        var script = scriptsToString();
        if (script){
            localStorage['__simple_currentWaterbearScript'] = script;
        }
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
            var localGists = localStorage['__' + File.language + '_recent_gists'];
            var gistArray = localGists === undefined ? [] : JSON.parse(localGists);
            gistArray.push(gistID);
            localStorage['__' + File.language + '_recent_gists'] = JSON.stringify(gistArray);

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
        var localGists = localStorage['__' + File.language + '_recent_gists'];
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
            button.dataset.href = File.language + ".html?gist=" + gist;
            button.dataset.gist = gist;

            node.appendChild(button);
            gistContainer.appendChild(node);

            // move this to a live event handler at the bottom of the file:
            button.addEventListener('click', function(){
                File.loadScriptsFromGistId(this.dataset.gist);
            });
        }
    }

    //Potential FIXME: I feel that title should be the filename, but uName || name
    //determines what is shown in the workspace.
    function scriptsToString(title, description, name){
        // super simplistic for now
        var script = document.querySelector('wb-workspace > wb-contains').innerHTML;
        return script;
    }


    function createDownloadUrl(evt){
        evt.preventDefault();
        var name = prompt("Save file as: ");
        if( !name ) return;
        // var URL = window.webkitURL || window.URL;
        var file = new Blob([scriptsToString('','',name)], {type: 'text/html'});
        var reader = new FileReader();
        var a = document.createElement('a');
        reader.onloadend = function(){
            a.href = reader.result;
            a.download = name + '.html';
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
        input.setAttribute('accept', 'text/html');
        input.addEventListener('change', function(evt){
            var file = input.files[0];
            loadScriptsFromFile(file);
        });
        input.click();
    }

    function loadScriptsFromString(text){
        // console.info('file format version: %s', fileObject.waterbearVersion);
        // console.info('restoring to workspace %s', fileObject.workspace);
        document.querySelector('wb-workspace > wb-contains').innerHTML = text;
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
        loadScriptsFromString(file);
    }

    function loadScriptsFromExample(name){
        ajax.get('examples/' + name + '.json?b=' + Math.random(), function(exampleJson){
            loadScriptsFromJson(exampleJson);
        }, function(statusCode, xhr){
            console.error(statusCode + xhr);
        });
    }

    function loadCurrentScripts(queryParsed){
        if (localStorage['__simple_currentWaterbearScript']){
            loadScriptsFromString(localStorage['__simple_currentWaterbearScript']);
        }
    }

	function loadScriptsFromFile(file){
		var fileName = file.name;
		if (fileName.indexOf('.html', fileName.length - 5) === -1) {
			console.error("File is not a HTML file");
			return;
		}
		var reader = new FileReader();
		reader.readAsText( file );
		reader.onload = function (evt){
            loadScriptsFromString(evt.target.result);
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

    Event.on(window, 'load', null, loadCurrentScripts);
    Event.on(window, 'beforeunload', null, saveCurrentScripts);

    window.File = {
        scriptsToString: scriptsToString,
        saveCurrentScripts: saveCurrentScripts,
        saveCurrentScriptsToGist: saveCurrentScriptsToGist,
        loadRecentGists: loadRecentGists,
        createDownloadUrl: createDownloadUrl,
        loadScriptsFromGistId: loadScriptsFromGistId,
        loadScriptsFromExample: loadScriptsFromExample,
        loadScriptsFromFilesystem: loadScriptsFromFilesystem,
        loadCurrentScripts: loadCurrentScripts,
        getFiles: getFiles
    }

})();
