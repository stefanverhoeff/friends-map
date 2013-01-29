(function() {
    "use strict";

    var limit = 1000;
    var friends = [];

    if (development) {
        limit = 25;
    }

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

            friends = response.data;
            callback && callback();
        });
    };

    var loadFriendsLocation = function () {
        friends.forEach(function (friend) {
            var location = friend.location || friend.hometown;

            if (location && location.name) {
                lookupFriendLocation(friend, location);
            }
        });
    };

    var lookupFriendLocation = function (friend, location) {
        // Lookup location lat/lng
        FB.api(location.id, function (response) {
            if (response.error) {
                console.log('Failed to lookup location', response.error);
                return;
            }

            friend.location = response;
            friend.location.position = [response.location.latitude, response.location.longitude];

            showFriendOnMap(friend);
        });
    };

    var showFriendOnMap = function (friend) {
        friend.profilePic = $("<img>")
            .attr('src', friend.picture.data.url)
            .attr('title', friend.name + ' - ' + location.name)
            .get();

        // Show list of friends on right hand side
        $('#friends').append(friend.profilePic);

        $('#mapContainer').jHERE('marker',
            friend.location.position,
            {
                icon: friend.picture.data.url,
                anchor: {x: 12, y: 32},
                click: function() {
                    showFriendBubble(friend);
                }
            });
    };

    var showFriendBubble = function (friend) {
        $('#mapContainer').jHERE('bubble',
            friend.location.position,
            {
                content: '<a href="https://www.facebook.com/' + friend.username + '" target="_blank">'+friend.name+'</a>' + ' says Hallo from ' + friend.location.name,
                closable: true,
                onclose: function() {}
            });
    };

    var loadPicturesDefaults = function () {
        loadFriends(function () {
            console.log("You have " + friends.length + " friends");
            loadFriendsLocation();
        });

        setTimeout(function () {
            console.log('Got ' + $('#friends img').length + ' friends on the map');
        }, 5000);
    };

    var loadMap = function () {
        $('#mapContainer').jHERE({
            enable: ['behavior', 'zoombar', 'scalebar', 'typeselector', 'positioning'],
            center: [35, 0],
            zoom: 2
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

    $('#go').click(function () {
        fbLogin(loadPicturesDefaults);
    });

    $(window).on('load', function() {
        loadMap();
    });

    $(document).bind('fbInit',function(){
        // If already authorized, show map right away
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                loadPicturesDefaults();
            }
        });
    });
})();