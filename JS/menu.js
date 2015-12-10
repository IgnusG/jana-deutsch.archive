/* 
 * Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.
 * Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */
$(document).ready(function () {
    
    $(function () {
        var notif = {
            place: "<div class='placeholder'>" + TXT[system.lang].gen.notif.place + "</div>",
            msg: "<div class='notif message lonely'><div><div class='header'><div class='mainText'>" + TXT[system.lang].gen.notif.newMsg + "<span class='name'></span></div><div class='date'></div></div><div class='contentContainer'><span class='msg'></span></div><div class='dots'>...</div></div></div>",
            profile: "<div class='notif profil'><div><div class='header'><div class='mainText'>" + TXT[system.lang].gen.notif.profile[0] + "</div><div class='date'></div></div><div class='contentContainer'><span class='msg'>" + TXT[system.lang].gen.notif.profile[1] + "</span></div></div></div>",
            msgs: "<div class='notif message multi'><div><div class='header'><div class='mainText'><span class='count'></span>" + TXT[system.lang].gen.notif.newMsgs + "<span class='name'></span></div></div><div class='contentContainer'><span class='msg'>" + TXT[system.lang].gen.notif.last[0] + "<span class='count'></span> <span class='timeunit'></span>" + TXT[system.lang].gen.notif.last[1] + "<span class='date'></span></span></div></div></div>",
            upload: "<div class='notif upload'><div><div class='header'><div class='mainText'>" + TXT[system.lang].gen.notif.upload + "</div><div class='date'></div></div><div class='contentContainer'><div class='file'></div><div class='progressContainer'><div class='bar'></div></div><span class='percentContainer'><span class='percent'></span>%</span></div></div></div>",
            bill: "<div class='notif bill'><div><div class='header'><div class='mainText'><span class='count'></span>" + TXT[system.lang].gen.notif.payHead + "</div><div class='date'></div></div><div class='contentContainer'><span>" + TXT[system.lang].gen.notif.payContent[0] + "<span class='name'></span>" + TXT[system.lang].gen.notif.payContent[1] + "<span class='date'></span> (<span class='count'></span>" + TXT[system.lang].gen.notif.payContent[2] + "</span></div></div></div>"
        };

        var $bar = $("#sidebar"),
            $logout = $bar.find("#logout"),
            $title = $bar.find(".title"),
            $hello = $bar.find(".hello"),
            $again = $bar.find(".tryAgain"),
            $notifText = $bar.find(".youDidIt"),
            $center = $bar.find("#notifCentre > div"),
            $credits = $bar.find("#credits"),
            $version = $bar.find("#version");

        $credits.note(TXT[system.lang].gen.notes.like, {maxWidth: 250, cornerPos: "left"});
        $("#contact").note(TXT[system.lang].gen.notes.help, {maxWidth: 200});

        $bar.attr("data-open", false);

        // Data like course informations etc.
        var serverData;

        var recovery = false,
            request = false,
            //autoclose = false,
            closingWarning = false,
            easter = 0,
            inputText = "",
            version = "V " + system.build.split("/")[2];

        $version.text(version);

        greet($hello);

        $again.text(TXT[system.lang].gen.title.tryAgain);
        $notifText.text(TXT[system.lang].gen.title.notifCentre);

        // Populate variables
        var $menu = $("#upperMenu"),
            $settingsButton = $menu.find(".settings");

        var $info = $("#pInfo"),
            $loginContainer = $info.find(".login"),
            $loggedContainer = $info.find(".logged"),
            $logoutContainer = $info.find(".logout"),
            $fake = $info.find(".fake"),
            $login = $info.find(".loginText"),
            $recovery = $info.find(".recoveryText"),
            $username = $info.find(".login .username"),
            $password = $info.find(".login .password"),
            $submit = $info.find("#submit"),
            $wrong = $info.find(".wrong");

        $loginContainer.attr("data-status", 1990);

        var $verify = $info.find(".verify"),
            $accept = $info.find(".accept"),
            $failed = $info.find(".fail"),
            $lost = $info.find(".lost");

        var swatchObj = [
            $bar,
            $("#warn")
        ];

        $username.attr("placeholder", TXT[system.lang].gen.login.user);
        $password.attr("placeholder", TXT[system.lang].gen.login.pass);

        $loggedContainer.find(".usernameText").text(TXT[system.lang].gen.logged);
        $loggedContainer.find(".dateText").text(TXT[system.lang].gen.date);


        $wrong.text(TXT[system.lang].gen.login.wrong);
        $submit.text(TXT[system.lang].gen.login.submit);

        $bar.find(".usernameText").text(TXT[system.lang].gen.logged);
        $bar.find(".dateText").text(TXT[system.lang].gen.date);

        $center.append(notif.place);

        function openRecovery() {
            recovery = true;
            $lost.css("opacity", "").delay(300).hide(0);

            $verify.transform("")
                    .css("opacity", "");
            $failed.transform("")
                    .css("opacity", "");

            $hello.css("opacity", "0");
            $again.transform("");

            $title.css("height", "0px");

            $password.val("");
            $username.val("");

            $wrong.transform("translateY(-" + ($wrong.height() + 10) + "px)");
            $submit.css("top", "");

            setTimeout(function () {
                $wrong.text(TXT[system.lang].gen.login.wrongEmail);
            }, 510);

            setTimeout(function () {
                $login.transform("translateX(-125px)");
                setTimeout(function () {
                    $fake.text("Recovery");
                    $recovery.transform("translateX(0)");
                }, 300);
            }, 500);

            $password.transform("translateY(-42px)");
            $password.parent().css("height", "0px");

            $username.attr("placeholder", "E-mail");
            $username.focus();
        }

        function closeRecovery() {
            recovery = false;

            $verify.transform("")
                    .css("opacity", "");
            $failed.transform("")
                    .css("opacity", "");

            $hello.css("opacity", "");
            $title.css("height", "");

            $wrong.transform("translateY(-" + ($wrong.height() + 10) + "px)");
            $submit.css("top", "");

            setTimeout(function () {
                $wrong.text(TXT[system.lang].gen.login.wrong);
            }, 510);

            setTimeout(function () {
                $recovery.transform("translateX(-125px)");
                setTimeout(function () {
                    $fake.text("Login");
                    $login.transform("translateX(0)");
                }, 300);
            }, 500);

            $password.transform("");
            $password.parent().css("height", "");

            $username.attr("placeholder", TXT[system.lang].gen.login.user);
            $username.val("");
        }

        function getRealSetting(id) {
            var value;

            for (var i = 0; i < currentUser.settings.length; i++) {
                if (id == currentUser.settings[i].id) {
                    value = currentUser.settings[i].value;
                    break;
                }
                if (i == currentUser.settings.length - 1)
                    console.error("This setting is invalid!");
            }
            var matched = value.match(/(password|username|name|email)/i);

            if (matched != null) {
                value = currentUser[matched[0]];
            }

            return (value === "true") ? true : (value === "false") ? false : value;
        }

        function saveRealSetting(id, value) {
            var i, originalValue;
            for (i = 0; i < currentUser.settings.length; i++) {
                if (id == currentUser.settings[i].id) {
                    originalValue = currentUser.settings[i].value;
                    break;
                }
                if (i == currentUser.settings.length - 1)
                    return false;
            }
            var matched = originalValue.match(/(password|username|name|email)/i);

            if (matched != null) {
                currentUser[matched[0]] = value;
            } else {
                currentUser.settings[i] = value;
            }

            return true;
        }

        function initSettings() {

            var settings = {
                main: "<div class='hide' id='settings'><div class='head'><div class='closeIcon'><div></div><div></div></div><span>" + TXT[system.lang].gen.settings.gen + "</span></div><div class='mainContainer'><div><div class='pushDown mid'>" + TXT[system.lang].gen.settings.personal + "</div><form class='personal'></form></div><div><div class='pushDown mid'>" + TXT[system.lang].gen.settings.general + "</div><form class='general'></form><div class='mid pushDown'>" + TXT[system.lang].gen.settings.allowence + "</div><div class='clear lower pushDown'></div></div></div><div class='saveButton center-horiz'><span class='centerText-vert center-horiz unselectable'>" + TXT[system.lang].gen.settings.save + "</span></div><div class='build'></div><div class='systemOutage'></div><a href='https://www.google.com/chrome/browser/#eula' target='Download Chrome' class='chrome'>This Website is designed for Chrome</a></div>",
                input: "<div class='formContainer'><div class='text'></div><div class='inputContainer'><input class='text' placeholder='placeholder'><div class='loader2'></div><div class='closeIconContainer'><div class='closeIcon'><div></div><div></div></div></div></div><div class='warning wrong'></div><div class='warning disclaimer'></div></div>",
                choice: "<div class='formContainer'><span class='unselectable text'>Text</span><div class='choice'></div><div class='warning wrong'></div><div class='warning disclaimer'></div></div>",
                maintenance: "<div class='systemOutage show'><div style='font-size: 1.2em;color: rgb(249, 174, 13);margin-bottom: 5px;'>System Maintenance</div><div>Diese Webseite wird am <span style='color: rgb(249, 174, 13);'>22.9.2014</span> von <span style='font-size: 1.2em;'>18:30</span> bis <span style='font-size: 1.2em;'>22:00</span> offline sein!</div></div>"
            };

            $("#sidebar").after(settings.main);

            var $settings = $("#settings"),
                $close = $settings.find(".head .closeIcon"),
                $build = $settings.find(".build"),
                $save = $settings.children(".saveButton");
        
            // Timers for input
            var globalTimer, globalTimer2, stopShowWarning;
            // Timers for choice
            var globalTimer3, stopHideDisclaimer = false;

            $build.text("Build: " + system.build);
            
            function showWarning($el, msg){
                if($el.css("opacity") != "1"){
                    if(msg != null) $el.text(msg);
                    $el.css("height","auto");
                    var newHeight = $el.height();
                    if($el.siblings(".disclaimer").css("opacity")==1) newHeight+= 5;
                    
                    $el.css("height","");

                    setTimeout(function(){
                        if(!stopShowWarning)
                            $el.css({"opacity":"1","height":newHeight+"px"});
                    },100);
                } else if($el.text()!= msg && typeof msg != "undefined"){

                    $el.css("opacity","0");
                    var originalMsg = $el.text();
                    var originalHeight = $el.height();

                    $el.text(msg);
                    $el.css("height","auto");
                    var newHeight = $el.height();

                    $el.text(originalMsg);
                    $el.css("height",originalHeight+"px");
                    setTimeout(function(){
                        if(!stopShowWarning){
                            $el.text(msg);
                            $el.css({"height":newHeight+"px","opacity":"1"});
                        }
                    },310);
                }
            }
            
            function hideWarning($el, isWarning){
                $el.css({"opacity":"","height":""});
                if($el.siblings(".wrong").css("opacity")==1){
                    var height = $el.siblings(".wrong").css("height");
                    $el.siblings(".wrong").css("height", height-5+"px");
                }
            }
            
            if(currentUser.settings.constructor != Array){
                currentUser.settings = [{id:0,value:"username"},{id:1,value:"password"},{id:2, value: "name"},{id:3, value: "email"}];
            }

            for (var i = 0; i < system.availableSettings.length; i++) {

                var setting = system.availableSettings[i],
                    $target = $settings.find("." + setting.target);
            
                if(setting.id > 3){
                    currentUser.settings.push({id:setting.id,value:""});
                }

                $target.append(settings[setting.type]);

                var $setting = $target.children(".formContainer:last-child");
                var $el = $setting.find("input, .choice");

                $setting.attr("data-id", setting.id);
                $setting.children(".text").text(setting.info);
                
                if(typeof setting.placeholder == "undefined"){
                    if(setting.mandatory)
                        $setting.find("input").attr("placeholder",TXT[system.lang].gen.settings.noEmpty);
                    else
                        $setting.find("input").attr("placeholder",setting.info);
                } else {
                    $setting.find("input").attr("placeholder", setting.placeholder);
                }

                if (setting.hide === true)
                    $el.attr("type", "password");

                var value = getRealSetting(setting.id);

                if (typeof value != "boolean") {
                    if (value != "undefined") {
                        $el.attr("value", value);
                        $el.addClass("oldInfo");
                    } else {
                        $el.addClass("newInfo");
                    }
                } else {
                    var disclaimer;
                    if (value){
                        $el.addClass("toggled");
                        disclaimer = setting.state.on;
                    } else {
                        disclaimer = setting.state.off;
                    }
                    $setting.find(".disclaimer").text(disclaimer);
                }
            }

            $close.on("click", function () {
                closeSettings(false);
            });

            $(document).on("click.settings", function (event) {
                if ((!$(event.target).closest("#settings").length)&&(!$(event.target).closest("#warn").length)) {
                    closeSettings(true);
                }
            });

            $settings.on("click", ".choice", function () {
                var $setting = $(this),
                    setting, 
                    id = $setting.closest(".formContainer").attr("data-id"),
                    $warning = $setting.parent().find(".warning.disclaimer");
                
                $setting.toggleClass("toggled");
                
                for(var i = 0; i < system.availableSettings.length; i++){
                    if(id == system.availableSettings[i].id){
                        setting = system.availableSettings[i];
                    }
                }
                
                clearTimeout(globalTimer3);
                stopHideDisclaimer = true;
                
                if($setting.hasClass("toggled")&&(typeof setting.state.on != "undefined")){
                    showWarning($warning, setting.state.on);
                } else if(typeof setting.state.off != "undefined"){
                    showWarning($warning, setting.state.off);
                }
                
                globalTimer3 = setTimeout(function () {
                    hideWarning($warning);
                    stopHideDisclaimer = false;
                }, 6000);
            });
            
            $setting.on("mouseenter", ".choice", function(){
                if(!stopHideDisclaimer){
                    var $warning = $(this).parent().find(".warning.disclaimer");
                    clearTimeout(globalTimer3);
                    
                    globalTimer3 = setTimeout(function(){
                        showWarning($warning);
                    },500);
                }
            })      .on("mouseleave", ".choice", function(){
                if(!stopHideDisclaimer){
                    var $warning = $(this).parent().find(".warning.disclaimer");
                    clearTimeout(globalTimer3);
                    
                    globalTimer3 = setTimeout(function(){
                        hideWarning($warning);
                    },1000);
                }
            });

            $settings.on("focus", "input", function () {
                var $setting = $(this);

                var id = $setting.closest(".formContainer").attr("data-id"),
                    pattern, mandatory,
                    $cancelInput = $setting.closest(".formContainer").find(".closeIcon"),
                    $loader = $setting.siblings(".loader2"),
                    $warning = $setting.closest(".formContainer").find(".warning.wrong"),
                    $warningInfo = $setting.closest(".formContainer").find(".warning.disclaimer");

                $cancelInput.parent().addClass("show");

                for (var i = 0; i < system.availableSettings.length; i++) {
                    //console.log(system.availableSettings[i].id+" and "+id);
                    if (system.availableSettings[i].id == id) {
                        //console.log(system.availableSettings[i].pattern);
                        pattern = (typeof system.availableSettings[i].pattern == "undefined") ? false : system.availableSettings[i].pattern;
                        mandatory = (typeof system.availableSettings[i].mandatory == "undefined") ? false : system.availableSettings[i].mandatory;
                    }
                }

                $cancelInput.one("click", function () {
                    $setting.val(getRealSetting(id));
                    $setting.removeClass("notRight");
                    $setting.removeClass("available");
                    $setting.removeClass("unavailable");
                    hideWarning($warningInfo);
                    hideWarning($warning, true);
                });

                if (pattern != false) {
                    $setting.on("keyup", function () {
                        
                        if(id == 0){
                            $setting.removeClass("available");
                            $setting.removeClass("unavailable");
                            hideWarning($warningInfo);
                            clearTimeout(globalTimer2);
                        }
                        $loader.css("opacity","");
                        
                        if((!mandatory&&$setting.val().length)||(mandatory)){
                            clearTimeout(globalTimer);
                            stopShowWarning = true;
                            
                            globalTimer = setTimeout(function(){
                                stopShowWarning = false;
                                
                                if (pattern.constructor == Array) { // check for array
                                    for (var l = 0; l < pattern.length; l++) {
                                        
                                        if (!pattern[l].patt.test($setting.val())) {
                                            $setting.addClass("notRight");
                                            showWarning($warning, pattern[l].text);
                                            
                                            $setting.removeClass("available");
                                            hideWarning($warningInfo);
                                            break;
                                        }
                                        if(l == pattern.length-1){
                                            $setting.removeClass("notRight");
                                            hideWarning($warning);
                                        }
                                    }
                                } else {
                                    if (!pattern.patt.test($setting.val())) {
                                        $setting.addClass("notRight");
                                        showWarning($warning, pattern.text);
                                    } else {
                                        $setting.removeClass("notRight");
                                        hideWarning($warning);
                                    }
                                }
                                
                                if((id == 0) && ($setting.val()==getRealSetting(id))){
                                    $setting.removeClass("available");
                                    $setting.removeClass("unavailable");
                                    hideWarning($warningInfo);
                                } else if ((id == 0)&&(!$setting.hasClass("notRight"))) {
                                    
                                    globalTimer2 = setTimeout(function () {
                                        $.ajax({
                                            type: "POST",
                                            cache: false,
                                            url: "PHP/username.php",
                                            data: {"username":$setting.val()},
                                            beforeSend: function(){
                                                $loader.css("opacity","1");
                                            },
                                            xhr: function(){
                                            // get the native XmlHttpRequest object
                                                var xhr = $.ajaxSettings.xhr();
                                                // set the onprogress event handler
                                                xhr.upload.onprogress = function(evt){ 
                                                    $loader.css("width",(evt.loaded / evt.total * 100)+"%");
                                                };
                                                xhr.upload.onload = function(){
                                                    $loader.css("opacity","");
                                                };
                                                // return the customized object
                                                return xhr;
                                            },
                                            success: function (data) {
                                                //console.log("Username comparing: Server Response: "+data);
                                                // Save the timer to globalTimer 2 so in case of user input, we disable the already late response
                                                if (data == false) {
                                                    globalTimer2 = setTimeout(function(){
                                                        $setting.removeClass("unavailable");
                                                        $setting.addClass("available");

                                                        showWarning($warningInfo, TXT[system.lang].gen.settings.username);
                                                    },50);
                                                } else {
                                                    globalTimer2 = setTimeout(function(){
                                                        $setting.addClass("unavailable");
                                                        showWarning($warningInfo, TXT[system.lang].gen.settings.noUsername);
                                                    },50);
                                                }
                                            },
                                            error: function(){
                                                showWarning($warning, TXT[system.lang].gen.disconnectError[0]);
                                                hideWarning($warningInfo);
                                                $setting.addClass("notRight");
                                                error(TXT[system.lang].gen.error);
                                            }
                                        });
                                    }, 1000);
                                }
                            },200);
                        } else {
                            setTimeout(function(){
                                $setting.removeClass("notRight");
                                hideWarning($warning);
                            },500);
                        }
                    });
                }

                $setting.one("blur", function () {
                    setTimeout(function () {
                        $cancelInput.parent().removeClass("show");
                        $setting.off("keydown");
                        
                        if(!$setting.hasClass("unavailable")){
                            var $warningInfo = $setting.closest(".formContainer").find(".warning.disclaimer");
                            
                            hideWarning($warningInfo);
                            $setting.removeClass("available");
                        }
                        
                        // Some kind of late response protection. I've forgotten what for...
                        setTimeout(function(){
                            if(!$setting.hasClass("unavailable")){
                                var $warningInfo = $setting.closest(".formContainer").find(".warning.disclaimer");

                                hideWarning($warningInfo);
                                $setting.removeClass("available");
                            }
                        },2500);

                        setTimeout(function () {
                            $cancelInput.off("click");
                        }, 200);
                    }, 50);
                });
            });

            $save.on("click", function () {
                switch(saveSettings()){
                    case true:
                        if (propagateSettings()) {
                            setTimeout(function () {
                                closeSettings(true);
                            }, 500);
                        }
                        break;
                    case false: break;
                    case -1: 
                        error("[Placeholder TEXT] Still not right. Bad input marked Red!");
                }
            });
        }

        function saveSettings(save) {
            var $allSettings = $("#settings .formContainer"),
                    out = 0;

            save = (typeof save == "undefined") ? true : save;

            $allSettings.each(function () {
                var $setting = $(this),
                    id = $setting.attr("data-id") * 1;

                var value = $setting.val();

                var $el = $setting.find("input, .choice");

                if ($setting.find("input").length > 0)
                    if ($el.hasClass("notRight")||$el.hasClass("unavailable")) {
                        out = -1;
                        console.error("Settings: Values still marked as incorrect!");
                        return;
                    }

                var originalValue = getRealSetting(id);

                if (value !== originalValue) {
                    if (save) {
                        saveRealSetting(id, value);
                    } else {
                        if(out != -1)
                            out++;
                    }
                }
            });
            
            if(save){
                // Upload Settings
                $.ajax({

                });
            }
            
            if(out < 0) return -1;
            return (out > 0) ? true : false;
        }

        function closeSettings(closeMenu) {
            
            var $settings = $("#settings");
            
            function initClose() {
                if ($settings.hasClass("show")) {
                    $settings.removeClass("show");
                    if (closeMenu)
                        closeSidebar();
                    setTimeout(function () {
                        $settings.addClass("hide");
                    }, 400);
                }
            }
            
            if($("#settings").hasClass("show")){
                switch(saveSettings(false)){
                    case true:
                        warn({message: "Do you realy want to throw away changes?", textConfirm: "No", textCancel: "Yes", confirm: true});
                        $("#warn").one("selected", function (event, choice) {
                            if (!choice)
                                initClose();
                        });
                        break;
                    case false:
                        initClose();
                        break;
                    case -1:
                        error("[Placeholder TEXT] Still not right. Bad input marked Red!");
                }
            }
        }

        function openSettings() {
            var $settingsCont = $("#settings");

            if (!$settingsCont.length)
                initSettings();

            $settingsCont = $("#settings");
            $settingsCont.removeClass("hide");
            setTimeout(function () {
                if (!$settingsCont.hasClass("show")) {
                    $settingsCont.addClass("show");
                }
            }, 100);
        }

        function openSidebar() {
            if (_enableAnimation.main) {
                if ($bar.attr("data-open") == "false") {
                    _enableAnimation.main = false;

                    /*if(system.browser != "webkit"){console.log("This effect works only in chrome .. please consider upgrading your browser")}
                     $("header, #menu, #content, footer").css("-webkit-filter","blur(3px)");*/

                    $wrong.transition("none")
                            .transform("translateY(-" + ($wrong.height() + 10) + "px)")
                            .transition("", true);

                    $bar.transform("translateX(0)");

                    setTimeout(function () {
                        $bar.attr("data-open", true);

                        $(document).on("click.sidebar", function (event) {
                            if ((!$(event.target).closest("#sidebar").length) && (!$(event.target).closest("#settings").length) && (!$(event.target).is("#menu")) && (!$(event.target).closest("#warn").length)) {
                                closeSidebar();
                            } else {
                                //autoclose = false;
                            }
                        });
                    }, 1);

                    /*$bar.one("transitionend", function() {
                     _enableAnimation.main = true;
                     });*/
                    setTimeout(function () {
                        _enableAnimation.main = true;
                    }, 550);
                }
                if (!system.logged) {
                    $username.focus();
                }
            }
        }

        function closeSidebar() {
            if (($bar.attr("data-open") == "true") && (_enableAnimation.main)) {
                _enableAnimation.main = false;
                $bar.attr("data-open", false)
                        .transform("");

                $("header, #menu, #content, footer").css("-webkit-filter", "");

                if (!system.logged) {
                    $hello.css("opacity", "");
                    $again.transform("");

                    $lost.css("opacity", "0");
                    $wrong.transform("translateY(-" + ($wrong.height() + 10) + "px)");
                    $submit.css("top", "");
                }

                if ((!system.logged) && (recovery)) {
                    closeRecovery();
                }

                /*$bar.one("transitionend", function() {
                 _enableAnimation.main = true;
                 });*/
                setTimeout(function () {
                    _enableAnimation.main = true;
                }, 550);

                $(document).off("click.sidebar");
            }
        }

        function addNotification() {

        }

        function scanNotificationList() {
            var timeout = 1000;

            if (!request) {
                getNotificationsFromServer();
            }

            setTimeout(function () {
                if (system.logged) {
                    scanNotificationList();
                }
            }, timeout);
        }

        function closeNotification() {

        }

        function showNotifications() {

            $center.parent().css("height", "auto");
            $center.transition("");
            $center.css("opacity", "");

            var height = $center.parent().height();

            $center.parent().css("height", "");
            setTimeout(function () {
                $center.parent().css("height", height + "px");
                setTimeout(function () {
                    $center.find(".placeholder").css("opacity", "0.6");
                }, 500);
            }, 100);

            function showThis($el, i) {
                $el.eq(i).transform("translateX(0)");
                setTimeout(function () {
                    showThis($el, i + 1);
                }, 50);
            }

            showThis($center.find(".notif"), 0);
        }

        function hideNotifications(fadeout) {

            if (fadeout === true) {
                $center.transition("opacity 0.4s");
                $center.css("opacity", "0");
                
                // Prepare for reinitiation
                $center.find(".placeholder").css("opacity", "");
                setTimeout(function(){
                    $center.parent().css("height", "");
                },300);
                return true;
            }

            $center.find(".placeholder").css("opacity", "");
            $center.parent().css("height", "");

            function hideThis($el, i) {
                $el.eq(i).transform("");
                setTimeout(function () {
                    hideThis($el, i + 1);
                }, 50);
            }

            hideThis($center.find(".notif"), 0);
        }

        function getNotificationsFromServer() {
            request = true;

            $.ajax({
                type: "GET",
                data: "?",
                cache: false,
                url: "PHP/scanForNotifications.php",
                success: function (data) {
                    request = false;
                    if (data == false) {
                        warn({message: "You don't seem to be logged in?", rush: true});
                        console.error("Error 8: Unauthorized server request detected");

                        sendErrorReport();
                    }

                },
                error: function (a, errorText) {
                    request = false;
                    console.error("Error 5: Server responded with an error: ");
                }
            });
        }

        function saveLocalContent() {
            $(document).trigger("saveData");

            $(document).one("readyForUpload", function () {
                uploadData();
                //openSidebar();
            });

            timer.uploading = setTimeout(function () {
                $(document).trigger("readyForUpload");
            }, 3000);
        }

        function uploadData() {
            if (request) {
                return false;
            }
            
            function uploadFailed(errorText){
                errorText = (typeof errorText == "undefined") ? "Not Specified" : errorText;
                
                error(TXT[system.lang].gen.uploadError);
                console.error("Error 3: Server responded with an error: " + errorText);

                sendErrorReport();

                $logout.show(0)
                        .transform("translateY(0)")
                        .removeClass("hidden");

                $loggedContainer.transform("translateX(0)");
                $logoutContainer.transform("");

                $notifText.transform("translateX(0)");
                setTimeout(function(){
                    showNotifications();
                },500);
                
                $menu.show();
                setTimeout(function () {
                    $menu.addClass("shown");
                }, 10);
            }

            request = true;

            for (var i = 0; i < user.length; i++) {
                if (user[i].password != "") {
                    user[i].password = hex_sha512(user[i].password);
                }
            }

            var data_sending = {
                course: course,
                user: user,
                currentUser: currentUser
            };

            var intern_data = {
                data_sending: JSON.stringify(data_sending)
            };

            //console.log("DATA SENT: "+intern_data.data_sending);

            $.ajax({
                type: "POST",
                cache: false,
                url: "PHP/upload.php",
                data: intern_data,
                success: function (data) {
                    request = false;
                    if(data == true){

                        disconnectSecureSession();

                        $loggedContainer.find(".username").text("");
                    } else {
                        console.error("Server connection succesfull. Server denied access!\n"+data);
                        request = false;
                        uploadFailed();
                    }
                },
                error: function (a, errorText, b) {
                    request = false;
                    uploadFailed(errorText);
                }
            });
        }

        function disconnectSecureSession() {
            if (request) {
                return false;
            }

            course = [];
            user = [];
            currentUser = {};

            request = true;

            $.ajax({
                type: "GET",
                cache: false,
                url: "PHP/logout.php",
                success: function (data) {
                    if(data == true){
                        console.log("DISCONNECTED");
                        request = false;
                    } else {
                        error(TXT[system.lang].gen.error);
                        console.error("Error 3: Server responded with an error: " + errorText);

                        sendErrorReport();
                    }
                },
                error: function (a, errorText, b) {
                    error(TXT[system.lang].gen.error);
                    console.error("Error 3: Server responded with an error: " + errorText);

                    sendErrorReport();
                },
                complete: function () {
                    setTimeout(function () {
                        completeLogout();
                    }, 1000);
                }
            });
        }

        // Again only animations!
        function completeLogout() {
            $hello.css("opacity", "");
            $again.css("opacity", "");

            system.logged = false;
            showCredits();
            $("body").attr("data-logged", "false");

            $logoutContainer.transform("translateX(300px)");
            $loginContainer.transform("");

            setTimeout(function () {
                $logoutContainer.transition("none");
                $logoutContainer.transform("");
                $logoutContainer.transition("", true);
                location.reload();
            }, 500);

            $(document).trigger("loggedOut");
        }

        function logout() {
            function _logout() {
                /*setTimeout(function() {
                 autoclose = true;
                 }, 1);*/

                hideNotifications(true);

                $menu.removeClass("shown").delay(400).hide(0);
                
                $logout.transform("")
                        .addClass("hidden")
                        .delay(510)
                        .hide(0);

                $loggedContainer.transform("");
                $logoutContainer.transform("translateX(0)");

                $notifText.transform("");

                saveLocalContent();
            }

            if (_enableAnimation.main) {
                _logout();
            } else if (typeof _enableAnimation.main == "number") {
                warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: _logout});
            }
        }

        function loggedIn() {

            var username = currentUser.name;

            console.log("LOG 1: User " + username + " logged in");

            $accept.transform("")
                    .css("opacity", "");

            $credits.note(false);

            setTimeout(function () {
                $username.val("");
                $password.val("");
            }, 500);
            
            $menu.show();
            setTimeout(function(){
                $menu.addClass("shown");
            },10);
            
            $("body").attr("data-logged", "true");

            $loggedContainer.find(".username").text(username);

            $loginContainer.transform("translateX(-300px)");
            $loggedContainer.transform("translateX(0)");

            $logout.show(0)
                    .transform("translateY(0)")
                    .removeClass("hidden");

            /*$loginContainer.one("transitionend", function(){
             $notifText.transform("translateX(0)");
             setTimeout(function(){
             showNotifications();
             },500);
             });*/
            setTimeout(function () {
                $notifText.transform("translateX(0)");
                setTimeout(function () {
                    showNotifications();
                }, 500);
            }, 550);

            $(document).trigger("logged");

            hideCredits();
        }

        // Next 3 functions only visual
        function verifyLoginApproval() {
            $loginContainer.attr("data-status", 0);

            $failed.transform("")
                    .css("opacity", "");
            setTimeout(function () {
                $verify.transform("translateX(0)")
                        .css("opacity", 1);
            }, 300);

            $wrong.transform("translateY(-" + ($wrong.height() + 10) + "px)");
            $submit.css("top", "");

            $lost.css("opacity", "").delay(300).hide(0);
        }

        function denyLoginApproval() {
            $loginContainer.attr("data-status", -1);

            setTimeout(function () {
                $verify.transform("")
                        .css("opacity", "");
                setTimeout(function () {
                    $failed.transform("translateX(0)")
                            .css("opacity", 1);

                    setTimeout(function () {
                        $failed.transform("")
                                .css("opacity", "");
                    }, 3000);
                }, 300);
            }, 400);

            if (!recovery) {
                $hello.css("opacity", "0");
                $again.transform("translateX(0)");
            }

            $wrong.transform("");
            $submit.css("top", (20 + $wrong.height()) + "px");

            if (!recovery) {
                $lost.show(0).delay(300).queue(function (next) {
                    $lost.css("opacity", "0.4");
                    next();
                });
            }

            $("#credentials > input:last-child").remove();
        }

        function confirmLoginApproval() {
            $loginContainer.attr("data-status", 1);

            setTimeout(function () {
                $verify.transform("")
                        .css("opacity", "");
                setTimeout(function () {
                    $accept.transform("translateX(0)")
                            .css("opacity", 1);

                    setTimeout(function () {
                        if (!recovery) {
                            loggedIn();
                        } else {
                            $accept.transform("")
                                    .css("opacity", "");
                            setTimeout(function () {
                                closeRecovery();
                            }, 300);
                        }
                    }, 800);
                }, 300);
            }, 400);

            if (!recovery) {
                $hello.css("opacity", "0");
                $again.css("opacity", "0");
            }
        }

        // Send request to server for login approval and data
        function requestLoginApproval() {

            if (system._DEBUG) {

                verifyLoginApproval();

                if ($username.val() == "admin") {
                    var clearance = 1;
                } else if ($username.val() == "observe") {
                    var clearance = 2;
                } else {
                    error("Who The Hell Are You?");
                    denyLoginApproval();
                    return false;
                }

                currentUser = {
                    name: "_DEBUG",
                    username: "_DEBUG",
                    password: "XXXX",
                    clearance: clearance,
                    email: "debug@debug.com",
                    settings: [
                        {
                            id: 0,
                            value: "username"
                        },
                        {
                            id: 1,
                            value: "password"
                        },
                        {
                            id: 2,
                            value: "name"
                        },
                        {
                            id: 3,
                            value: "email"
                        },
                        {
                            id: 4,
                            value: "false"
                        }
                    ]
                };

                if (currentUser.clearance > 1) {
                    $.loadScript("JS/build_basic.js");
                } else {
                    $.loadScript("JS/build.js");
                }

                confirmLoginApproval();
                system.logged = true;

                return true;
            }


            if (request) {
                return false;
            }

            verifyLoginApproval();
            request = true;

            formhash(document.getElementById("credentials"), $password);

            $.ajax({
                type: "POST",
                data: $("#credentials").serialize(),
                cache: false,
                url: "PHP/login.php",
                success: function (data) {
                    request = false;

                    //console.log("DATA RECEIVED: "+data);

                    if (data == false) {
                        denyLoginApproval();
                    } else if(data == -1){
                        denyLoginApproval();
                        warn({message:"Ihr Benutzeraccount wurde vorübergehend blockiert. Bitte kontaktieren Sie uns falls Sie fragen haben.",rush: true});
                    } else {

                        try {
                            var serverData = JSON.parse(data, JSON.dateParser);
                        } catch (err) {
                            error(TXT[system.lang].gen.error);
                            denyLoginApproval();
                            return false;
                        }

                        $.extend(true, course, serverData.course);
                        $.extend(true, user, serverData.user);
                        $.extend(true, currentUser, serverData.currentUser);

                        for (var i = 0; i < course.length; i++) {
                            course[i].tt = JSON.parse(course[i].tt);
                            course[i].notes = JSON.parse(course[i].notes, JSON.dateParser);
                            course[i].user = JSON.parse(course[i].user, JSON.dateParser);
                        }

                        if ($("nav a[href='people.html']").hasClass("current")) {
                            if (currentUser.clearance > 1) {
                                $.loadScript("JS/build_basic.js");
                            } else {
                                $.loadScript("JS/build.js");
                            }
                        }

                        confirmLoginApproval();
                        system.logged = true;
                    }
                },
                error: function (a, errorText) {
                    denyLoginApproval();
                    request = false;
                    error(TXT[system.lang].gen.error);
                    console.error("Error 3: Server responded with an error: " + errorText);
                }
            });
        }

        function requestEmailApproval() {

            error(TXT[system.lang].gen.noSupport);
            return false;

            if (request) {
                return false;
            }

            verifyLoginApproval();
            request = true;

            $.ajax({
                type: "POST",
                data: $("#credentials").serialize(),
                cache: false,
                url: "PHP/recovery.php",
                success: function (data) {
                    request = false;
                    if (data === false) {
                        denyLoginApproval();
                    } else {
                        confirmLoginApproval();
                        warn({message: TXT[system.lang].gen.email, rush: true, delay: 8000});
                    }
                },
                error: function (a, errorText) {
                    denyLoginApproval();
                    request = false;
                    error(TXT[system.lang].gen.error);
                    console.error("Error 3: Server responded with an error: " + errorText);
                }
            });
        }

        function hideCredits() {
            $bar.find("#credits").transform("translateY(75px)");
        }

        function showCredits() {
            $bar.find("#credits").transform("");
        }

        function ringBell() {
            var filename = "";
            document.getElementById("sound").innerHTML = '<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>';
        }

        function changeSwatch(swatch) {
            var noColor = {
                red: false,
                green: false
            };

            switch (swatch) {
                case 0:
                    swatch = "rgba(169, 41, 75, 1)";
                    noColor.red = true;
                    break;
                case 1:
                    swatch = "rgba(41, 169, 96, 1)";
                    noColor.red = true;
                    break;
                case 2:
                    swatch = "rgba(10, 60, 102, 1)";
                    noColor.red = true;
                case 3:
                    swatch = "rgba(72, 10, 102, 1)";
                    break;
                case 4:
                    swatch = "rgba(71, 71, 71, 1)";
            }

            for (var i = 0; i < swatchObj.length; i++) {
                swatchObj[i].transition((swatchObj[i].css("transition").indexOf("all") === -1) ? swatchObj[i].css("transition") + ", background-color 3s" : "background-color 3s");
                swatchObj[i].css("background-color", swatch);
            }

            for (var color in noColor) {
                if (noColor[color]) {
                    $("body").addClass("no" + color);
                }
            }
        }

        $title.css("height", $title.height() + "px");

        // Open and close the sidebar
        $("#menu").on("click", function () {
            openSidebar();
        });

        $(document).on("openSidebar", function () {
            openSidebar();
        }).on("closeSidebar", function () {
            closeSidebar();
        }).on("keydown", function (e) {
            if ((e.which > 64) && (e.which < 91)) {
                var coreText = "SWATCH";
                inputText = inputText + String.fromCharCode(e.which);

                if (coreText.substr(0, inputText.length) === inputText) {
                    if (coreText === inputText) {
                        console.log("Cmd: openQuickSettings is DEV only!");
                        //openQuickSettings("SWATCH");
                        inputText = "";
                    }
                } else {
                    inputText = "";
                }
            }
            switch (e.which) {
                case 9:
                    if ((!$username.hasClass("focused")) && (recovery == false) && (!$(e.target).closest(".formContainer:not(:last-child)").length)) {
                        
                        //$password.blur();
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if($(e.target).closest(".formContainer:last-child").length) break;

                        if ($bar.attr("data-open") == "true") {
                            $(document).trigger("closeSidebar");
                            closeSettings(false);
                        } else {
                            $(document).trigger("openSidebar");
                        }
                    }
                    break;
                case 97:
                case 98:
                case 99:
                    if ((!$(e.target).closest("[contenteditable='true'], .editing").length) && (!$("#week-table td.editing").length) && (!$(e.target).closest("input").length)) {
                        e.preventDefault();
                        e.stopPropagation();

                        $("nav td:nth-child(" + (e.which - 96) + ") a").trigger("click");
                    }
                    break;
                case 76:
                    if (e.ctrlKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Prevent any arbitrary start
                        if (system.logged) {
                            openSidebar();
                            setTimeout(function () {
                                logout();
                            }, 500);
                        }
                    }
            }
        });

        $settingsButton.on("click", function () {
            openSettings();
        });

        $credits.on("mouseenter", function () {
            if ($("html").height() > 450) {
                $logout.css("opacity", "0");
                $credits.css("z-index", "10");
            }
        }).on("mouseleave", function () {
            $logout.css("opacity", "");
            $credits.css("z-index", "");
        });

        $username.on("keydown", function (e) {
            if (e.which == 13) {
                if (!recovery && $username.val().length) {
                    $password.focus();
                } else if ($username.val().length) {
                    $username.blur();
                    closingWarning = true;
                    requestEmailApproval();
                }
            }
        });

        $password.on("keydown", function (e) {
            if (e.which == 13) {
                if (($username.val().length) && ($password.val().length)) {
                    $password.blur();
                    closingWarning = true;
                    requestLoginApproval();
                }
            }
        });

        $password.on("focus", function () {

            $password.addClass("focused");

            /*var selection = window.getSelection();
             var range = document.createRange();
             
             range.selectNodeContents(this);
             
             selection.removeAllRanges();
             selection.addRange(range);*/

            if ($loginContainer.attr("data-status") == -1) {
                $password.val("");
                $loginContainer.attr("data-status", 0);
            }
            if ($username.val().length) {
                $submit.transform("translateX(0)");
            }
        }).on("blur", function () {

            $password.removeClass("focused");

            if ($loginContainer.attr("data-status") != -1) {
                $submit.transform("");
            } else {
                setTimeout(function () {
                    if (closingWarning) {
                        setTimeout(function () {
                            $submit.transform("");
                        }, 400);
                        closingWarning = false;
                    } else {
                        $submit.transform("");
                    }
                }, 100);
            }
        });

        $username.on("focus", function () {

            $username.addClass("focused");

            if (($loginContainer.attr("data-status") != 0) && recovery) {
                $submit.transform("translateX(0)");
            }
        })
                .on("blur", function () {

                    $username.removeClass("focused");

                    if (recovery) {
                        if ($loginContainer.attr("data-status") != -1) {
                            $submit.transform("");
                        } else {
                            setTimeout(function () {
                                if (closingWarning) {
                                    setTimeout(function () {
                                        $submit.transform("");
                                    }, 400);
                                    closingWarning = false;
                                } else {
                                    $submit.transform("");
                                }
                            }, 100);
                        }
                    }
                });

        $lost.on("click", function () {
            openRecovery();
        });

        $submit.on("click", function () {
            closingWarning = true;
            if (recovery) {
                if ($username.val().length) {
                    requestEmailApproval();
                } else {
                    // Easter Egg
                    if (easter == 60) {
                        warn({message: "Well if you are that persistant, you might as well get something in return. 42", rush: true, delay: "8s"});
                        easter = 100;
                    }

                    setTimeout(function () {
                        $username.focus();
                    }, 1);

                    if (easter < 100) {
                        easter++;
                    }
                    ;
                }
            } else if ($password.val().length) {
                requestLoginApproval();
            } else {
                // Easter Egg
                if (easter == 15) {
                    warn({message: "Surprise! Bet you didn't expect this!", rush: true});
                    console.log("LOG 8: Surprise!");
                } else if (easter == 30) {
                    warn({message: "No more eastereggs for YOU!", rush: true, delay: 3000});
                    easter = 15;
                }

                setTimeout(function () {
                    $password.focus();
                }, 1);

                if (easter < 100) {
                    easter++;
                }
                ;
            }
        });

        $logout.on("click", function () {
            // Prevent any arbitrary start
            if (system.logged) {
                logout();
            }
        });
    });
});