friends-map
===========

Map of facebook friends using jHere.

Running version:
http://stefanverhoeff.github.com/friends-map/

Todo / ideas
- ~~Login with Facebook so you don't need a manual API key~~
- ~~Bubble popup with info on friend~~
- Bubble popup with extended info on friend
- Make friend list at bottom zoom in on click
- Pie menu for friends living in same town
- Get latest location from friends from check-ins
- Show mutual friend connections
- ~~FIX: seem to be missing some friends compared to http://geographics.cz/socialMap/ ~~
- Heatmap layer of friend density
- ~~Google Analytics to stalk users~~
- Loading progress indicator
- Bring user pic to front on hover, in case of overlap
- ~~Some map controls~~
- ~~Full screen map~~
- ~~Fix race condition "FB.getLoginStatus() called before calling FB.init()."~~ Think I got it with custom event
- Limit map moving and zooming to not out of screen
- Show read friend count instead of waiting with timeout
- Group friends list by continent/country/city. Lat/lng based?
  - Look into clustering in JSLA
- ~~Upgrade jHere~~
- Performance optimize
- Data structure
- Unit tests..
- Make hello greeting in language for each country (cute!)
- Show line from hometown to current home
- Have working on IE...
- Use events to connect sequences of lookups
- ~~Deal with scroll-bar in firefox / no-bar in Chrome~~
- Settings panel to pick:
  - Show hometown/location/both
  - Draw lines mutual friends
- ~~+ and - key bindings for zooming~~
- implement zoomIn() and zoomOut() and pull request to jHere
- Try Here API geocoder vs Facebook and compare. FB fails to geocode 'Velikiy Novgorod, Novgorodskaya Oblast'
- Try to parallelize geocoding / friend lookup
  - Webworkers? Awesome!
- Bring profile pic to front on map when clicked on in friends list whe multiple profile pics are overlaid
- Split into modules:
  - map handling
  - FB authentication handling
  - FB friend list loading logic
  - Friends map logic