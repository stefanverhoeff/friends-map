(function() {
    "use strict";

    var fbToken;
    var fbLoggedIn = false;

    var loadPictures = function (fbToken) {
        if (! fbLoggedIn) {
            console.log('Not logged in, can\'t show friends');
            return;
        }

        var fbRequestFriends =
            '/me/friends'
            + '?fields=name,picture,location,hometown';
//            + '&access_token=' + fbToken;

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
        updateValues();

        loadPictures(fbToken);
    };

    var updateValues = function () {
        fbToken = $('#fb-token').val() || localStorage.fbToken;
        $('#fb-token').val(fbToken);
        localStorage.fbToken = fbToken;
    }

    var loadMap = function () {
        $('#mapContainer').jHERE({
            enable: ['behavior'],
            center: [40.664167, -3.838611],
            zoom: 2
        });
    };

    var fbLogin = function () {
        // Check if logged in already
        FB.getLoginStatus(function(response) {
            console.log('login status', response);

            if (response.status === 'connected') {
                // connected
                console.log('already logged in');
                fbLoggedIn = true;
            } else if (response.status === 'not_authorized') {
                // not_authorized
                console.log('user not authorized, requesting auth');

                FB.login(function(response) {
                    console.log('result of login', response);
                    if (response.authResponse) {
                        // connected
                        fbLoggedIn = true;
                    } else {
                        // cancelled
                    }
                });
            } else {
                // not_logged_in
                console.log('User not logged in. What to do?');
            }
        });
    };

    $('#go').click(function () {
        loadPicturesDefaults();
    });

    $('#login').click(function () {
        fbLogin();
    });

    $(window).on('load', function() {
        loadMap();
//        loadPicturesDefaults();
    });
})();