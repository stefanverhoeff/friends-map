(function() {
    "use strict";

    var limit = 9001;
    var map;
    var clusterProvider;
    var showClustering = window.location.href.indexOf('?cluster') > -1;

//    if (development) {
//        limit = 25;
//    }

    var loadFriends = function (callback) {
        var fbRequestFriends =
            '/me/friends'
            + '?fields=name,username,picture,location,hometown'
            + '&limit=' + limit;

        $('#friends').empty();

        FB.api(fbRequestFriends, function(response) {
            if (response.error) {
                console.log('Failed finding friends', response.error);
                return;
            }

            $(document).trigger('friendsLoaded', response);
            callback && callback();
        });
    };

    var lookupFriendLocation = function (friend, location) {
        // Lookup location lat/lng
        FB.api(location.id, function (response) {
            if (response.error || ! response.location) {
                console.log('Failed to lookup location', location, response.error);
                return;
            }

            friend.location = response;
            friend.location.position = [response.location.latitude, response.location.longitude];

            // TODO: don't call directly but use event?
            showFriendOnMap(friend);
        });
    };

    var showFriendOnMap = function (friend) {
        friend.profilePic = $("<img>")
            .attr('src', friend.picture.data.url)
            .attr('title', friend.name + ' - ' + friend.location.name)
            .get();

        // Show list of friends on right hand side
        $('<a href="">')
            .append(friend.profilePic)
            .click(function (e) {
                map.jHERE('center', friend.location.position);
                map.jHERE('zoom', 12);

                e.preventDefault();
            })
            .appendTo('#friends');

        if (! showClustering) {
            map.jHERE('marker',
                friend.location.position,
                {
                    icon: friend.picture.data.url,
                    anchor: {x: 12, y: 32},
                    click: function() {
                        showFriendBubble(friend);
                    }
                });
        }
        else {
            clusterProvider.add(friend.location.location);
        }

        $(document).trigger('friendOnMap', friend);
    };

    var showFriendBubble = function (friend) {
        map.jHERE('bubble',
            friend.location.position,
            {
                content: '<a href="https://www.facebook.com/' + friend.username + '" target="_blank">'+friend.name+'</a>' + ' says Hallo from ' + friend.location.name,
                closable: true,
                onclose: function() {}
            });
    };

    var filterFriendsWithLocation = function (friendList) {
        console.log("You have " + friendList.length + " friends in total");

        // Filter out privacy conscious friends who don't share their location or hometown
        var hasLocation = function (friend) {
            return (friend.location && friend.location.id) || (friend.hometown && friend.hometown.id);
        };

        friendList = friendList.filter(hasLocation);

        console.log("You have " + friendList.length + " friends who share their location");

        friendList.forEach(function (friend) {
            var location = friend.location || friend.hometown;

            if (friend.location && friend.location.id) {
                location = friend.location;
            }
            else {
                location = friend.hometown;
            }

            friend.lookupLocation = location;
        });

        return friendList;
    };

    var loadMap = function () {
        var mapDiv = $('#mapContainer');
        map = mapDiv;

        map.jHERE({
            enable: ['behavior', 'zoombar', 'scalebar', 'typeselector', 'positioning'],
            center: [35, 0],
            zoom: 2
        });

        // Init clustering for friends living close together
        if (showClustering) {
            map.jHERE('originalMap', function (jslaMap) {
                clusterProvider = new nokia.maps.clustering.ClusterProvider(
                    jslaMap, {
                            eps: 16,
                            minPts: 1,
                            dataPoints: []
                        });
            });
        }

        // Ensure map doesn't get outside area in north and south
        map.jHERE('originalMap', function (jslaMap) {
            var mapNode = mapDiv.get(0);

            jslaMap.addObserver("center", function (obj, key, newValue, oldValue) {
                if (jslaMap.pixelToGeo(0,0).latitude >= 90 && jslaMap.zoomLevel > 1) {
                    jslaMap.pan(0, 0, 0, 1);
                }
                else if (jslaMap.pixelToGeo(0, mapNode.scrollHeight).latitude <= -90 && jslaMap.zoomLevel > 1) {
                    jslaMap.pan(0, 0, 0, -1);
                }
            });
        });

        // Keyboard controls for moving the map around
        $('body').keydown(function (e) {
            switch (e.which) {
                case 189: // minus
                case 173: // minus on Firefox (wtf?)
                    // Zoom out
                    map.jHERE('zoom', map.jHERE().zoom - 1);
                    break;
                case 187: // plus/equals (sits next to my minus, so convenient...)
                case 61: // plus/equals on Firefox
                    // Zoom in
                    map.jHERE('zoom', map.jHERE().zoom + 1);
                    break;
                case 37: // left arrow
                    map.jHERE('originalMap', function (map, here) {
                        map.pan(0, 0, -100, 0);
                    });
                    break;
                case 39: // right arrow
                    map.jHERE('originalMap', function (map, here) {
                        map.pan(0, 0, 100, 0);
                    });
                    break;
                case 38: // up arrow
                    map.jHERE('originalMap', function (map, here) {
                        map.pan(0, 0, 0, -100);
                    });
                    break;
                case 40: // down arrow
                    map.jHERE('originalMap', function (map, here) {
                        map.pan(0, 0, 0, 100);
                    });
                    break;
            }
        });
    };

    var fbLogin = function (successCallback) {
        // Check if logged in already
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                // connected
                console.log('logged in now');
                successCallback && successCallback();
            } else {
                // not_logged_in or not_authorized
                console.log('user not authorized or not logged in, requesting auth');

                FB.login(function(response) {
                    console.log('result of login', response);
                    if (response.authResponse) {
                        // connected
                        console.log('user now authorized');
                        successCallback && successCallback();
                    } else {
                        // cancelled
                        console.log('cancelled authorization');
                    }
                }, {scope: 'friends_location,friends_hometown'});
            }
        });
    };

    var setupWiring = function () {
        var totalFriendCount;

        $(document).on('fbInit', function () {
            // If already authorized, show map right away
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    loadFriends();
                }
            });
        });

        $(document).on('friendsLoaded', function (event, friendsResponse) {
            var friends = filterFriendsWithLocation(friendsResponse.data);
            totalFriendCount = friends.length;

            friends.forEach(function (friend) {
                lookupFriendLocation(friend, friend.lookupLocation);
            });
        });

        if (showClustering) {
            var friendCount = 0;
            $(document).on('friendOnMap', function (event, friend) {
                friendCount++;
                if (friendCount === totalFriendCount) {
                    // Last friend is shown, start clustering
                    clusterProvider.cluster();
                }
            });

            // TODO: timeout to call clustering anyway in case there is a lookup failure
            // TODO: handle any lookup failure and increase friend lookup count
        }
    };

    $('#go').click(function () {
        fbLogin(loadFriends);
    });

    $(window).on('load', function() {
        loadMap();
    });

    setupWiring();

})();