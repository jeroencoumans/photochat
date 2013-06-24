// usage: {{humane creation_date}}
Handlebars.registerHelper('humane', function(context) {
  return window.humaneDate ? humaneDate(context) : context;
});

var APP = (function () {

    var source   = $("#topic-wrapper").html();
    var template = Handlebars.compile(source);
    var content  = $("#chat-content");
    var s = skrollr.init();

    var login = function () {
        FB.login(null, {scope: 'user_photos,friends_photos'});
    }

    var logout = function () {
        FB.logout(function() {
            window.location.reload();
        });
    }

    var loader = (function () {

        var spinner = $("#page-loader");
        var status = false;

        return {
            show: function () {
                spinner.show();
                status = true;
            },

            hide: function () {
                spinner.hide();
                status = false;
            }
        }
    })();

    var loadPhotos = function (username) {

        username = username || $("#input-username").val() || "/me/";
        loader.show();

        FB.api(username, {fields: 'photos' }, function(response) {

            if (response.photos) {

                var html = template(response);
                content.html(html);
                s.refresh();
                window.scrollTo(0);

                loader.hide();

            } else {
                alert("This user doesn't have public photo's, try a different one");

                loader.hide();
            }
        });
    };

    var comments = (function () {

        var status = true;

        return {
            show: function () {

                $(".chat-message").css("visibility", "");
                status = true;
            },

            hide: function () {

                $(".chat-message").css("visibility", "hidden");
                status = false;
            },

            toggle: function () {

                if (status)
                    this.hide();
                else
                    this.show();
            }
        }
    })();

    return {

        init: function (response) {

            if (response.authResponse) {
                $("#btn-login").hide();
                $("#btn-logout").show();

                loadPhotos();

                $("body").on("click", ".topic", function (e) {

                    var target = $(e.currentTarget);

                    if (target.hasClass("topic")) {

                        comments.toggle();
                    }

                    return false;
                });

                $("body").on("click", ".action-photos", function (e) {

                    var target = $(e.currentTarget);

                    if (target.hasClass("action-photos")) {
                        var user = target.data("user-id").toString();

                        loadPhotos(user);
                    }

                    return false;
                });
            }
        },

        login: login,
        logout: logout,
        loadPhotos: loadPhotos,
        comments: comments
    }

})();

// initialise Facebook API
window.fbAsyncInit = function() {
    FB.init({
        appId      : '497899636895210', // App ID
        status     : true, // check login status
        cookie     : true // enable cookies to allow the server to access the session
    });

    FB.Event.subscribe('auth.statusChange', APP.init);
};

$("#btn-login").click(function () {
    APP.login();
});

$("#btn-logout").click(function () {
    APP.logout();
});
