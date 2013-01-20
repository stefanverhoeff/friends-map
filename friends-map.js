(function() {
    "use strict";

    var fbToken;
    var limit;

    var loadPictures = function (fbToken, limit) {
        var fbRequestFriends =
            'https://graph.facebook.com/me/friends'
            + '?fields=name,picture,location,address,hometown'
            + '&access_token=' + fbToken
            + '&limit=' + limit;

        $('#main').empty();

        $.ajax({
            url: fbRequestFriends,
            dataType: 'jsonp'
        })
        .done(function (response) {
            console.log("You have " + response.data.length + " friends");
            response.data.forEach(function (friend) {
                $("<img>").appendTo('#main')
                .attr('src', friend.picture.data.url);
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

    $('#go').click(function () {
        loadPicturesDefaults();
    });

    $('#limit').change(function () {
        $('#limit-value').text(this.value);
    });

    loadPicturesDefaults();
})();