friends-map
===========

Map of facebook friends using jHere.

Running version:
http://stefanverhoeff.github.com/friends-map/

Generate a Facebook API key:
https://developers.facebook.com/tools/explorer

Todo
- Login with Facebook so you don't need a manual API key
- Bubble popup with info on friend
- Make friend list at bottom zoom in on click
- Pie menu for friends living in same town
- Get latest location from friends from checkins
- Show mutual friend connections
- FIX: seem to be missing some friends compared to http://geographics.cz/socialMap/
  - FQL has more data access? https://api.facebook.com/method/fql.query?query=SELECT%20uid,name,%20current_location,hometown_location%20FROM%20user%20WHERE%20uid=1046680821&format=JSON&access_token=...
- Heatmap layer of friend density