# Control Flow problems in Waterbear

1. When to start or re-start the script running
2. When is everything loaded an initialized? (iframe, ide, script via Ajax)

## Solutions to loading

1. Get rid of iframes and run inline
2. Or: fire web-ready event once both iframe and parent are ready (what about when iframe gets re-loaded?)

## We want to run the script when

* Play button is pressed
* Script is loaded and Autoplay is checked
* Script is loaded and view is full size
* Script is modified and view is full size
* Stage is moved to in mobile view
* Stage is resized (or we can resize the stage live)

## We don't want to update the stage when

* Script is running an hasn't changed (late onload event)
* Script is modified without autoplay checked
* Stage is not shown

## Nice to have these events

* Resize stage
* Pause script
* Restart script (from paused)

## Other ideas for fixes

* Hide buttons when stage is hidden (YES!)
* Fix loading initialization
* Add resize command
* Turn off autoplay in mobile view
* Turn on autoplay in full size view

## Where a controller could come in handy

* Manage hide/show panels
* Manage hide/show buttons
* Manage updating stage (running script)
* Manage updating text (script)
* Manage communication with iframe
* Manage initialization check
* Manage shared state and persistence, including user preferences and customization
* Manage updating the URL (history API)

## Bookmarkable state in WB

* Panels shown (or full size, or panel in mobile), positions of splitter panels when added
* Gist or example loaded (if unmodified)
* Autoplay