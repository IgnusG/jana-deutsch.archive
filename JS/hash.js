/* 
 * Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.
 * Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

console.warn("Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.");

$(document).ready(function () {
    contentHeight = $("HTML").height() - $("header").outerHeight(true) - $("footer").height();
    resizeContent();
});
$(window).resize(function () {
    contentHeight = $("HTML").height() - $("header").outerHeight(true) - $("footer").height();
    resizeContent();

    /*courseCellWidth = Math.round(($("#c_view").width() - (6*20)) / 3)*/;
    $("#course-table td").css("width", courseCellWidth + "px");
    $("#course-table tr").css("width", $("#c_view").width() + "px");
});

function resizeContent(ignore) {
    ignore = ignore == null ? false : ignore;
    var newHeight = contentHeight;

    if (!ignore) {
        $("#inside").css("height", newHeight + "px");
        $("#inside").addClass("JS_psaccess_displayNone");
    } else {
        $("#inside").css("height", "inherit");
        $("#inside").removeClass("JS_psaccess_displayNone");
    }

    newHeight = ignore ? newHeight + $("footer").height() : newHeight;
    $(".wrapper").css("height", newHeight + "px");
    $("#inside section").css("height", "auto");

    if (ignore) {
        $("#people-content").addClass("moveRequest");
    }
    else {
        $("#people-content").removeClass("moveRequest")
    }

    if (system.browser == "webkit") {
        $("#inside").css("overflow-y", "overlay");
    } else {
        if (system.browser == "firefox") {
            $("#inside").css("padding-right", "16px")
        }
        $("#inside").css("overflow-y", "scroll");
    }
}

$(function () {
    var indx, indx_old;

    $("nav").on("click", "td a", function () {
        if (_enableAnimation.main) {
            indx = $(this).parent().index() + 1;

            window.location.hash = $(this).attr("href");
        } else if (typeof _enableAnimation.main == "number") {
            var tempHash = $(this).attr("href");
            indx = $(this).parent().index() + 1;

            warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: function () {
                    _enableAnimation.main = _enableAnimation.main = true;
                    window.location.hash = tempHash;
                }});
        } else {
            // Input overflow prevents user interactions until animation ends
            window.location.hash = window.location.hash;
        }

        return false;
    });

    $(window).on("hashchange", function () {

        // If not Unknown Error and no Input overflow
        if (window.location.hash.substring(1) && _enableAnimation.main) {

            var web = ["index.html", "people.html", "about.html"];

            if (indx != null) {

                var newHash = window.location.hash.substring(1);

                // We check the array to find a match between the hash and the array content
                indx = web.indexOf(newHash) + 1;
                // We scan the wrappers to see which one is active - that's our point of origin
                $(".wrapper").each(function () {
                    if ($(this).css("display") == "block") {
                        indx_old = $(this).index() + 1;
                    }
                });

                // To prevent anomalies we set all wrappers to visible
                $(".wrapper").css("display", "block");

                // Loading screen init
                $("#wait").delay(500).queue(function () {
                    $("#unloaded").show();
                    setTimeout(function () {
                        $("#wait").addClass("open");
                    }, 100);
                });

                $("#people-content").removeClass("showRequest");
                resizeContent(true);

                $(document).trigger("closeSidebar");
                
                $("#" + newHash.substring(0, newHash.indexOf(".")) + "-content")
                        .load(newHash + " #inside", function (resp) {

                            //parseScript(resp);
                            $("nav a")
                                    .removeClass("current")
                                    .removeClass("JS_psaccess_transformScale");
                            $("nav a[href='" + newHash + "']")
                                    .addClass("current")
                                    .addClass("JS_psaccess_transformScale");

                            // ANIMATION
                            // Where to move
                            var move = (indx_old - indx) * 150;
                            // Ignore presets - check function declaration
                            /*sizeContent(false);*/
                            // Hide middle container
                            if (Math.abs(indx_old - indx) === 2) {
                                $("#people-content").css("opacity", "0");
                            }
                            $(".wrapper").each(function () {
                                var tmp = $(this).css("transform");

                                if (tmp == null) {
                                    $(this).css("-webkit-transform")
                                }
                                if (tmp == null) {
                                    $(this).css("-moz-transform")
                                }
                                if (tmp == null) {
                                    $(this).css("-o-transform")
                                }

                                /*console.log("Wrapper "+ $(this).index() +"\nMatrix say: "+matrix.m41 + "\nDivide by width: "+ $("#content").width()+ "\nIs = " + matrix.m41/$("#content").width() + "\nTogether No Change:  " + (matrix.m41/$("#content").width()*100) + "\nRounded: "+  Math.round((matrix.m41/$("#content").width())*100) + "\n");*/
                                // Get current offset in %
                                tmp = Math.round((tmp.split(",")[4] * 1) / $("#content").width() * 100);

                                // Check for inconsistency - correct if needer
                                var modular = tmp % 3;
                                if (modular > 0) {
                                    tmp = tmp + (3 - modular);
                                    /*console.warn("Corrected value from Positive\n Now: "+tmp + " Was: "+(tmp-(3-modular)) + "\n");*/
                                } else if (modular < 0) {
                                    tmp = tmp + (-3 - modular);
                                    /*console.warn("Corrected value from Negative\n Now: "+tmp + " Was: "+(tmp-(-3-modular)) + "\n");*/
                                }
                                
                                // Final: init animation
                                $(this).removeClass("move" + tmp);
                                /*alert("Removing move"+tmp);*/
                                tmp = tmp + move;
                                $(this).addClass("move" + tmp);
                                _enableAnimation.main = false;
                                _enableAnimation.generic = false;
                                /*alert("Adding move"+tmp);*/
                                
                            });

                            if ((newHash == "people.html") && (system.logged)) {
                                if (currentUser.clearance > 1) {
                                    $.loadScript("JS/build_basic.js");
                                } else {
                                    $.loadScript("JS/build.js");
                                }
                            }

                            // When completed
                            //$(".wrapper:first-child").one("transitionend", function () {
                            setTimeout(function(){
                                $("#people-content").css("opacity", "1");
                                // Hide wrappers except our active one
                                $(".wrapper").each(function () {
                                    if ($(this).index() + 1 != indx) {
                                        $(this).empty().css("display", "none");
                                    }
                                });

                                setTimeout(function(){
                                    // Disable Input overflow to re-enable navigation
                                    _enableAnimation.main = true;
                                    _enableAnimation.generic = true;
                                    
                                    if ((newHash == "people.html") && (!system.logged)) $(document).trigger("openSidebar");
                                    resizeContent();
                                    
                                },500);
                                
                                $("#people-content").addClass("showRequest");

                                if (newHash == "index.html") {
                                    $.loadScript("JS/mash.js");
                                }
                            },2000);

                            $("#wait").clearQueue().addClass("close");
                            setTimeout(function () {
                                try {
                                    $("#wait").transition("none");
                                    $("#wait").removeClass("close open");
                                    $("#wait").transition("");
                                    $("#unloaded").hide();
                                } catch (err) {
                                    $("#wait").transition("none");
                                    $("#wait").removeClass("close open");
                                    $("#wait").transition("");
                                    $("#unloaded").hide();
                                }
                            }, 550);
                            /*$("#wait").remove();*/
                        });
            } else {
                // Window opened with wrong hash - correct
                window.location.hash = "index.html";
            }
        }
    });
    $(window).trigger("hashchange");
});

