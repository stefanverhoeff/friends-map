(function() {
    "use strict";

    var fbToken;
    var limit;

    var loadPictures = function (fbToken, limit) {
        var fbRequestFriends =
            'https://graph.facebook.com/me/friends'
            + '?fields=name,picture,location,hometown'
            + '&access_token=' + fbToken
            + '&limit=' + limit;

        $('#friends').empty();

        $.ajax({
            url: fbRequestFriends,
            dataType: 'jsonp'
        })
        .done(function (response) {
            console.log("You have " + response.data.length + " friends");
            response.data.forEach(function (friend) {
                var location = friend.location || friend.hometown;

                if (location && location.name) {
                    var profilePic = $("<img>")
                        .attr('src', friend.picture.data.url)
                        .attr('title', friend.name + ' - ' + location.name)
                        .get();

                    $('#friends').append(profilePic);
                }
            });
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log('Failed to find friends:', textStatus, errorThrown);
        });
    };

    var loadPicturesDefaults = function () {
        updateValues();

        loadPictures(fbToken, limit);
    };

    var updateValues = function () {
        fbToken = $('#fb-token').val() || localStorage.fbToken;
        limit = $('#limit').val() || localStorage.limit || 15;

        $('#limit').val(limit).change();
        $('#fb-token').val(fbToken);

        localStorage.fbToken = fbToken;
        localStorage.limit = limit;
    }

    var loadMap = function() {
        $('#mapContainer').jHERE({
            enable: ['behavior'],
            center: [40.664167, -3.838611],
            zoom: 3
        });
    };

    $('#go').click(function () {
        loadPicturesDefaults();
    });

    $('#limit').change(function () {
        $('#limit-value').text(this.value);
    });

    $(window).on('load', function() {
        loadMap();
        loadPicturesDefaults();
    });
})();