/* 
 * Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.
 * Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

$(function() {

    // Setup general time
    var today;
    // Active Position
    var _activePos = {};

    var _temp = {};

    /*courseCellWidth = Math.round(($("#c_view").width() - (6*20)) / 3);*/
    var courseCellWidth = 330;
    var userCellWidth = 200;
    var simplEditorTimer,
	weekEditorTimer;
    
    function init(){
        
        $(".dot-marker").remove();
        $("#scroll").addClass("noAdmin");
        $(".simplEdit").removeClass("simplEdit");
        
        $("#scroll").addClass("notAdmin");
        
        resetAllFields();
        
        // Setup general time
        today = new Date(system.time.getTime());
        today.setHours(12, 0, 0, 0);

        // Active Position
        _activePos = {
            course: 0,
            user: 0,
            tframe: 0
        };

        _temp = {
            // Last active cell in notes Table in 0th tframe
            lastInTable: 0,
            // Changed on tframe change -> add 12
            lastInArray: 0,
            // Number of tframes
            max_tframe: 0,
            // If iSaw should be updated when missing dates
            updateNotes: false,
            week: []
        };

        // Disable markup feauture if not webkit
        if (system.browser != "webkit") {
            $(".trueEditor .fakeContent").css("opacity", "0");

            // If firefox, imitate blur effect on fake-u_view
            if (system.browser == "firefox") {
                $("#fake-u_view").addClass("firefox");
                for (var i = 0; i < 2; i++) {
                    var $el = (i == 0) ? $("#fake-u_view .firefoxHelper1 tbody") : $("#fake-u_view .firefoxHelper2 tbody");
                    for (var k = 0; k < 6; k++) {
                        var className = $el.find("td").eq(k).attr("class");
                        $el.find("td").eq(k).append("<div class='" + className + "'>.</div>");
                        $el.find("td").eq(k).attr("class", "");
                    }
                }
            }
        }

        // Create day names
        for (var i = 0; i < 7; i++) {
            $("#week-table thead td:nth-child(" + (i + 1) + ")").append(TXT[system.lang].gen.time.week[i]);
        }
            
        updateNotesArray();
        var show;

        if ((course.length > 1) || (currentUser.clearance == 2)) {
            $("#c_view").removeClass("hide");
            createUI({of: "course"});
            show = "#c_view";
        } else {
            $("#u_view").removeClass("hide");
            $("#u_view .go_back").hide();
            createUI({of: "user"});
            show = "#u_view";
        }
        
        if(system.animLogin){
            preventScrolling("#fake-u_view");

            $("#fake-u_view").css("opacity", "0");
            $("#scroll").transition("transform 1s");
            $("#scroll").transform("translateY(-680px)");

            $("#scroll").one("transitionend", function () {
                $("#fake-u_view").css("height", "0");
                $("#scroll").transition("");
                $("#scroll").transform("");
            });

            $("#people-content").addClass("hidden");

            $(show).removeClass("hide");

            setTimeout(function () {
                resizeContent();
            }, 1000);  
        } else {
            $("#fake-u_view").transition("none");
            $("#fake-u_view").css("opacity", "0");
            $("#fake-u_view").transition("");

            $("#fake-u_view").css("height", "0");

            $("#people-content").addClass("hidden");
            $(show).removeClass("hide");
        }

        system.animLogin = false;
    }
    
    init();

    function createMatchedToDate(o) {
	try {
	    console.time("Computation time");

	    var ID_C= o.course,
                stopExec = false,
		extend = (o.extend) ? true : false,
		overwrite = (!extend) ? false : (o.overwrite) ? true : false;

	    console.groupCollapsed("DGA running...");
	    console.log("Starting Date Generation algorythm - #SimplCoding");
	    console.log("Initiating with params EXTEND: " + extend + " OVERWRITE: " + overwrite);

	    var stats = {
		original: course[ID_C].notes.length,
		missing: 0,
		added: 0
	    };

	    if (!course[ID_C].notes.length) {
		course[ID_C].notes[0] = {
		    date: new Date(course[ID_C].startdate.getTime()),
		    content: TXT[system.lang].u.info.content,
		    title: ""
		};
	    }

	    var start = (extend) ? new Date(course[ID_C].notes[0].date.getTime()) : new Date(course[ID_C].notes.last().date.getTime()),
		    oldStart = new Date(start.getTime()),
		    indx = (extend) ? 1 : course[ID_C].notes.length;

	    console.warn("Starting with Date " + start.toLocaleDateString());
	    console.groupCollapsed("[Overlook]");

	    for (var i = 0; i < 7; i++) {
                if (course[ID_C].tt[i] != "") {
                    break;
                }
                if (i == 6) {
                    stopExec = true;
                    console.warn("No Dates Detected - exiting");
                }
            }

            while ((start <= today) && (!stopExec)) {
		// Find out the day
		var day = start.getDay();
		if (day > 0) {
		    day--
		} else {
		    day = 6
		}

		// We don't need 'today' because it was already saved - add one day
		day++;
		if (day == 7) {
		    day = 0;
		}

		// Cycle through 1 week
		for (var i = 0; i < 7; i++) {
		    // If you find a match
		    if (course[ID_C].tt[day] != "") {
			// Save with the day offset - how far apart the days are, end the for loop
			start.setDate(start.getDate() + i + 1);
			break;
		    } else {
			// Otherwise add one day and reloop...
			// A match will always be found at least once - 7 days apart (the same day)
			day++;
			if (day == 7) {
			    day = 0;
			}
		    }
		}

		if ((extend) && (indx < course[ID_C].notes.length)) {
		    if (start < course[ID_C].notes[indx].date) {
			console.log("EXTEND ACTIVE: Added new Date " + start.toStringWithDay() + " at position " + indx + " because date " + course[ID_C].notes[indx].date.toStringWithDay() + " is greater");
			course[ID_C].notes.splice(indx, 0, {
			    date: new Date(start.getTime()),
			    content: TXT[system.lang].u.info.content,
			    title: ""
			});

			stats.added++;
		    } else if (start > course[ID_C].notes[indx].date) {
			start.setTime(course[ID_C].notes[indx].date.getTime());
			if (overwrite) {
			    console.log("EXTEND ACTIVE: Missing Date " + course[ID_C].notes[indx].date.toStringWithDay() + " ...REMOVED!");
			    course[ID_C].notes.splice(indx, 1);
			    indx--;
			} else {
			    console.log("EXTEND ACTIVE: Missing Date " + course[ID_C].notes[indx].date.toStringWithDay() + " ...KEPT!");
			}
			stats.missing++;
		    }
		} else {
		    console.log("EXTEND NOT ACTIVE: Added new Date " + start.toStringWithDay() + " to end of NoteArray");
		    course[ID_C].notes[indx] = {
			date: new Date(start.getTime()),
			content: TXT[system.lang].u.info.content,
			title: ""
		    };
		    stats.added++;
		}

		indx++;

		if (start == oldStart.getTime()) {
		    error(TXT[system.lang].gen.error)
		    console.error("Error 2: Critical Error in [createMatchedToDate]: infinite loop found found found ...");
		    sendErrorReport();
		    break;
		}
		oldStart = new Date(start.getTime());
	    }

	    course[ID_C].notes.splice(indx, 1);

	    console.groupEnd();
	    console.log("ROUTINE COMPLETED: Results - Missing: " + stats.missing + ((stats.missing > 0) ? ((overwrite) ? " [ALL REMOVED] " : " [ALL KEPT] ") : "") + " Added: " + stats.added + " New Total: " + course[ID_C].notes.length + " Original Total: " + stats.original);
	    console.timeEnd("Computation time");
	    console.groupEnd();

	    return true;
	} catch (err) {
	    return false;

	    error(TXT[system.lang].gen.error);
	    console.error("Error 2: Critical Error in [createMatchedToDate]: " + err);
	    sendErrorReport();
	}
    }

    function updateNotesArray(on, extend, overwrite) {
	extend = (extend == null) ? false : extend;
	overwrite = (overwrite == null) ? false : overwrite;
	on = (on == null) ? "none" : (on == "active") ? _activePos.course : on;


	for (var courseID = 0; courseID < course.length; courseID++) {

	    var this_course = course[courseID];

	    if (on == courseID) {
		createMatchedToDate({course: courseID, extend: extend, overwrite: overwrite});
	    } else {
		createMatchedToDate({course: courseID});
	    }

	    for (var userID = 0; userID < this_course.user.length; userID++) {
		var this_user = this_course.user[userID];

		for (var i = 0; i < this_course.notes.length; i++) {

		    // If the node does not exist yet and can't be replaced - add new on the end of the stack
		    if (this_user.notes[i] == null) {
			this_user.notes[i] = {
			    date: new Date(this_course.notes[i].date.getTime()),
			    attendance: -1,
			    note: TXT[system.lang].u.info.content
			}
			// The node exists but is positioned after - add new node before this one
		    } else if (this_course.notes[i].date < this_user.notes[i].date) {
			this_user.notes.splice(i, 0, {
			    date: new Date(this_course.notes[i].date.getTime()),
			    attendance: -1,
			    note: TXT[system.lang].u.info.content
			})
			// The node exists but is positioned before - remove it and check this index again (i--)
		    } else if (this_course.notes[i].date > this_user.notes[i].date) {
			this_user.notes.splice(i, 1);
			i--;
		    }
		    ;
		}
		this_user.notes.splice(this_course.notes.length, this_user.notes.length);
	    }
	}
	;
	_temp.updateNotes = false;
    }

    function animateSectionsVertical(o) {
	var move,
		start = "#" + o.start,
		end = "#" + o.end,
		type = (o.type == null) || (o.type == "forward") ? 1 : (o.type == "backward") ? 0 : o.type;

	if ((type !== 0) && (type !== 1))
	    throw "type can only have values forward, backward or 1,0 respectively"

	// We disable content overflow
	_enableAnimation.generic = false;

	switch (type) {
	    case 1:
		$(function() {

		    var offset = preventScrolling({org: start});

		    move = $(start).innerHeight() - offset;

		    $(end).removeClass("hide");
                    $(end).transition("opacity 0.3s");
                    setTimeout(function(){
                        $(end).css("opacity","1");
                    },10);

		    $("#scroll").addClass("enableHorizTrans")
			    .transform("translateY(-" + move + "px)");

		    setTimeout(function() {
                        $(start).css("opacity","");
			$(start).addClass("hide");

			$("#scroll").removeClass("enableHorizTrans")
				.transform("translateY(0)");

			$(start + "," + end).transform("translateY(0)");

			$("#inside").scrollTop(0);
			resizeContent();
			_enableAnimation.generic = true;
		    }, 1500);
		});
		break;
	    case 0:
		$(function() {

		    $(end).removeClass("hide");
                    $(end).transition("opacity 0.3s");
                    setTimeout(function () {
                        $(end).css("opacity", "1");
                    }, 10);

		    var offset = preventScrolling({org: end});

		    move = $(end).outerHeight() + offset;
                    
                    $("#inside").scrollTop(0);

		    $("#scroll").transform("translateY(-" + move + "px)");

		    setTimeout(function() {
			$("#scroll").addClass("enableHorizTrans")
				.transform("translateY(0)");
			setTimeout(function() {
                            $(start).css("opacity","");
			    $(start).addClass("hide");
			    $("#scroll").removeClass("enableHorizTrans");

			    $(start + "," + end).transform("translateY(0)");
                            $(end).transition("");

			    $("#inside").scrollTop(0);
			    resizeContent();
			    _enableAnimation.generic = true;
			}, 1500);
		    }, 100);
		});
		break;
	}

	return true;
    }

    function goBack(to, animate) {
	animate = (animate == false) ? false : true;
	switch (to) {
	    case "course":
		$(function() {

		    function _goBack() {
			_enableAnimation.main = true;
			_activePos.course = false;

			if (animate) {
			    animateSectionsVertical({
				start: "u_over",
				end: "c_view",
				type: "backward"
			    });
			}
		    }

		    if (_enableAnimation.generic) {
			_goBack();
		    } else {
			if (typeof _enableAnimation.generic == "number") {
			    warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: _goBack});
			}
		    }
		});
		break;
	    case "user":
		$(function() {
		    var indxC = _activePos.course,
			    indx = (currentUser.clearance == 2) ? _activePos.user : 0;

		    var n = 0;

		    function _goBack() {
			_enableAnimation.main = _enableAnimation.main = true;

			$el = $("#notes-content").find(".notes-wrapper");

			$el.transform("translateX(-100%)");
			$("#notes-wrapper_main").transform("translateX(0)");

			setTimeout(function() {
			    $el.remove();
			}, 600);

			_activePos.tframe = 0;
			_temp.lastInArray = _temp.lastInTable;
			$("#notes-wrapper_main").show();

			_activePos.user = false;

			setTimeout(function() {
			    $("#selectedInfoCont").addClass("hide")
				    .attr("data-active", "");
			}, 600);

			if (animate) {
                            if(currentUser.clearance != 2){
                                var start = "u_view";
                                var end = "c_view";
                            } else {
                                var start = "u_view";
                                var end = "u_over";
                            }
			    animateSectionsVertical({
				start: start,
				end: end,
				type: "backward"
			    });
			}
		    }

		    _goBack();
		});
		break;
	}
    }

    function createNewElement(attr) {

	var name = (attr.name == null) ? "[System Error: Not Provided]" : attr.name,
		selector = (attr.select != null) ? (attr.select == "course") ? 0 : (attr.select == "new-box") ? 1 : (attr.select == "new-box-copy") ? 2 : (attr.select == "flip-container") ? 3 : (attr.select == "user") ? 4 : (attr.select == "notes-wrapper") ? 5 : (attr.select == "notes-table") ? 6 : (attr.select == "week-table_cell") ? 7 : (attr.select == "circle") ? 8 : (attr.select == "line") ? 9 : (attr.select == "complexLine") ? 10 : false : false;

	switch (selector) {
	    case 0:
		return "<div class='BOX courseBox'><div class='BOXcontainer'><div class='course'><span>" + name + "</span></div></div></div>"
	    case 1:
		return "false";
	    case 2:
		return "false";
	    case 3:
		return "false";
	    case 4:
		return "<div class='BOX userBox'><div class='BOXcontainer'><div class='user'><span>" + name + "</span></div></div><div class='info-icon icon'><svg viewBox='0 0 16 16'><use xlink:href='#info-icon'></use></svg></div><div class='infopanel'><div><div>" + TXT[system.lang].gen.login.user + ": </div><div>" + TXT[system.lang].gen.login.pass + ": </div></div><div><div><span class='username'></span></div><div class='passwordContainer'><span class='password'></span><div class='warning'></div></div></div></div></div>";
	    case 5:
		return "<div class='notes-wrapper'> <div class='center-horiz' style='width: 600px;position:relative;'><div class='go_side_cont go_sideL icon'><div class='go_side center-vert'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></svg></div></div><div class='go_side_cont go_sideR icon'><div class='go_side center-vert'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></svg></div></div>" + createNewElement({select: 'notes-table', name: 1}) + "<div style=' width: 100%;height: 25px;'></div>" + createNewElement({select: 'notes-table', name: 2}) + "</div></div>";
	    case 6:
		return "<table class='notes-table table-nr" + name + "'><thead><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>";
	    case 7:
                var nameParsed = name.split(":");
                return "<div style='height: 6px'></div><span><div class='hours'>" + nameParsed[0] + "</div>:<div class='minutes'>" + nameParsed[1] + "</div></span><div style='height: 6px'></div>"
	    case 8:
		return "<div class='circleContainer' data-active='" + name + "''><div class='coverEntire'></div><div class='coverSmall'></div><div class='circle'></div><div class='date'></div><div class='cancel'><svg class='icon' viewBox='-206 -205.997 512 511.996'><use xlink:href='#delete-icon'></use></svg><span>" + TXT[system.lang].u.cancel + "</span></div><div class='center-abs innerCircle'></div></div>";
	    case 9:
		return "<div class='line'><div class='center-vert'></div></div>";
	    case 10:
		return "<div class='lineContainer'>" + createNewElement("line") + "<div class='nextWeekMarker'><div><div>" + TXT[system.lang].gen.time.nextWeek + "</div></div></div>" + createNewElement("line") + "</div>";
	}
    }

    function createTable(this_user, $firstTable, $secondTable) {
	var n = _temp.lastInArray - 1;

	for (var i = 0; i < 12; i++) {

	    if (n == -1) {
		break;
	    }

	    if (i < 6) {
		var cellNr = i + 1;
		var $element = $firstTable;
	    } else {
		var cellNr = i - 6 + 1;
		var $element = $secondTable;
	    }

	    var $cell = $element.find("thead td:nth-child(" + (cellNr) + ")");
	    var date = new Date(this_user.notes[n].date.getTime());

            date = date.toLocaleDateString();
	    if (date > today) {
		date = date.substr(0, date.lastIndexOf(".")) + "<br>Next Course";
	    } else {
		date = date.substr(0, date.lastIndexOf("."));
	    }

	    $cell.append(date);

	    $cell = $element.find("tbody td:nth-child(" + (cellNr) + ")");

	    switch (this_user.notes[n].attendance) {
		case 2:
		    $cell.addClass("noApproved");
		    break;
		case 1:
		    $cell.addClass("yes");
		    break;
		case 0:
		    $cell.addClass("no");
		    break;
		case -1:
		    $cell.addClass("missingInfo");
		    break;
		case -2:
		    $cell.addClass("noCourse");
		    break;
	    }

	    n--;
	}
    }

    function createUI(o) {

	if (typeof o != "object") {
	    var selector = o === "course" ? 0 : o === "users" ? 1 : o === "user" ? 2 : false;
	} else {
	    var selector = o.of === "course" ? 0 : o.of === "users" ? 1 : o.of === "user" ? 2 : false;
	}

	switch (selector) {

	    case 0:

		$("#course-table").empty();

		for (var i = 0; i < course.length; i++) {
		    var name = course[i].name;
		    if ((i % 3) == 0) {
			$("#course-table").append("<tr></tr>");
		    }
		    $("#course-table tr:last-child").append("<td class='holdPerspective_bigBox_Rotation'></td>");
		    $("#course-table tr:last-child td:last-child")
			    .append(createNewElement({name: name, select: "course"}))
			    .objectIndex(i);
		}
                
                $("#course-table td").css("width", courseCellWidth + "px");
                $("#course-table tr").css("width", $("#c_view").width() + "px");
                
                $("#course-table:empty").append("<tr><td style='font-size: 1.5em;'>"+TXT[system.lang].c.noCourse+"</td></tr>");

		break;
	    case 1:
		var indx = _activePos.course;

		try {
		    // Reset fields
		    var remove = ["#u_over .name", "#u_over .startDate > div", "#u_over .courseInfo", "#week-table tbody td", "#user-table"];

		    var this_course = {};

		    $.extend(true, this_course, course[indx]);

		    // Removing old content
		    for (var i = 0; i < remove.length; i++) {
			$(remove[i]).empty();
		    }

		    // Building the content
		    $("#u_over .name").append(this_course.name);

		    var timeDiff = Math.abs(today - this_course.startdate);
		    timeDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

		    var dateString = this_course.startdate.toLocaleDateString();

		    var starting;

		    if (this_course.startdate < today) {

			if (timeDiff == 1) {
			    timeDiff = TXT[system.lang].gen.time.yesterday;
			} else {
			    if (timeDiff > 31) {
				timeDiff = Math.round(timeDiff / 30.42);
                                if (timeDiff >= 12) {
                                    timeDiff = Math.round((timeDiff / 12) * 10) / 10;

                                    if (Math.floor(timeDiff) == 1) {
                                        var selector = TXT[system.lang].gen.time.years[0];
                                    } else {
                                        var selector = TXT[system.lang].gen.time.years[1];
                                    }
                                } else {
                                    if (Math.floor(timeDiff) == 1) {
                                        var selector = TXT[system.lang].gen.time.month[0];
                                    } else {
                                        var selector = TXT[system.lang].gen.time.month[1];
                                    }
                                }
			    } else {
				var selector = TXT[system.lang].gen.time.inDays[2];
			    }
			    timeDiff = TXT[system.lang].gen.time.inDays[0] + " " + timeDiff + " " + selector + TXT[system.lang].gen.time.inDays[3];
			}
			starting = "(" + timeDiff + ")";

			$("#u_over .startDate > div:first-child").append(TXT[system.lang].c.top + " " + TXT[system.lang].gen.time.starts[0]);
		    } else {
			switch (timeDiff) {
			    case 0:
				starting = "(" + TXT[system.lang].gen.time.today + ")";
				break;
			    case 1:
				starting = "(" + TXT[system.lang].gen.time.tomorrow + ")";
				break;
			    default:
				starting = "(" + TXT[system.lang].gen.time.inDays[1] + " " + timeDiff + " " + TXT[system.lang].gen.time.inDays[2] + ")";
			}

			$("#u_over .startDate > div:first-child").append(TXT[system.lang].c.top + " " + TXT[system.lang].gen.time.starts[1]);
		    }
		    $("#u_over .startDate #dateEditor").append(dateString);
		    $("#u_over .startDate > div:last-child").append(starting);

		    $("#u_over .courseInfo").append(this_course.info);

		    _temp.week = this_course.tt.slice(0);

		    for (var i = 0; i < 7; i++) {
			var $el = $("#week-table tbody td:nth-child(" + (i + 1) + ")");

			if (this_course.tt[i] != "") {
			    $el.append(createNewElement({select: "week-table_cell", name: this_course.tt[i]}));
			}
		    }

		    $("#week-table tbody span").css("opacity", "1");

		    for (var i = 0; i < this_course.user.length; i++) {
			$("#user-table").append("<tr><td class='holdPerspective_smallBox_Rotation' style='width: " + userCellWidth + "px'>" + createNewElement({select: "user", name: user[ID("user",this_course.user[i].id)].name}) + "</td></tr>");
			$current = $("#user-table tr:last-child td:last-child");
			$current.objectIndex(i);
			$current.find(".username").text(user[ID("user",this_course.user[i].id)].username);

			if (user[ID("user",this_course.user[i].id)].password.length) {
			    $current.find(".password").text(user[ID("user",this_course.user[i].id)].password);
			    $current.find(".warning").addClass("alert").html(TXT[system.lang].u.alert.warning);
			} else {
			    $current.find(".password").text("••••LOL••••").addClass("protected");
			    $current.find(".warning").addClass("msg").html(TXT[system.lang].u.alert.msg);
			}
		    }

		} catch (err) {
		    error(TXT[system.lang].gen.error);
		    console.warn("Warning: User View encountered an error: " + err.message + " at line " + parseErrorLine(err));
		    sendErrorReport();
		    return false;
		}
		break;
	    case 2:
		var indxC = _activePos.course, indx = (currentUser.clearance == 2) ? _activePos.user : 0;

		try {

		    if (_temp.updateNotes) {
			updateNotesArray();
		    }
		    ;

		    // Reset fields
		    var remove = ["#u_view .name", "#u_view .timeleft", "#u_view .notes-table td", "#userInformation .content", "#userSpecific"];
		    var this_user = {},
			    this_course = {};
		    // Poluting our local variable with values fro global scope
		    $.extend(true, this_course, course[indxC]);
		    $.extend(true, this_user, this_course.user[indx]);

		    // Removing old content
		    for (var i = 0; i < remove.length; i++) {
			$(remove[i]).empty();
			if (remove[i] === "#u_view .notes-table td") {
			    $(remove[i])
				    .removeClass("yes")
				    .removeClass("no")
				    .removeClass("noApproved")
				    .removeClass("missingInfo")
				    .removeClass("noCourse");
			}
		    }
		    $("#last_info").show();

		    // Building the content
                    if(currentUser.clearance == 2){
                        $("#u_view .name").append(user[ID("user",this_user.id)].name);
                    } else {
                        $("#u_view .name").append(currentUser.name);
                    }

		    var day = today.getDay();
		    var timeleft;

		    if (today.getTime() < this_course.startdate.getTime()) {
			var futureEvent = true;
			timeleft = this_course.startdate.toLocaleDateString();

			$("#u_view .timeleft").append(TXT[system.lang].u.notYet + timeleft);
		    } else {
			var futureEvent = false;
			// Correct week starting on Sunday
			if (day > 0) {
			    day--
			} else {
			    day = 6
			}

			for (var i = day; i < 14; i++) {
			    var t;
			    if (i > 6) {
				t = i - 7;
			    } else {
				t = i;
			    }
			    if (this_course.tt[t] != "") {
				timeleft = i - day;
				break;
			    }
			}

			switch (timeleft) {
			    case 0:
				timeleft = TXT[system.lang].gen.time.today;
				break;
			    case 1:
				timeleft = TXT[system.lang].gen.time.tomorrow;
				break;
			    default:
				timeleft = TXT[system.lang].gen.time.inDays[1] + " " + timeleft + " " + TXT[system.lang].gen.time.inDays[2];
			}

			$("#u_view .timeleft").append(TXT[system.lang].u.nextLesson + " <span style='color: #FFA646'>" + timeleft + "</span>");
		    }

		    this_user.notes.reverse();
		    this_course.notes.reverse();

		    var $firstTable = $("#notes-wrapper_main .notes-table").eq(0);
		    var $secondTable = $("#notes-wrapper_main .notes-table").eq(1);

		    var length = this_user.notes.length;

		    _activePos.tframe = 0;

		    if (length < 13) {
			_temp.lastInTable = length;
			_temp.max_tframe = 0;
		    } else {
			var remainder = length % 12;

			if (remainder == 0) {
			    _temp.lastInTable = 12;
			    _temp.max_tframe = (length / 12) - 1;
			} else {
			    _temp.lastInTable = remainder;
			    _temp.max_tframe = Math.floor(length / 12);
			}
		    }

		    _temp.lastInArray = _temp.lastInTable;

		    if (_temp.max_tframe > 0) {
			$(".go_side_cont").show();
		    } else {
			$(".go_side_cont").hide();
		    }

		    createTable(this_user, $firstTable, $secondTable);

		    for (var k = 0; k < course[indxC].user[0].notes.length; k++) {
			if (course[indxC].user[0].notes[k].attendance == -2) {
			    _temp.noCourseMarker.before.push(k);
			}
		    }

		    if (!this_course.notes[0].title.length) {
			$("#next_info .header").text(TXT[system.lang].u.info.title[0]);
		    } else {
			$("#next_info .header").text(this_course.notes[0].title);
		    }

		    $("#next_info .content").text(this_user.notes[0].note);
		    $("#next_info .fakeContent").text(this_user.notes[0].note);

		    $("#next_info .content.general").text(this_course.notes[0].content);
		    $("#next_info .fakeContent.general").text(this_course.notes[0].content);
		    $("#next_info").attr("data-active", length - 1);

		    if (futureEvent) {
			$("#last_info").hide();
		    } else {
			if (!this_course.notes[1].title.length) {
			    $("#last_info .header").text(TXT[system.lang].u.info.title[0]);
			} else {
			    $("#last_info .header").text(this_course.notes[1].title);
			}

			$("#last_info .content").text(this_user.notes[1].note);
			$("#last_info .fakeContent").text(this_user.notes[1].note);

			$("#last_info .content.general").text(this_course.notes[1].content);
			$("#last_info .fakeContent.general").text(this_course.notes[1].content);
			$("#last_info").attr("data-active", length - 2);
		    }


		    $("#u_view").removeClass("hide");

		    var height = Math.max($("#last_info").outerHeight(true), $("#next_infoContainer").height());

		    $("#infoCont").css("height", height + "px");
		    $("#userInformation").css("height", height + "px");

		    $("#u_view").addClass("hide");

		} catch (err) {
		    error(TXT[system.lang].gen.error);
		    console.warn("Warning: User Overview encountered an error: " + err.message + " at line " + parseErrorLine(err));
		    sendErrorReport();
		    return false;
		}
		break;
	}

	try {
	    return o.success();
	} catch (err) {
	    return true;
	}
	;
    }

    function resetAllFields() {
	var remove = ["#u_over .name", "#u_over .startDate > div", "#u_over .courseInfo", "#week-table td", "#user-table", "#u_view .name", "#u_view .timeleft", "#u_view .notes-table td", "#userInformation .content", "#userSpecific"];

	$("#course-table").empty();
	$("#user-table").empty();

	for (var i = 0; i < remove.length; i++) {
	    $(remove[i]).empty();
	    if (remove[i] === "#u_view .notes-table td") {
		$(remove[i]).removeClass("yes")
			.removeClass("no")
			.removeClass("missingInfo")
			.removeClass("noCourse");
	    }
	}

	$("#c_view").addClass("hide");
	$("#u_view").addClass("hide");
	$("#u_over").addClass("hide");
    }

    // COURSE VIEW
    $(function() {

	$("#course-table").on("click", ".BOXcontainer", function() {

	    var $td = $(this).parents("td");

	    _activePos.course = $td.objectIndex();

	    if (_enableAnimation.generic && (!$td.hasClass("editing"))) {

                if(currentUser.clearance == 2){
                    createUI("users");
                    animateSectionsVertical({
                        start: "c_view",
                        end: "u_over"
                    });
                } else {
                    createUI("user");
                    animateSectionsVertical({
                        start: "c_view",
                        end: "u_view"
                    });
                }
	    }
	})
    });

    // USER OVERVIEW
    $(function() {

	$("#user-table").on("click", ".BOXcontainer", function() {

	    var $td = $(this).parents("td");

	    if (_enableAnimation.generic && (!$td.hasClass("editing"))) {

		_activePos.user = $td.objectIndex();

		createUI("user");
		animateSectionsVertical({
		    start: "u_over",
		    end: "u_view"
		});
	    } else if (!$td.hasClass("editing")) {
		if (typeof _enableAnimation.generic == "number") {
		    warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: function() {
			    _enableAnimation.main = _enableAnimation.main = true;
			    _activePos.user = $td.objectIndex();

			    createUI("user");
			    animateSectionsVertical({
				start: "u_over",
				end: "u_view"
			    });
			}});
		}
	    }
	})
		.on("click", ".info-icon svg", function() {
		    var $container = $(this).closest(".BOX"),
			    $infopanel = $container.find(".infopanel");

		    if (!$infopanel.hasClass("visible")) {
			setTimeout(function() {
			    $(document).on("click.infopanel", function(e) {
				if ((!$(e.target).closest($container).length) && (!$(e.target).closest($infopanel).length)) {
				    $infopanel.removeClass("visible");
				    $(document).off("click.infopanel");
				}
			    });
			}, 10);
		    }
		    $infopanel.toggleClass("visible");
		});

	$("#u_over .go_back").on("click", function() {
	    goBack("course");
	});
    });

    // USER VIEW
    $(function() {
	$("#u_view .go_back").on("click", function() {
	    goBack("user");
	});

	$("#u_view #notes-content").on("click", "table thead td", function() {

	    if (_enableAnimation.info) {
		_enableAnimation.info == false;
	    } else {
		return false;
	    }

	    var $el = $(this),
		    $tableContainer = $el.parents("table"),
		    offset = $el.index() + 1,
		    indxC = _activePos.course,
		    indx = (currentUser.clearance == 2) ? _activePos.user : 0;

	    var $info = $("#selectedInfoCont"),
		    $date = $info.find(".date"),
		    $day = $info.find(".day"),
		    $header = $info.find(".header"),
		    $infoContent = $info.find(".content.general ~ .content");
	    $infoFakeContent = $info.find(".fakeContent.general ~ .fakeContent");
	    $infoContentGen = $info.find(".content.general"),
		    $infoFakeContentGen = $info.find(".fakeContent.general"),
		    $userInfo = $("#userInformation");

	    var oldOffset = $("#infoCont").height(),
		    exactOffset = $userInfo.height(),
		    oldActive = $info.attr("data-active") * 1;

	    if ($tableContainer.hasClass("table-nr2")) {
		var offset = offset + 6;
	    }
	    ;

	    var active = (_temp.max_tframe - _activePos.tframe) * 12 + offset - 1;
	    var length = course[indxC].user[indx].notes.length;

	    function highlight($element) {
		console.log("Shake Shake...");
		if ($element.hasClass("animated")) {
		    return false;
		}
		$element.addClass("swing animated");

		setTimeout(function() {
		    $element.removeClass("swing animated");
		}, 1010);
	    }

	    function run(wait) {
		$date.text(course[indxC].notes[active].date.toLocaleDateString());

		var day = course[indxC].notes[active].date.getDay();
		if (day > 0) {
		    day--;
		} else {
		    day = 6;
		}
		;
		$day.text(TXT[system.lang].gen.time.week[day]);

		$header.text(course[indxC].notes[active].title);

		if (!$header.text().length) {
		    $header.text(TXT[system.lang].u.info.title[0]);
		}

		$infoContent.text(course[indxC].user[indx].notes[active].note);
		$infoFakeContent.html(course[indxC].user[indx].notes[active].note);
		$infoContentGen.text(course[indxC].notes[active].content);
		$infoFakeContentGen.html(course[indxC].notes[active].content);

		$info.removeClass("hide")
			.attr("data-active", active);

		$info.css("display", "inline-block")
			.css("width", "");
		$info.css("width", ($info.width() + 5) + "px")
			.css("display", "");

		var newOffset = $info.outerHeight(true);

		$userInfo.transition("none");
		$userInfo.css("height", oldOffset + "px");

		$userInfo.transition("");
		setTimeout(function() {
		    $userInfo.css("height", (oldOffset + newOffset) + "px");
		}, 1);

		wait = (wait === true) ? true : false;
		if (wait) {
		    setTimeout(function() {
			$info.transform("translateY(0)")
				.css("opacity", 1);

			setTimeout(function() {
			    _enableAnimation.info = true;
			}, 400);
		    }, 500);
		} else {
		    $info.transform("translateY(0)")
			    .css("opacity", 1);

		    setTimeout(function() {
			_enableAnimation.info = true;
		    }, 400);
		}
	    }

	    if ((active > length - 1) || ($tableContainer.is("#notes-table_addon"))) {
		return false;
	    } else if (active === length - 1) {
		highlight($("#next_info"));
		return false;
	    } else if (active === length - 2) {
		highlight($("#last_info"));
		return false;
	    } else if (active === ((typeof oldActive == "number") ? oldActive : -1)) {
		highlight($info);
		return false;
	    }

	    if ($info.hasClass("hide")) {
		$info.transition("none");
		$info.transform("translateY(-100px)");
		$info.transition("");
		run(true);
	    } else {
		$info.transform("translateY(-100px)")
			.css("opacity", "");

		setTimeout(function() {
		    run();
		}, 400);
	    }

	    return true;
	});

	$("#u_view #notes-content").on("click", ".go_side_cont", function() {

	    var this_user = {
		notes: []
	    },
	    indxC = _activePos.course,
		    indx = (currentUser.clearance == 2) ? _activePos.user : 0;

	    for (var i = 0; i < course[indxC].user[indx].notes.length; i++) {
		this_user.notes[i] = {
		    date: new Date(course[indxC].user[indx].notes[i].date.getTime()),
		    attendance: course[indxC].user[indx].notes[i].attendance
		};
	    }

	    this_user.notes.reverse();

	    var $el = $(this).parent().parent(),
		    safeToRemove = false,
		    $container = $("#notes-content");

	    if ($(this).hasClass("go_sideL")) {

		// TO-DO: Add custom offset
		_activePos.tframe++;

		_temp.lastInArray = (12 * _activePos.tframe) + _temp.lastInTable;

		$container.prepend(createNewElement({select: "notes-wrapper"}));
		$elNew = $container.find(".notes-wrapper:first-child");

		$elNew.transition("")
			.transform("translateX(-100%)");

		if (_activePos.tframe == _temp.max_tframe) {
		    $elNew.find(".go_sideL").hide();
		} else {
		    $elNew.find(".go_sideL").show();
		}

		var $firstTable = $elNew.find(".notes-table").eq(0);
		var $secondTable = $elNew.find(".notes-table").eq(1);

		createTable(this_user, $firstTable, $secondTable);

		$el.transform("translateX(100%)");
		$elNew.transition("transform 0.5s")
			.transform("translateX(0)");

		if (_activePos.tframe != 1) {
		    var safeToRemove = true;
		}

		setTimeout(function() {
		    if (safeToRemove) {
			$el.remove();
		    }
		}, 500);

	    } else {

		// TO-DO: Add custom offset
		_activePos.tframe--;

		_temp.lastInArray = (12 * _activePos.tframe) + _temp.lastInTable;

		if (_activePos.tframe > 0) {
		    $container.prepend(createNewElement({select: "notes-wrapper"}));
		    $elNew = $container.find(".notes-wrapper:first-child");

		    $elNew.transition("")
			    .transform("translateX(100%)");

		    var $firstTable = $elNew.find(".notes-table").eq(0);
		    var $secondTable = $elNew.find(".notes-table").eq(1);

		    createTable(this_user, $firstTable, $secondTable);

		    $el.transform("translateX(-100%)");
		    $elNew.transition("transform 0.5s");

		    setTimeout(function() {
			$elNew.transform("translateX(0)");
		    }, 1);

		} else {
		    $el.transform("translateX(-100%)");
		    $("#notes-wrapper_main").transform("translateX(0)");
		}

		setTimeout(function() {
		    $el.remove();
		}, 500);

	    }
	});

    });
    
    // Prevent use of styling in ContentEditable Areas
    $("*").on("keydown", "[contenteditable='true']", function(e) {
	function matchesCmd(e) {
	    // If A,C or V are pressed
	    if ((e.which == 65) || (e.which == 67) || (e.which == 86)) {
		return false;
	    }
	    return e.ctrlKey;
	}

	if (matchesCmd(e)) {
	    e.preventDefault();
	    e.stopPropagation();
	}
    });

    // Document Events
    $(window).one("hashchange", function () {
        $(document).off("loggedOut");
        $(document).off("saveData");
    })
    $(document).on("loggedOut", function() {
		var el;

		switch ($("section").isActive()) {
		    case 0:
			el = "#c_view";
			break;
		    case 1:
			el = "#u_over";
			break;
		    case 2:
			el = "#u_view";
			break;
		}

		preventScrolling(el);

		$("#fake-u_view").css("opacity", "");
		$("#scroll").transition("transform 1s");
		$("#scroll").transform("translateY(680px)");

		$("#scroll").one("transitionend", function() {
		    $("#fake-u_view").css("height", "");
		    $("#scroll").transition("");
		    $("#scroll").transform("");
		});

		$("#people-content").removeClass("hidden");

		setTimeout(function() {
		    resizeContent();
		    resetAllFields();
		}, 1000);
	    })
	    .on("saveData", function() {
		clearTimeout(timer.uploading);
        
		switch ($("section").isActive()) {
		    case 0:
			$(document).trigger("readyForUpload");
			break;
		    case 1:
			goBack("course", false);
			break;
		    case 2:
			goBack("user", false);
			break;
		}
	    });
});