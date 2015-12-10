/* 
 * Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.
 * Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomString(length) {
    if(length < 2){
        return false;
    }
    // No zero - easier
    var chars = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	    result = '';
    for (var i = length; i > 0; --i){
	result += chars[randomRange(0, chars.length - 1)];
    }
    if (/\d/g.test(result)) {
	if (result.match(/(\d)/g).length < 2) {
	    result = randomString(length);
	}
    } else {
	result = randomString(length);
    }
    return result;
}

// Disables the scrolling effect without affecting the scroll position
function preventScrolling(args) {
    // We get the offset of the scrollbar
    var t = $("#inside").scrollTop();

    if (system.browser == "firefox") {
	// Firefox does not support overlay so we must compesate for the changes
	$("#inside").css("padding-right", "33px");
    }
    $("#inside").css("overflow-y", "hidden");

    // If the content is smaller than contentArea we apply a 'padding'
    if ($(args.org).outerHeight(true) < contentHeight) {
	$("#inside section").css("height", contentHeight + "px");
    }
    // We return the offset because we need it to calculate transform jumps smts
    return t;
}

function warn(o) {

    // Declare stuff
    var msg = o.message,
	    ok = o.textConfirm,
	    cancel = o.textCancel,
	    conf = (o.confirm) ? true : false,
	    width, height,
	    timeout = [],
	    offset = 20;

    var $cont = $("#warn"),
	    $captcha = $("#stringCaptcha2"),
	    $innerCont = $("#warn").children("div"),
	    $cover = $("#warnCover"),
	    $text = $("#warnText"),
	    $textCont = $text.parent(),
	    $buttons = $("#warn .buttonContainer"),
	    $ok = $("#warn .confirm"),
	    $cancel = $("#warn .cancel");

    $captcha.empty().css("width", "");

    function off() {

        $cont.transform("translateY(-" + $cont.height() + "px)");
        $cover.css("display", "")
                .off("click");

        timeout.all(function(a) {
            if (typeof a != "undefined") {
                clearTimeout(a);
            }
        });

        $("#loaded").off("click").off("keydown");
        $ok.off("click");
        $cancel.off("click");

        setTimeout(function() {

            $cont.css("opacity", "0")
                    .removeClass("error");

            $text.text("No message?");
            $ok.children("span").text("OK");
            $cancel.children("span").text("Cancel");

            $buttons.children(".button").removeClass("hide");

            $cont.transition("").transform("").css("height", "");

            $innerCont.transform("").css({"height": "","opacity":""});

            $textCont.css({"width": "", "height": ""});

            setTimeout(function() {
                $cont.addClass("hide")
                        .css("opacity", "1");

                /*setTimeout(function(){
                 $cont.dequeue("warn");
                 },200)*/
            }, 1);
        }, 1010);
    }

    function track($el) {
	o.block = (typeof o.block == "undefined") ? "" : o.block;

	if ($el.hasClass(o.block) || $el.hasClass("hide")) {
	    return false;
	}
	return true;
    }

    function run(type) {
	if (type) {
	    if (typeof o.ifTrue == "function") {
		o.ifTrue();
	    }
	    $cont.trigger("selected", [true]);
	} else {
	    if (typeof o.ifFalse == "function") {
		o.ifFalse();
	    }
	    $cont.trigger("selected", [false]);
	}
	if (typeof o.ifComplete == "function") {
	    o.ifComplete();
	}
    }

    function runAndGun() {
	switch (o.default) {
	    case true:
		var $el = $ok;
		break;
	    case false:
		var $el = $cancel;
	}

	if (track($el) || o.hideButtons) {
            $el.addClass("hover");
            setTimeout(function(){
                $el.addClass("active");
                
                setTimeout(function(){
                    $el.removeClass("active hover");
                    
                    setTimeout(function(){
                        run(o.default);

                        setTimeout(function() {
                            off();
                        }, 100);
                    },50);
                },200);
            },200);
	} else {
	    console.warn("Warning: Disabled Element selected as default");
	    return false;
	}
    }

    if ((o.unique == true) && (!$cont.hasClass("hide"))) {

	$text.css("opacity", 0);
	var oldHeight = $cont.height();

	$captcha.html(msg);

	setTimeout(function() {
	    width = $captcha.width() + 5;

	    if (width > 700) {
		$captcha.css("width", "700px");
	    } else {
		$captcha.css("width", width + "px");
	    }
	    height = $captcha.height();

	    if (height > 200) {
		off();
		console.error("Error 1234567891.. : Message text too long + " + msg);
		return false;
	    }

	    if (oldHeight != (height + 90)) {

		$cont.transition("height 0.3s", true);

		setTimeout(function() {

		    $cont.css("height", (height + 90) + "px");
		    width = $captcha.width() + offset + $buttons.width();
		    $innerCont.css("height", (height + 40) + "px");
		    $innerCont.css("width", width + "px");

		    setTimeout(function() {
			$cont.transition("transform 0.8s");
		    }, 300);
		}, 60);
	    }
	}, 5);

	setTimeout(function() {
	    $text.html(msg);

	    $text.css("opacity", "");

	    $textCont.css("height", height + "px");
	    $textCont.css("width", $captcha.width() + "px");

	    $captcha.empty().css("width", "");
	}, 300);

	return true;
    }

    o.closeWhenever = (o.closeWhenever) ? true : false;
    o.cover = (conf) && (o.cover == null) && (!o.closeWhenever) ? true : (o.closeWhenever) ? false : o.cover;
    o.default = (typeof o.default != "boolean") ? (o.rush && o.closeWhenever) ? true : (o.rush) ? false : (o.closeWhenever) ? true : true : o.default;
    o.rush = ((o.delay != null) && (o.rush == null)) ? true : o.rush;
    o.hideButtons = ((o.hideButtons == null) && (o.rush)) ? true : o.hideButtons;
    o.delay = (typeof o.delay == "string") ? /(\d*)s/i.exec(o.delay)[1] * 1000 : (typeof o.delay == "number") ? o.delay : 5000;
    o.block = (o.block === false) ? "cancel" : (o.block && conf) ? "confirm" : null;

    // If alert active and error is triggered - error > alert
    if (o.error && (!$cont.hasClass("hide"))) {
	// If triggering default behaviour fails, alert execution will be skipped
        console.warn("Warning: Previous alert still active. Error preceeds alert");
	if (!runAndGun()) {
	    height = $cont.outerHeight(true);
	    off();
	}
        setTimeout(function(){
            warn({message:msg, cover:o.cover, error: true, errorStay: o.errorStay, errorResolved: o.errorResolved});
        },1600);
        
	// TO-DO: New error warning will be triggered once the previous message hides
	/*$cont.queue("warn", function(){
	 warn({message:msg, cover:o.cover, error: true, errorStay: o.errorStay, errorResolved: o.errorResolved})
	 });*/
	return false;
    } else if (!$cont.hasClass("hide")) {
	console.warn("Warning: Previous alert still active");
	/*$cont.queue("warn", function(){
	 warn({message: msg, textConfirm: ok, textCancel: cancel, confirm: conf, closeWhenever: o.closeWhenever, cover: o.cover, default: o.default, rush: o.rush, hideButtons: o.hideButtons, delay: o.delay, block: o.block})
	 })*/
	return false;
    }

    if (o.error) {
	if (o.errorResolved) {
	    height = $cont.outerHeight(true);
	    off();
	    return true;
	}
	msg = (typeof msg == "undefined") ? TXT[system.lang].gen.error : msg;
	o.rush = (!o.errorStay) ? true : false;
	o.hideButtons = true;
	$cont.addClass("error");
    }

    if (msg != null) {
	$captcha.html(msg);
    } else {
        return false;
    }
    
    if (ok != null) {
	$ok.children("span").text(ok);
    }
    if (cancel != null) {
	$cancel.children("span").text(cancel);
    }

    if (o.cover) {
	$cover.css("display", "block");
    }
    
    $cont.css("opacity", "0").removeClass("hide");

    setTimeout(function() {
	$captcha.css("width","");
        width = $captcha.width() + 5;

	if (width > 700) {
	    $captcha.css("width", "700px");
	} else {
	    $captcha.css("width", width + "px");
	}
	height = $captcha.height();

	if (height > 200) {
	    off();
	    console.error("Error 1234567891.. : Message text too long + " + msg);
	    return false;
	}

	$text.html(msg);

	$textCont.css("height", height + "px");
	$textCont.css("width", $captcha.width() + "px");

	$captcha.empty().css("width", "");

	if (o.block != null) {
	    $("#warn ." + o.block).transition("none")
		    .css({"border-color": "rgba(232, 232, 232, 0.2)", "color": "rgba(232, 232, 232, 0.2)"});
	}

	$cont.css("height", (height + 90) + "px");
	$innerCont.css("height", (height + 40) + "px");

	$cont.transform("translateY(-" + (height + 90) + "px)").css("opacity", 1);

	if (!conf) {
	    $cancel.addClass("hide");
	}
        
	if (o.closeWhenever || o.rush || o.error) {
	    if (o.hideButtons) {
		$cancel.addClass("hide");
		$ok.addClass("hide");
	    }
	}

	width = $textCont.width() + offset + $buttons.width();
	$innerCont.css("width", width + "px");

	$cont.transition("transform 0.8s")
		.transform("translateY(0)");

	setTimeout(function() {
	    $innerCont.transform("translateY(0)").css("opacity","1");
	}, 150);
    }, 5);

    if (o.rush) {
	timeout[0] = setTimeout(function() {
	    runAndGun();
	}, o.delay);
    }

    $cover.on("click", function() {
	if (track($ok)) {
	    $ok.addClass("hover");
	}
	if (track($cancel)) {
	    $cancel.addClass("hover");
	}

	setTimeout(function() {
	    $ok.removeClass("hover");
	    $cancel.removeClass("hover");

	    setTimeout(function() {
		if (track($ok)) {
		    $ok.addClass("hover");
		}
		if (track($cancel)) {
		    $cancel.addClass("hover");
		}

		setTimeout(function() {
		    $ok.removeClass("hover");
		    $cancel.removeClass("hover");
		}, 300);
	    }, 300);
	}, 300);
    });

    if (o.closeWhenever) {
	timeout[1] = setTimeout(function() {
	    $("#loaded").on("click keydown", function(e) {
		if (!$(e.target).closest("#warn").length) {
		    runAndGun();
		}
	    });
	}, 300);
    }

    if (track($ok)) {
	$ok.one("click", function() {
	    off();
	    run(true);
	});
    }
    if (track($cancel)) {
	$cancel.one("click", function() {
	    off();
	    run(false);
	});
    }

    return true;
}
// Very Important! Do not delete!
function defaults(callerID){
    
    var callee;
    
    if(typeof callerID == "undefined") callee = "defined";
    else caleee = 1;
    
    function recursiveCall(a,b,c){
        c = b - a;
        return recursiveCall(b,a,c);
    }
    
    if(callee == "defined") return recursiveCall(1.5,15,35);
    else if(callee) return false;
    
    return true;
}
function error(o) {
    if (typeof o == "object") {
	var msg = o.msg,
		block = (o.preventAction === true) ? true : false,
		stay = (o.stay === true) ? true : false,
		resolved = false;
    } else if (typeof o == "boolean") {
	if (o !== true) {
	    console.warn("Warning: Useles...");
	    return false;
	}
        
	resolved = o;
    } else {
	var msg = o,
	resolved = false;
    }

    if ((!$("#warn").hasClass("hide")) && (!resolved) && ($("#warn").hasClass("error"))) {
	console.error("Error 1: Too many errors occured at once!\nlast: \"" + msg + "\"");
	return false;
    }

    warn({message: msg, error: true, cover: block, errorStay: stay, errorResolved: resolved});
}

// Cycle through all elements in array == array.each() but only elements
Array.prototype.all = function(fnc) {
    if (typeof fnc != "function") {
	console.error("Error: function needs to be declared");
	return false;
    }
    for (var i = 0; i < this.length; i++) {
	fnc(this[i]);
    }
    return true;
};

Array.prototype.last = function(s) {
    var a = this;

    if (typeof s == "undefined") {
	return a[a.length - 1];
    } else {
	a[a.length - 1] = s;
	return s;
    }
};

function ID(type, id){
    if(typeof id !== "undefined"){
        switch(type){
            case "course": for(var i = 0; i < course.length; i++){
                    if(course[i].id == id){
                        return i;
                    }
            }; break;
            case "user": for(var i = 0; i < user.length; i++){
                    if(user[i].id == id){
                        return i;
                    }
            }; break;
        }
    } else {
        var diff;
        switch(type){
            case "course": diff = 0;
                for(var i = 0; i < course.length; i++){
                    if(course[i].id === diff){
                        diff++;
                        i = 0;
                    }
            }; break;
            case "user": diff = 5;
                for(var i = 0; i < user.length; i++){
                    if(user[i].id === diff){
                        diff++;
                        i = 0;
                    }
            }; break;
        }
        return diff;
    }
}

Date.prototype.toLocaleDateString = function() {
    //console.warn("toLocaleDateString: This feature overrides the original function!");
    var date = this;
    return date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
};

Date.prototype.toStandardDateString = function () {
    var date = this;
    return date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
};

Date.prototype.toStringWithDay = function() {
    var day = this.getDay(),
	    week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (day > 0) {
	day--;
    } else {
	day = 6;
    }

    return this.toLocaleDateString() + " [" + week[day] + "]";
};

// Takes out a part of a string and modifies original string
String.prototype.splice = function(start, end, replace) {
    if (typeof start != "number") {
	console.error("Error: Expected starting index and length to be declared");
	return false;
    }
    if (start < 0) {
	start = this.length + start;
	end = start * (-1);
    }
    replace = (typeof replace == "undefined") ? "" : replace;
    end = (typeof end != "number") ? 1 : end;

    var array = this.split("");

    Array.prototype.splice.apply(array, arguments);

    return(array.join(""));
};

function parseErrorLine(error) {
    var callerLine = error.stack.split("\n")[4];
    return callerLine;
    /*return callerLine.slice(callerLine.indexOf("at ")+2,callerLine.length);*/
    return "[Unknown]";
}

function sendErrorReport(data) {
    $.ajax({
        type: "GET",
        url: "PHP/error.php",
        data: JSON.stringify(data),
        error: function(){
            error("Error Report cannot be submited. Please click <span style='color: orange'>here</span> for more info on how you can help");
        }
    });
}

function greet($el) {
    var text;
    $el = (typeof $el == "undefined") ? $("#sidebar .hello") : $el;

    if (system.time.getHours() < 11) {
	text = TXT[system.lang].gen.title.hello.morning;
    } else if (system.time.getHours() < 19) {
	text = TXT[system.lang].gen.title.hello.day;
    } else {
	text = TXT[system.lang].gen.title.hello.night;
    }

    $el.text(text);
}

// Evaluate Scripts
function parseScript(strcode) {
    // return false;
}

JSON.dateParser = function (key, value) {
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    
    if (typeof value === 'string') {
        if (reISO.exec(value)){
            return new Date(value);
        } 
    }
    return value;
};

// Hash Password
function formhash(form, $password) {
    // Create a new element input, this will be our hashed password field. 
    var p = document.createElement("input");

    // Add the new element to our form. 
    form.appendChild(p);
    p.name = "p";
    p.type = "hidden";
    p.value = hex_sha512($password.val());

    // Make sure the plaintext password doesn't get sent. 
    $password.val(randomString($password.val().length));
}

//Init global variables
var course = [],
    user = [],
    currentUser = {};

var contentHeight, courseCellWidth;
	
var _enableAnimation = {
    main: true, 
    generic: true, 
    info: true
};

var system = {
    _DEBUG: true,
    logged: false,
    animLogin: false,
    ignoreExit: false,
    build: "SC/01-xxxx4/1.2",
    lang: "de",
    availableSettings: [
        {
            id: 0,
            type: "input",
            target: "personal",
            info: "Benutzername",
            mandatory: true,
            pattern: [
                {
                    patt: /^.{4,}$/,
                    text: "Benutzername muss mindestens 4 Zeichen haben"
                },
                {
                    patt: /^(?:[a-z]|\d|_){4,}$/i,
                    text:  "Benutzername darf nur Buchstaben, Zahlen und den Zeichen _ beinhalten"
                }
            ]
        },
        {
            id: 1,
            type: "input",
            target: "personal",
            info: "Passwort",
            hide: true,
            mandatory: true,
            pattern: [
                {
                    patt: /.{4,}/,
                    text: "Dein Passwort muss mindestens 4 Zeichen haben"
                },
                {
                    patt: /^[^ \0]*$/,
                    text: "Leere Zeichen können nicht benutzt werden"
                }
            ]
        },
        {
            id: 3,
            type: "input",
            target: "personal",
            info: "E-Mail",
            placeholder: "Für ein Passwort Reset notwendig",
            pattern: {
                patt: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                text: "E-Mail-Adresse ist ungültig"
            }
        },
        {
            id: 4,
            type: "choice",
            target: "general",
            info: "E-Mail Notifikationen zulassen",
            state: {
                on: "E-Mail Notifikationen werden nur wichtige Informationen beinhalten!",
                off: "Bitte aktivieren Sie diese Funktion, so dass wir Sie über System Updates informieren können"
            }
        }
    ],
    time: new Date(),
    browser: ('WebkitAppearance' in document.documentElement.style) ? "webkit" : (navigator.userAgent.toLowerCase().indexOf('firefox')) ? "firefox" : "other"
};

var timer = {
    uploading: ""
};

$.ajax({
    url: "JS/text.js",
    dataType: "script",
    async: false,
    error: function() {
	if(confirm("Failed to load text data. Click OK to reload the page")){
            location.reload(true);
        }
    }
});

var _string = {goBackToken: TXT[system.lang].gen.alert.back};

window.onbeforeunload = function (e) {
    if(!system.ignoreExit){
        if(system.logged){
            if(currentUser.clearance == 1){
                return "Alle Änderungen werden verloren!";
            } else {
                return "Sind Sie sicher? Sie werden automatisch abgemeldet";
            }
        }
    } else {
        system.ignoreExit = false;
    }
};

$(document).ready(function() {
    
    var firstDayChange = true,
	    outdated = false;

    function NOOP() {
	$.ajax({
	    type: "GET",
	    url: "PHP/NOOP.php",
	    success: function(data) {
		error(true);
	    },
	    error: function() {
		error({msg: TXT[system.lang].gen.alert.connect, stay: true});
		console.error("Error 10: Server connection lost");
	    }
	});
    }

    function syncTimeWithServer() {

	$.ajax({
	    type: "GET",
	    url: "PHP/time.php",
	    success: function(data) {
		if (Math.abs(system.time.getTime() - data) > 60000) {
		    outdated = true;
		} else {
		    outdated = false;
		}
	    },
	    error: function() {
		console.warn("Warning: Couln't retrieve time data from server");
	    }
	});
    }

    // Setup todays Date-object
    function keepTimeAliveAndInSync(count) {
	if (!outdated) {
	    system.time = new Date();
	} else {
	    system.time = system.time.setTime(system.time.getTime() + 1000);
	    if (count == 300) {
		syncTimeWithServer();
		count = 0;
	    }
	}
	;
	count++;

	if (count == 1800) {
	    syncTimeWithServer();
	    count = 0;
	}

	//NOOP();

	if ((!system.time.getHours()) && (firstDayChange)) {
	    firstDayChange = false;
	    console.log("Have a nice new Day hooman");

	    dateString = system.time.toLocaleString().split(" ")[0].split(".");

	    dateString[1] = TXT[system.lang].gen.time.year[system.time.getMonth()];

	    $("#activeDate").text(dateString.join(" "));

	} else if ((system.time.getHours() == 23) && (!firstDayChange)) {
	    firstDayChange = true;
	}

	if (system.time.getSeconds() == 0) {
	    $("#activeTime").text(system.time.toLocaleString().split(" ")[1].split(":").splice(0, 2).join(":"));
	}
	if (system.time.getMinutes() == 0) {
	    greet();
	}

	setTimeout(function() {
	    keepTimeAliveAndInSync(count);
	}, 1000);
    }
    
    jQuery.fn.extend({
	transition: function(property, wait) {
	    wait = (wait === true) ? true : false;
	    var $el = $(this),
		    seal;

	    function format() {
		if (property.indexOf("transform")) {
		    seal = {
			w: property.replace(/transform/i, "-webkit-transform"),
			m: property.replace(/transform/i, "-moz-transform"),
			o: property.replace(/transform/i, "-o-transform")
		    };
		} else {
		    seal = {
			w: property,
			m: property,
			o: property
		    };
		}
	    }
	    if (wait) {
		setTimeout(function() {
		    format();
		    $el.css({"transition": property, "-webkit-transition": seal.w, "-moz-transition": seal.m, "-o-transition": seal.o});
		}, 50);
	    } else {
		format();
		$(this).css({"transition": property, "-webkit-transition": seal.w, "-moz-transition": seal.m, "-o-transition": seal.o});
	    }

	    return $(this);
	},
	transform: function(property) {
	    $(this).css({"transform": property, "-webkit-transform": property, "-moz-transform": property, "-o-transform": property});
	    return $(this);
	},
	pre: function(rule, property) {
	    $(this).css(rule, property)
		    .css("-webkit-" + rule, property)
		    .css("-moz-" + rule, property)
		    .css("-o-" + rule, property);

	    return $(this);
	},
	isActive: function() {
	    var a;
	    $(this).each(function(i) {
		if ($(this).hasClass("hide") == false) {
		    a = $(this).index();
		    return false;
		}
	    });
	    return a;
	},
	realObjectIndex: function(value) {
	    $a = $(this);

	    if (typeof $(this).prop("tagName") == "undefined") {
		console.warn("Warning: tagName could not be retrieved");
	    } else {
		if ($(this).prop("tagName") != "TD") {
		    $a = $(this).parents("td").eq(0);
		    console.warn("Correcting values from " + $(this).prop("tagName").toLowerCase() + " to td");
		}
	    }

	    if (typeof value != "undefined") {
		$a.attr("data-index", value);
	    }

	    return $a.attr("data-index") * 1;
	},
	objectIndex: function() {
	    var $el = $(this);
	    switch ($("section").isActive()) {
		case 0:
		    var $containerTD = $el.closest("td"),
			    $containerTR = $containerTD.parent();

		    var column = $containerTD.index(),
			    row = $containerTR.index();

		    return row * 3 + column;

		case 1:
		    var $container = $el.closest("tr");
		    return $container.index();
	    }
	},
        note: function(msg, args) {
            var $el = $(this);
            
            if(msg === false){
                if($el.hasClass("note")){
                    $el.css("opacity","0");
                    
                    setTimeout(function(){
                        $el.remove();
                    },300);
                    
                    if($el.parent().children(".note").length === 1) $el.parent().off("mouseenter.note").off("mouseleave.note");
                } else {
                    $el.children(".note").css("opacity","0");
                    
                    setTimeout(function(){
                        $el.children(".note").remove();
                    },300);
                    
                    $el.off("mouseenter.note").off("mouseleave.note");
                }
                return true;
            }
            
            var realPos = ((args.realPos === null)||(!/top|bottom/i.test(args.realPos))) ? "top" : args.realPos,
                center = ((args.center === null)||(!/^(?:left|right|center)$/i.test(args.center))) ? "center" : args.center,
                cornerPos = ((args.cornerPos === null)||(!/^(?:left|right|center)$/i.test(args.cornerPos))) ? "center" : args.cornerPos,
                color = /*args.color*/ "rgba(52, 52, 52, 1)",
                maxWidth = (args.maxWidth === null) ? "initial" : args.maxWidth;
            
            var textColor = "rgba(255, 255, 255, 0.85)";
  
            var noteContent = "<div class='note'><div class='noteMessage'></div><div class='center-horiz noteCorner'></div></div>";
            
            if(!$el.hasClass("note")){
                
                if(!$el.children(".note").length){
                    $el.append(noteContent);
                    var $note = $el.children(".note:last-child");
                    
                    $el.on("mouseenter.note", function(){
                        $el.children(".note").addClass("visible");
                    }) .on("mouseleave.note", function(){
                        $el.children(".note").removeClass("visible");
                    });
                } else {
                    $el.append(noteContent);
                    var $note = $el.children(".note:last-child");
                }
            } else {
                var $note = $el;
            }
            
            var $noteText = $note.children(".noteMessage"),
                $noteCorner = $note.children(".noteCorner");
            
            $noteText.css({"background-color":color,"color":textColor});
            $noteCorner.css("background-color",color);
            
            var height = $el.outerHeight();
            
            switch(center){
                case "left":
                    $note.css({"left": 15 + "px", "right": "initial"});
                    break;
                case "right":
                    $note.css({"right": 15 + "px", "left": "initial"});
                    break;
                case "center":
                    $note.css({"left": 0, "right": 0});
                    $note.addClass("center-horiz");
                    var originWidth = $el.width();
                    
                    if(originWidth < maxWidth){
                        $note.css("left",((originWidth-maxWidth)/2)+"px");
                    }
                    
                    break;
            }
            
            switch(realPos){
                case "top": 
                    $note.css({"bottom":(height+3)+"px","padding-bottom":"15px"});
                    $note.transform("translateY(20px) scale(0.8)");
                    $noteCorner.css("bottom",10+"px");
                    break;
                case "bottom":
                    $note.css({"top":(height+3)+"px","padding-top":"15px"});
                    $note.transform("translateY(-20px) scale(0.8)");
                    $noteCorner.css("top",10+"px");
                    break;
            }
            
            switch(cornerPos){
                case "left": 
                    $noteCorner.css({"left":15+"px","right":"initial"});
                    $note.pre("transform-origin-x","0");
                    break;
                case "right": $noteCorner.css({"right":15+"px","left":"initial"});
                    $note.pre("transform-origin-x","100%");
                    break;
                case "center": $noteCorner.css({"left":0,"right":0});
                    break;
            }
            
            $noteText.text(msg);
            $note.css("width",maxWidth+"px");
        }
    });
    
    jQuery.loadScript = function (url, callback) {
        jQuery.ajax({
            url: url,
            dataType: 'script',
            success: callback,
            async: false,
            error: function (xhr) {
                $("#c_view").append("<div id = 'warning' class = 'center-abs' style='line-height: normal'><div class='centerText-vert' style='height: 0'><span style='font-size: 1.2em'>An error occured sadly :(</span><br><br>If you see our specialist show him this message:<br><span style='color:red'>Error (" + xhr.status + ") " + xhr.statusText + "</span></div></div>");
                console.error("Error 11: Parser Error");
            }
        });
    };
    
    // Cookie law - EU 2014
    if(document.cookie.indexOf("acceptCookies=true") == -1){
        setTimeout(function(){
            warn({message:"Diese Seite benutzt Cookies. Akzeptieren Sie bitte unsere <a style='color: rgba(255, 173, 84, 1)' onclick='$(\"#privacyPolicy\").show();setTimeout(function(){$(\"#privacyPolicy\").addClass(\"show\"); setTimeout(function(){$(\"#privacyPolicy > div\").css(\"height\",\"100%\")},200)},50)'>Benutzungsrechtlinien</a> um fortfahren zu können", textConfirm: "Ich Akzeptiere"/*, closeWhenever: true*/});
            $("#warn").one("selected", function(){
                document.cookie = "acceptCookies=true; expires="+ new Date(new Date().getTime() + (1000*60*60*24*365)).toUTCString();
            });
        },2000);
    }

    system.time = new Date();
    // Time configuration
    var dateString = system.time.toLocaleDateString().split(".");

    dateString[1] = TXT[system.lang].gen.time.year[system.time.getMonth()];

    $("#activeDate").text(dateString.join(" "));
    $("#activeTime").text(system.time.toLocaleTimeString().split(":").splice(0, 2).join(":"));
    keepTimeAliveAndInSync();

    $("#loaded").css("opacity", "");

    $("#wait").addClass("close");
    setTimeout(function() {
	$("#wait").transition("none");
	$("#wait").removeClass("close open");
	$("#wait").transition("");
	$("#unloaded").hide();
    }, 500);
});