# Waterbear Cheat Sheet

## Philosophy of Waterbear

Waterbear is a tool by, of, and for the web. It is not just built using open web technologies, but tries to use them in a "webby" way. This means when we find ourselves struggling to implement some type of behaviour, rather than persevering to make it work like a desktop app, it is good to take a step back and think how it would work better on the web. This can be harder to do than it sounds, but has been worthwhile over the life of the project by making it simpler and easier to maintain and use. Sometimes just because we *can* do things more like a native app doesn't mean we *should*.

We also are striving (not 100% there yet) to keep any text that the user sees in HTML text so that it can easily be found and localized. If you find yourself adding (or working on) any user-visible text that is in an HTML attribute, CSS, or JavaScript, try to find a way to put that text into the HTML and reference it as needed.

## Magic Trick for looking up Web Documentation:

mdn.io/[anySearchTerm] will take search Mozilla Developers Network and take you to the top hit.

## Custom Elements

Waterbear defines custom elements for a lot of things, which lets us keep our HTML very high-level and (relatively) readable. This lets us define new HTML elements, add events that they send or receive, and give them new properties or methods. For blocks themselves, and the sub-elements which make up blocks, these are defined (naturally enough) in `js/block.js` while the IDE components for layout and non-block functionality are defined in `js/widget.js`. Each block follows the same pattern: create a prototype object, give that propotype some properties, methods, and/or event handlers, then register the prototype so it can be instantiated in the page. Each element has to have a hyphen in the name, so all of the custom elements defined for Waterbear start with `wb-`. There are four special lifecycle event handlers you can use to take action on the new element:

* `createdCallback` - called when the element is instantiated, either by `new WBElementname()` or from the document parsing a `<wb-elementname>` tag. The method takes no arguments, but the new element is available as `this` in the method. The element will have its initial attributes already, but will not yet have any child elements, so for behaviour involving child elements you will have to handle that when the children are added to the document.

* `attachedCallback` - called when the element is added to the document, ether during parsing or by calling one of the DOM methods such as `node.appendChild`. May be called multiple times during the life of the document (especially for blocks, since we move those around a lot), so any initialization done here has to check to see if it has already been done. There are no arguments to this method, and the element itself is available as `this`.

* `detachedCallback` - this is the counterpart to the above callback and is called when the element is removed from the document, even temporarily (to reparent from one element to another, for instance). If adding the element to the document has any side effects, this is where you should undo them.

* `attributeChangedCallback` - this is the only one of the lifecycle events that gets arguments. The element is still available as `this`, but we also get three arguments passed in: `attrName`, `oldValue`, and `newValue`. If you have attributes which have side effects when set (for example, in HTML the `<img>` tag loads an image when its `src` attribute is changed), you can handle that here. This is *not* called when the element is first loaded and all the attributes are set to their initial values, so you can handle that in one of the other lifecycle events (created or attached) as appropriate.

This in no way limits what you can do with custom elements, it is only the four special events that are gained by registering your new element. Custom elements can contain other elements (including other custom elements) and can register to handle events, etc. For events, try to use the `Event.on` pattern to register one event handler for every instance of the element rather than registering event handlers for each element individually.

## Where to find things (or put things) in the code

There are only a few places for code in Waterbear. All HTML (including uses of custom elements) goes in `playground.html` (or index.html for the landing page). All Waterbear project JavaScript goes in the `js` directory, with third-party libraries in `lib`. All CSS files go in `css`. The `stylesheets` directory is a holdover from an earlier version and only contains fonts for the homepage.

In the `js` and `css` directories: `block.[js|css]` defines the blocks and `widget.[js|css]` defines the user interface controls. The `reset.css` is a fairly standard CSS reset file to ensure the look and feel is consistent between browsers. The files `util.js`, `event.js`, and `dom.js` are utility files to reduce repetitive code. All the functions called by blocks when they are run are defined in `runtime.js`. Finally, `app.[js|css] is where the overall webapp is put together. We try to minimize dependencies between these various files with the idea that many of them could easily be re-used for other projects, but that is not a core requirement.

## Git Workflow

The Waterbear project is hosted on Github, so the first thing you will do to get started is to clone the project (you can use a desktop Git client app or the command-line, but I will document based on the command line): `git clone https://github.com/waterbearlang/waterbear.git` then `cd waterbear` (all git commands except `clone` should be within the project directory.

You will want to check out the current development branch to work from, `git checkout development`. Any work you do should start from there. When you are ready to work on an issue, make a new branch (starting from the development branch). First, make sure you are up to date with others work: `git pull origin development`, then make your new branch (naming is the issue number plus a couple of words to describe it), say to work on issue #827 "Building localizations is broken" you might create and switch to the new branch with `git checkout -b 827_remove_build_step`.

While you are working on an issue, you'll get into a cycle like this:

* Pull changes from others: `git pull origin development` (into your working branch)
* Resolve any conflicts from that pull
* Do some coding and periodically save what you have working: `git add [any new files]` followed by `git commit -am "brief description of work done"`. It's recommended to then `git push origin 827_remove_build_step` to send your branch updates to the server so others can see what you're doing, and to protect against hard drive loss, etc. NOTE: The first time you push, it will ask you for your Github user name and password. If you've set up the credentials helper (https://help.github.com/articles/caching-your-github-password-in-git/) you won't have to enter these again.

When your changes are finished and tested, you can go into Github and make a pull request from your branch to the development branch. Add a message describing how the issue was resolved. This will trigger a code review and may require changes to be made based on that review. Once the code review is done, we'll pull your changes into the development branch and you can switch to the development branch and start again.
