(function() {
    "use strict";

    var limit = 1000;

    if (development) {
//        limit = 25;
    }

    var loadPictures = function () {
        var fbRequestFriends =
            '/me/friends'
            + '?fields=name,picture,location,hometown'
            + '&limit=' + limit;

        $('#friends').empty();

        FB.api(fbRequestFriends, function(response) {
            if (response.error) {
                console.log('Failed finding friends', response.error);
                return;
            }

            console.log("You have " + response.data.length + " friends");
            response.data.forEach(function (friend) {
                var location = friend.location || friend.hometown;

                if (location && location.name) {
                    var profilePic = $("<img>")
                        .attr('src', friend.picture.data.url)
                        .attr('title', friend.name + ' - ' + location.name)
                        .get();

                    // Show list of friends below map
                    $('#friends').append(profilePic);

                    // Lookup location lat/lng
                    FB.api(location.id, function (response) {
                        if (response.error) {
                            console.log('Failed to lookup location', response.error);
                            return;
                        }

                        $('#mapContainer').jHERE('marker',
                            [response.location.latitude, response.location.longitude],
                                {
                                    icon: friend.picture.data.url,
                                    anchor: {x: 12, y: 32},
                                    click:  function(){
                                                alert(friend.name + ' says Hallo from ' + response.name + '!');
                                            }
                                    });
                        });
                }
            });
        });
    };

    var loadPicturesDefaults = function () {
        loadPictures();

        setTimeout(function () {
            console.log('Got ' + $('#friends img').length + ' friends on the map');
        }, 5000);
    };

    var loadMap = function () {
        $('#mapContainer').jHERE({
            enable: ['behavior', 'zoombar', 'scalebar', 'typeselector', 'positioning'],
            center: [0, 0],
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