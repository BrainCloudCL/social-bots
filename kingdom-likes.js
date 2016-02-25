var util = (function () {

    function exec(macros, timeout) {
        var codeList = [
            //"SET !TIMEOUT_PAGE 15",
            "SET !ERRORIGNORE YES",
            "SET !TIMEOUT_TAG 2",
        ];
        if (macros instanceof Array) {
            for (item in macros) {
                codeList.push(macros[item]);
            }
        } else {
            codeList.push(macros);
        }
        var code = codeList.join("\n");

        iimPlay("CODE:" + code);
        return iimGetLastExtract();
    }

    var print = function (msg) {
        iimDisplay(msg);
    };

    return {
        exec: exec,
        print: print
    };
})();

var kingdomlikes = (function () {
    var id = 0;

    var checklogin = function (email) {
        // Cargar perfil
        util.exec("URL GOTO=http://kingdomlikes.com/users/profile");


        txt = util.exec("TAG POS=1 TYPE=FORM ATTR=ID:formlogin EXTRACT=TXT");
        if (txt != "#EANF#") {  // Esta el formulario de login?
            return false;   // Debe hacer login
        } else {
            // Busca el email dentro del perfil
            txt = util.exec("TAG POS=1 TYPE=INPUT ATTR=TYPE:email EXTRACT=TXT");
            if (txt != email) {   // Si los emails no concuerdan
                logout();   // Se sale del sistema
                return false;
            } else {
                // ya se encuentra logueado
                return true;
            }
        }
    };

    var logout = function () {
        util.exec("URL GOTO=http://kingdomlikes.com/logout");
    };

    var login = function (email, password) {
        if (checklogin(email) == false) {
            util.exec([
                "URL GOTO=http://kingdomlikes.com",
                "TAG POS=1 TYPE=INPUT ATTR=NAME:email CONTENT=" + email,
                "TAG POS=1 TYPE=INPUT ATTR=NAME:password CONTENT=" + password,
                "TAG POS=1 TYPE=INPUT ATTR=VALUE:Login"
            ]);
        }
    };


    var likes = {
        channels: [5, 6, 7, 8],
        run: function (codes) {
            var failed = 0;
            for (var i in this.channels) {
                if (this.isValidChannel(this.channels[i])) {
                    this.start(this.channels[i], codes);
                } else {
                    failed++;
                }
            }

            if (failed == this.channels.length) {
                util.exec("REFRESH");
            }
        },

        isValidChannel: function (id) {
            var htm = util.exec("TAG POS=1 TYPE=DIV ATTR=ID:idpage" + id + " EXTRACT=HTM");
            var regex = /No more free points on this network/;
            var test = regex.exec(htm);
            return test == null;
        },

        start: function (id, codes) {
            util.print("entro en channel-" + id);

            var macro = [];
            var head = [
                "TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:openWIndow('*',<SP>'idpage" + id + "')",
                "TAB T=2",
                "WAIT SECONDS=3"
            ];

            var bottom = [
                "WAIT SECONDS=3",
                "TAB CLOSE",
                "TAB T=1",
                "WAIT SECONDS=2",
                "TAG POS=1 TYPE=DIV ATTR=ID:idpage" + id + " EXTRACT=HTM"
            ];


            var code = macro.concat(head, codes, bottom);
            code = code.join("\n");


            str = util.exec(code);

            regex = /Something went wrong/;
            test = regex.exec(str);
            if (test !== null) {
                util.print('Something went wrong, skipping');
                util.exec([
                    "TAG POS=1 TYPE=A ATTR=ONCLICK:getPages('" + id + "',false);",
                    "WAIT SECONDS=3"
                ]);

            } else {
                regex = /You earn <span class="bluefont">(\d+) points/
                test = regex.exec(str);
                if (test !== null) {
                    util.print(test [1] + ' points');
                }
            }
        }
    };


    return {
        login: function (email, password) {
            login(email, password);
        },
        facebook: {
            postLike: function (loop) {
                util.exec([
                    "URL GOTO=http://kingdomlikes.com/free_points/facebook-post-likes",
                    "WAIT SECONDS=3"
                ]);
                var macro = [
                    "TAG POS=1 TYPE=A ATTR=data-testid:fb-ufi-likelink",
                    "TAG POS=1 TYPE=A ATTR=href:/a/like.php*"
                ];
                for (var i = 0; i < loop; i++) {
                    likes.run(macro);
                }
            }

        },
        youtube: {
            likes: function (loop) {
                util.exec([
                    "URL GOTO=http://kingdomlikes.com/free_points/youtube-likes",
                    "WAIT SECONDS=3"
                ]);
                var macro = [
                    "TAG POS=1 TYPE=SPAN ATTR=TXT:Mostrar<SP>>más",
                    "TAG POS=1 TYPE=BUTTON ATTR=CLASS:*like-button-renderer-like-button-unclicked*"
                ];
                for (var i = 0; i < loop; i++) {
                    likes.run(macro);
                }
            }
        }
    };
})();


kingdomlikes.login("your-email@gmail.com", "your-password");
kingdomlikes.youtube.likes(3); /// 3 ciclos
kingdomlikes.facebook.postLike(3);	// 3 ciclos

