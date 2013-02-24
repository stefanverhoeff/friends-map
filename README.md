friends-map
===========

Map of Facebook friends using jHere.

Running version:
http://stefanverhoeff.github.com/friends-map/

### Feature ideas
- Pie menu for friends living in same town
  - Show line to town center
  - Animate circle, expand on mouseover
- Loading progress indicator
  - Show friend count
- Bring user pic to front on hover or friend list click, in case of overlap
- Group and sort friends list by continent/country/city. Lat/lng based?
  - In friend list
  - Show friend icon instead of simple pin when it's not a cluster
  - Nice visualisations
- Have working on IE...
- Use events to connect sequences of lookups
- Settings panel to pick:
  - Show hometown/location/both
  - Show line from hometown to current home
  - Draw lines mutual friends
  - Get latest location from friends from check-ins
  - Show mutual friend connections
  - Heatmap layer of friend density
- Location+zoomLevel in the URL, so on reload you still have the same map
- Get some A/B tests working:
  - Clustering vs Not clustering
  - Different algorythms for displaying groups

### Bugs
- First click on side bar is in the ocean

### Promotion ideas
- Nice design
- Facebook Like and Share buttons
- Opengraph meta tags
- SEO
  - Title with keywords: friend, map, etc
- Get hosted domain
- Feedback submission, try uservoice

### Architecture
- Data structure
- Unit tests..
- Split into modules:
  - map handling
  - FB authentication handling
  - FB friend list loading logic
  - Friends map logic
- Or break into objects?
  - Friend object with method to lookup location
  - Facebook object
  - Map object with friend displaying power

### Optimize
- Try to parallelize geocoding / friend lookup
  - Webworkers? Awesome!
- Measure
- Try Here API geocoder vs Facebook and compare. FB fails to geocode 'Velikiy Novgorod, Novgorodskaya Oblast'

### jHERE contribution ideas
- Embed as sub-module
- implement zoomIn() and zoomOut()
- $.jHERE().originalMap returns the instance
- clustering support as plugin (now have hack to load JSLA using jsl.js?with=all)

Done tasks:
- ~~Login with Facebook so you don't need a manual API key~~
- ~~Bubble popup with info on friend~~
- ~~Make friend list at bottom zoom in on click~~
- ~~Show friends in circle around town~~
- ~~Spread randomly in circle for more natural feel~~
- ~~FIX: seem to be missing some friends compared to http://geographics.cz/socialMap/~~
- ~~Google Analytics to stalk users~~
- ~~Some map controls~~
- ~~Full screen map~~
- ~~Fix race condition "FB.getLoginStatus() called before calling FB.init()."~~ Think I got it with custom event
- ~~Deal with scroll-bar in firefox / no-bar in Chrome~~
- ~~+ and - key bindings for zooming~~
- ~~Cache city lookups~~
- ~~Only call once~~
- ~~Even cache in localstorage for ultraspeed?~~
- ~~Limit map moving and zooming to not out of screen~~
