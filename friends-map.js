(function () {
    "use strict";

    var limit = 9001;
    var map;
    var clusterProvider;
    var showClustering = window.location.href.indexOf('?cluster') > -1;
    var friendsInLocation;
    var locations = localStorage.locations && JSON.parse(localStorage.locations) || {};

//    if (development) {
//        limit = 25;
//    }

    var loadFriends = function (callback) {
        var fbRequestFriends =
            '/me/friends'
                + '?fields=name,username,picture,location,hometown'
                + '&limit=' + limit;

        $('#friends').empty();
        friendsInLocation = {};

        FB.api(fbRequestFriends, function (response) {
            if (response.error) {
                console.log('Failed finding friends', response.error);
                return;
            }

            $(document).trigger('friendsLoaded', response);
            callback && callback();
        });
    };

    var lookupFriendLocation = function (friend, location) {
        if (locations[location.id]) {
            if (locations[location.id].resolved) {
                // Location has already been looked up
                friend.location = $.extend(true, {}, locations[location.id]);
                $(document).trigger('friendLocated', friend);
            }
            else {
                // Location lookup request waiting to finish
                $(document).on('locationResolved', function (event, locationFound) {
                    if (locationFound.id === location.id) {
                        // Need to make a deep copy of the location,
                        // because it will be modified for each friend to avoid
                        // overlap
                        var locationCopy = $.extend(true, {}, locationFound);

                        friend.location = locationCopy;
                        $(document).trigger('friendLocated', friend);
                    }
                });
            }

            return;
        }

        locations[location.id] = {resolved: false};

        // Lookup location lat/lng
        var locationFields = 'id,name,location';
        FB.api(location.id + '?fields=' + locationFields, function (response) {
            if (response.error || !response.location) {
                console.log('Failed to lookup location', location, response.error);
                return;
            }

            var responseLocation = $.extend(true, {}, response);
            responseLocation.position = [responseLocation.location.latitude, responseLocation.location.longitude];
            responseLocation.resolved = true;

            friend.location = $.extend(true, {}, responseLocation);
            locations[location.id] = responseLocation;

            $(document).trigger('friendLocated', friend);
            $(document).trigger('locationResolved', responseLocation);
        });
    };

    // Calculate position at a distance from a given position and a angle. See:
    // http://www.movable-type.co.uk/scripts/latlong.html#destPoint
    var distanceFromPosition = function (position, distance, bearing) {
        var lat1 = toRad(position[0]),
            lon1 = toRad(position[1]),
        // Earth radius in km
            R = 6371,
            d = distance,
            brng = bearing;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) +
            Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
        var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
            Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

        return [toDeg(lat2), toDeg(lon2)];
    };

    var toRad = function (number) {
        return number * Math.PI / 180;
    };

    var toDeg = function (number) {
        return number * 180 / Math.PI;
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

        if (!showClustering) {
            // In case of multiple people in the same city,
            // Show them around the location
            var position = friend.location.position,
                friendsInTown = friendsInLocation[friend.location.id];

            if (friendsInTown > 1) {
                // Spread friends around in a circle if there
                // are multiple of them in the same town
                var circleAngle = friend.number * (Math.PI * 2 / friendsInTown),
                // Radius of the circle relative to the number of friends
                    distanceCircle = friendsInTown / 5,
                    distanceRandom = distanceCircle * Math.random(),
                    distanceSpiral = distanceCircle / friendsInTown * friend.number;
                position = distanceFromPosition(position, distanceRandom, circleAngle);
            }

            friend.location.position = position;

            map.jHERE('marker',
                position,
                {
                    icon: friend.picture.data.url,
                    anchor: {x: 25, y: 25},
                    click: function () {
                        showFriendBubble(friend);
                    }
                });

            // TODO: draw line from city center to friend
        }
        else {
            clusterProvider.add(friend.location.location);
        }

        $(document).trigger('friendOnMap', friend);
    };

    var showFriendBubble = function (friend) {
        var greeting;

        if (friend.lookupType === 'location') {
            greeting = 'lives in ' + friend.location.name;
        }
        else {
            greeting = 'grew up in ' + friend.location.name;
        }

        map.jHERE('bubble',
            friend.location.position,
            {
                content: '<a href="https://www.facebook.com/' + friend.username + '" target="_blank">' + friend.name + '</a> ' + greeting,
                closable: true,
                onclose: function () {
                }
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
                friend.lookupType = 'location';
                location = friend.location;
            }
            else {
                friend.lookupType = 'hometown';
                location = friend.hometown;
            }

            friend.lookupLocation = location;
            if (friendsInLocation[location.id]) {
                friendsInLocation[location.id]++;
            }
            else {
                friendsInLocation[location.id] = 1;
            }

            friend.number = friendsInLocation[location.id];
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
                if (jslaMap.pixelToGeo(0, 0).latitude >= 90 && jslaMap.zoomLevel > 1) {
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
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                // connected
                console.log('logged in now');
                successCallback && successCallback();
            } else {
                // not_logged_in or not_authorized
                console.log('user not authorized or not logged in, requesting auth');

                FB.login(function (response) {
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
            FB.getLoginStatus(function (response) {
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

        $(document).on('friendLocated', function (event, friend) {
            showFriendOnMap(friend);
        });

        // Create event for all friends loaded,
        // by counting the incoming ones
        var friendCount = 0;
        $(document).on('friendOnMap', function (event, friend) {
            friendCount++;
            if (friendCount === totalFriendCount) {
                $(document).trigger('allFriendsOnMap');
            }

            // TODO: timeout to trigger event anyway, in case of failure
            // TODO: handle any lookup failure and increase friend lookup count
        });

        if (showClustering) {
            $(document).on('allFriendsOnMap', function (event) {
                // Last friend is shown, start clustering
                clusterProvider.cluster();
            });
        }

        $(document).on('allFriendsOnMap', function (event) {
            // Cache looked up locations
            localStorage.locations = JSON.stringify(locations);
        });
    };

    $('#go').click(function () {
        fbLogin(loadFriends);
    });

    $(window).on('load', function () {
        loadMap();
    });

    setupWiring();

})();