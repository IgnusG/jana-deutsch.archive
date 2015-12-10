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
            // What dates are marked as vacation -> Compared
            noCourseMarker: {
                // Before the editing starts - built upon Userview initiation
                before: [],
                // After - build upon exiting Userview
                after: []
            },
            // If iSaw should be updated when missing dates
            updateNotes: false,
            week: [],
            reload: [
                // Reload courseView section because of a simplEdit
                false,
                // Reload userOverview section because of a simplEdit
                false
            ]
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

        createUI({of: "course"});
        
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

            $("#c_view").removeClass("hide");

            setTimeout(function () {
                resizeContent();
            }, 1000);
        } else {
            $("#fake-u_view").transition("none");
            $("#fake-u_view").css("opacity", "0");
            $("#fake-u_view").transition("");

            $("#fake-u_view").css("height", "0");

            $("#people-content").addClass("hidden");
            $("#c_view").removeClass("hide");
        }

        system.animLogin = false;
        
        $(document).off("click.selection");
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
            
            for(var i = 0; i < 7; i++){
                if(course[ID_C].tt[i] != ""){
                    break;
                }
                if(i == 6){
                    stopExec = true;
                    console.warn("No Dates Detected - exiting");
                }
            }

	    while ((start <= today)&&(!stopExec)) {
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

    function checkObject(input, type, all) {

	all = (all == null) ? false : all;
	var out = 0;

	switch (type) {
	    case "course":
		for (var i = 0; i < course.length; i++) {
		    if (course[i].name == input) {
			out += 1;
		    }
		}
		break;
	    case "user":
		for(var i = 0; i< user.length; i++){
		    if(user[i].name == input){
			out += 1;
		    }
		}
		break;
	    case "username":
		var clickr = (!all) ? 0 : all,
			temp = clickr;
		var newinput = (!clickr) ? input : input + "-" + clickr;

		for (var i = 0; i < user.length; i++) {
		    if (user[i].username == newinput) {
			clickr++;
			break;
		    }
		}

		if (clickr - temp > 1) {
		    error(TXT[system.lang].gen.error);
		    console.error("Error 9: Username colision detected");
		    sendErrorReport();
		}
		if (clickr == temp) {
		    return newinput
		}
		;
		return checkObject(input, "username", clickr);
	}
	return out;
    }

    function createNewData(attr) {
	var name = attr.name;

	switch (attr.type) {
	    case "course":
		course[course.length] = {
                    id: ID("course"),
		    name: name,
		    tt: ["", "", "", "", "", "", ""],
		    info: TXT[system.lang].c.info,
		    startdate: new Date(),
		    notes: [],
		    user: []
		};
		course.last().startdate.setHours(12, 0, 0, 0);

		var day = course.last().startdate.getDay(),
			indxC = course.length - 1;

		if (day > 0) {
		    day--
		} else {
		    day = 6
		}
		;

		course.last().tt[day] = "12:00";

		createMatchedToDate({course: indxC});

		break;
	    case "user":
		var indxC = _activePos.course,
			noCourse = [];
                
               attr.clearance = (attr.clearance == null) ? 4 : attr.clearance;

		course[indxC].user[course[indxC].user.length] = {
		    id: ID("user"),
		    notes: []
		};
		user[user.length] = {
                    id: course[indxC].user.last().id,
		    name: name,
		    username: checkObject(name.toLowerCase().replace(/ /g, "_").replace(/\W/g, ""), "username"),
		    password: randomString(6),
		    include_course: [course[indxC].id],
		    clearance: attr.clearance
		};

		if (course[indxC].user.length > 1) {
		    for (var i = 0; i < course[indxC].user[0].notes.length; i++) {
			if (course[indxC].user[0].notes[i].attendance == -2) {
			    noCourse.push(i);
			}
		    }
		}

		for (var i = 0; i < course[indxC].notes.length; i++) {
		    // Create a new entry
		    course[indxC].user.last().notes[i] = {
			date: new Date(course[indxC].notes[i].date.getTime()),
			attendance: -1,
			note: TXT[system.lang].u.info.content
		    };
		}

		for (var i = 0; i < noCourse.length; i++) {
		    course[indxC].user.last().notes[noCourse[i]].attendance = -2;
		}

		break;
	    case false:
		return false;
	}
	return true;
    }

    function propagateNewStartDate(courseID) {
	var courseID = (courseID == null) ? _activePos.course : courseID,
		this_course = course[courseID],
		these_notes = this_course.notes;

	while (these_notes[0].date < this_course.startdate) {
	    these_notes.shift();
	    for (var i = 0; i < this_course.user.length; i++) {
		this_course.user[i].notes.shift();
	    }
	    if (!these_notes.length) {
		break
	    }
	}

	if (these_notes.length) {
	    if (these_notes[0].date != this_course.startdate) {
		these_notes.unshift({
		    date: new Date(this_course.startdate.getTime()),
		    content: TXT[system.lang].u.info.content,
		    title: ""
		})
	    }
	    ;
	}

	updateNotesArray("active", true);
    }

    function propagateNewWeek() {
	var selector = 0;

	var $options = $("#week-options"),
		$save = $("#u_over .saveButton"),
		$reset = $("#u_over .resetButton"),
		$cover = $("#week-optionsCover");

	$options.find("#cb1").trigger("click");

	$options.show();

	setTimeout(function() {
	    $options.addClass("shown");
	    $reset.removeClass("shown").delay(550).hide(0);
	    $save.addClass("moved");
	}, 1);
	$cover.show();

	$options.find("input").on("change", function() {
	    selector = $(this).parent().index();
	});

	$save.one("click.saveWeek", function() {
	    $options.removeClass("shown").delay(550).hide(0);
	    $save.removeClass("moved shown").delay(550).hide(0);
	    switch (selector) {
		case 0:
		    updateNotesArray("active");
		    break;
		case 1:
		    updateNotesArray("active", true);
		    break;
		case 2:
		    updateNotesArray("active", true, true);
		    break;
	    }

	    _temp.week = course[_activePos.course].tt.slice(0);

	    $cover.hide();
	    _enableAnimation.main = true;
	    _enableAnimation.generic = true;
	});
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

    function saveValue($element, orgText, simpl) {
	simpl = (simpl) ? true : false;

	var text = $element.text();

	var foundObjects,
		selector = (simpl) ? $("section").isActive() - 1 : $("section").isActive();

	switch (selector) {
	    case 0:
		foundObjects = checkObject(text, "course", false);
		selectedText = TXT[system.lang].c.top;
		break;
	    case 1:
		foundObjects = checkObject(text, "user", false);
		selectedText = TXT[system.lang].u.top
		break;
	}

	function save() {
	    var index = (simpl) ? (!selector) ? _activePos.course : _activePos.user : $element.parents("td").objectIndex();

	    // Save accordingly
	    switch (selector) {
		case 0:
		    $(function() {
			console.log("LOG 14: SAVE COURSE [" + text + "]");
			course[index].name = text;
		    });
		    break;
		case 1:
		    $(function() {
			var $username = $element.parents(".BOX").find(".username");
			console.log("LOG 14: SAVE USER [" + text + "]");
			if (orgText != text) {
			    
			    index = ID("user",course[_activePos.course].user[index].id);
			    
			    user[index].name = text;
			    user[index].username = checkObject(text.toLowerCase().replace(/ /g, "_").replace(/\W/g, ""), "username");
			    $username.text(user[index].username);
			}
		    });
		    break;
	    }
	}

	// If the length is 0 or name exists show warning
	if ((text.length == 0) || (((foundObjects > 0) && (orgText != text)) || ((foundObjects > 1) && (orgText == text)))) {
	    if (text.length == 0) {
		warn({
                    error: true,
		    message: TXT[system.lang].gen.alert.empty[0] + selectedText + TXT[system.lang].gen.alert.empty[1],
		    closeWhenever: true,
		    rush: true,
		    hideButtons: true
		});
		// Always error - return false
		return false;
		// If the values are different but we found an occurance or
		// if they are the same and this is not the same course
	    } else {
		warn({
		    message: TXT[system.lang].gen.alert.another[0] + selectedText + TXT[system.lang].gen.alert.another[1] + selectedText + TXT[system.lang].gen.alert.another[2],
		    confirm: true,
		    ifTrue: save
		});

		return 0;
	    }
	}

	save();
	return true;
    }

    function startEditor($element, fnc, selectAll) {
	// $element td 
	$element.addClass("editing");
	// course div
	var $text = $element.find(".user span, .course span"),
		$container = $text.parent(),
		$username = $element.find(".username");

	if (typeof fnc == "boolean") {
	    selectAll = fnc;
	}

	var width = $text.innerWidth(),
		height = $container.innerHeight(),
		exit = false,
		infopanel = false,
		editorTimer;

	var orgText = $text.text();

	if ($("section").isActive() == 1) {
	    var orgUsername = $username.text();
	    infopanel = true;

	    setTimeout(function() {
		//$(document).off("click");
		$element.find(".infopanel").addClass("visible");
	    }, 100);
	}

	// We enable editing and move the text to the center so it isn't covered by the overlay menu
	$text.attr("contenteditable", "true")
		.focus()
		.transform("translateX(0)");

	var sel = window.getSelection(),
		range = sel.getRangeAt(0),
		reg = new RegExp("^(?:" + TXT[system.lang].c.top + "|" + TXT[system.lang].u.top + ") \\d$");

	if (reg.test($text.text()) || selectAll) {
	    document.execCommand('selectAll', false, null);
	} else {
	    range.setStart(range.startContainer, range.startContainer.length);
	    range.collapse(true);

	    sel.removeAllRanges();
	    sel.addRange(range);
	}

	$text.focus();
	$text.on("blur", function() {
	    // If we receive confirmation to proceed we disable COPS and return true indicating no error
	    function tryToCloseEditor(selector) {
		if (selector) {
		    $text.off("blur");

		    _enableAnimation.scroll = true;

		    if (exit) {
			$username.text(orgUsername);
			$text.text(orgText);
		    }

		    $text.attr("contenteditable", "false");

		    $text.text($text.text());

		    $element.removeClass("editing");
		    $container.transition("");

		    $text.transform("");

		    document.execCommand("Unselect");
		    $text.scrollTop(0);

		    $text.off("keydown").off("keyup");

		    if ($element.find(".password").hasClass("protected")) {
			$element.find(".infopanel").removeClass("visible");
		    } else {
			if ($element.find(".warning.alert").hasClass("visible")) {
			    $element.find(".warning.alert").addClass("dontHide");
			} else {
			    $element.find(".warning.alert").addClass("visible");
			}

			setTimeout(function() {
			    if ($element.find(".warning.alert").hasClass("dontHide")) {
				$element.find(".warning.alert").removeClass("dontHide");
				$element.find(".warning.alert").addClass("visible");
				$element.find(".infopanel").addClass("visible");
				return false;
			    }
			    $element.find(".warning.alert").removeClass("visible");
			    setTimeout(function() {
				if (!$element.hasClass("editing")) {
				    $element.find(".infopanel").removeClass("visible");
				}
			    }, 500);
			}, 2000);
		    }

		    if (typeof fnc == "function") {
			fnc()
		    }

		    return true;
		} else {
		    // Otherwise we select the whole text, focus again and wait for input;
		    $text.focus();

		    if (typeof editorTimer == "number") {
			return false
		    }

		    $element.addClass("animated swing");
		    editorTimer = setTimeout(function() {
			editorTimer = "";
			$element.removeClass("animated swing");
		    }, 1000);

		    document.execCommand('selectAll', false, null);
		}
	    }

	    if (exit) {
		return tryToCloseEditor(true);
	    }

	    var selector = saveValue($text, orgText);
	    if (selector === 0) {
		$("#warn").one("selected", function(event, selector) {
		    if (selector) {
			tryToCloseEditor(true);
		    } else {
			tryToCloseEditor(false);
		    }
		});
	    } else {
		if (selector) {
		    tryToCloseEditor(true);
		} else {
		    tryToCloseEditor(false);
		}
	    }
	});
	$text.on("keydown", function(e) {
	    switch (e.which) {
		case 13:
		    e.preventDefault();
		    e.stopPropagation();
		    $text.blur();
		    break;
		case 27:
		    exit = true;
		    $text.blur();
		    break;
	    }
	    ;
	});

	if (infopanel) {
	    $text.on("keyup", function() {
		if ($text.text() != orgText) {
		    $username.text(checkObject($text.text().toLowerCase().replace(/ /g, "_").replace(/\W/g, ""), "username"));
		} else {
		    $username.text(orgUsername);
		}
	    });
	}
    }

    function deleteBox($element) {
	warn({message: TXT[system.lang].gen.remove, confirm: true, ifTrue: function() {
		// We find the td parent
		var $td = $element,
			trIndx = $td.parent().index(),
			trLastIndx = $td.parents("tbody").children("tr:last-child").index();

		// Save accordingly
		switch ($("section").isActive()) {
		    case 0:
			
			// Delete active course entries from this user
			for(var i = 0;i<course[$td.objectIndex()].user.length;i++){
			    var index = ID("user", course[$td.objectIndex()].user[i].id);
			    
			    user[index].include_course.splice(user[index].include_course.indexOf(course[$td.objectIndex()].id),1);
			    
			    // If this was the last/only course, delete the user
			    if (!user[index].include_course.length) {
				user.splice(index, 1);
			    }
			}
			
			course.splice($td.objectIndex(), 1);
			$td.remove();

			while ((trIndx + 1) <= trLastIndx) {
			    $node = $("#course-table tr").eq(trIndx + 1).children("td").eq(0);
			    $("#course-table tr").eq(trIndx).append($node.clone().wrap("<p>").parent().html());
			    $node.remove();
			    trIndx += 1;
			}

			if ($("#course-table tr:last-child").children().length == 0) {
			    $("#course-table tr:last-child").remove();
			}
			break;
		    case 1:
			var index = ID("user",course[_activePos.course].user[$td.objectIndex()].id);
			
			user[index].include_course.splice(user[index].include_course.indexOf(course[_activePos.course].id),1);
			
			if(!user[index].include_course.length){
			    user.splice(index,1);
			}
			
			course[_activePos.course].user.splice($td.objectIndex(), 1);
			$td.parent().remove();
			break;
		}
	    }});
	return true;
    }

    function startSettings($element) {
	// Not yet implemeneted
	return false;
    }

    function startSimpleEditor($el, selectAll) {
	if ($el.attr("contenteditable") == "true") {
	    return false;
	}

	$el.addClass("JS_psaccess_colorChange")
		.attr("contenteditable", "true")
		.focus();

	var sel = window.getSelection(),
		range = sel.getRangeAt(0),
		exit = false,
		orgText = $el.text();

	if ((($el.hasClass("info")) && ($el.text() == TXT[system.lang].c.info)) || selectAll) {
	    document.execCommand('selectAll', false, null);
	} else {
	    range.setStart(range.startContainer, range.startContainer.length);
	    range.collapse(true);

	    sel.removeAllRanges();
	    sel.addRange(range);
	}

	$el.on("blur", function() {

	    // If we receive confirmation to proceed we disable COPS and return true indicating no error
	    function tryToCloseEditor(selector) {
		if (selector) {

		    $el.removeClass("JS_psaccess_colorChange")
			    .attr("contenteditable", "false");

		    $el.text($el.text());

		    _temp.reload[$("section").isActive() - 1] = true;

		    $el.off("blur").off("keydown");

		    return true;
		} else {
		    // Otherwise we select the whole text, focus again and wait for input;
		    $el.focus();

		    if (typeof simplEditorTimer == "number") {
			return false
		    }

		    $el.addClass("animated swing");
		    simplEditorTimer = setTimeout(function() {
			simplEditorTimer = "";
			$el.removeClass("animated swing");
		    }, 1000);

		    document.execCommand('selectAll', false, null);
		}
	    }

	    if (exit) {
		return tryToCloseEditor(true);
	    }

	    if ($el.hasClass("name")) {

		var selector = saveValue($el, orgText, true);
		if (selector === 0) {
		    $("#warn").one("selected", function(event, selector) {
			if (selector) {
			    tryToCloseEditor(true);
			} else {
			    tryToCloseEditor(false);
			}
		    });
		} else {
		    if (selector) {
			tryToCloseEditor(true);
		    } else {
			tryToCloseEditor(false);
		    }
		}

	    } else if ($el.hasClass("courseInfo")) {
		if ($el.text() == "") {
		    $el.text(TXT[system.lang].c.info);
		}
		course[_activePos.course].info = $el.text();

		tryToCloseEditor(true);
	    }

	});
    }

    function startTimeEditor($container) {
	var allowClickr = false;

	// Fade in Controlls
	var $arrows = $container.find(".arrow_container"),
		$hours = $container.find(".hours"),
		$minutes = $container.find(".minutes");

	$container.addClass("editing");

	var orgText = [],
		exit = false,
		s;

	orgText.push($hours.text());
	orgText.push($minutes.text());

	function clickr(a) {

	    var hours = $hours.text(),
		mins = $minutes.text();
	
	    mins = mins * 1 + a;

	    if ((mins > 59) || (mins < 0)) {
		hours = hours * 1 + Math.floor(mins / 60);
		mins = mins % 60;

		mins = (mins < 0) ? 60 + mins : mins;
		hours = (hours > 23) ? 0 : (hours < 0) ? 23 : hours;
	    }
	    ;

	    mins = Math.abs(mins);

	    hours = (hours < 10) ? "0" + (hours * 1) : hours;
	    mins = (mins < 10) ? "0" + mins : mins;

	    $hours.text(hours);
	    $minutes.text(mins);
	}

	$arrows
		.on("mousedown", function(e) {

		    if (e.which == 1) {

			_temp.updateNotes = true;

			allowClickr = true;
			var $el = $(this),
				n = 1,
				time = 200;

			if ($el.hasClass("arrow_up")) {
			    var director = 1,
				    step = 1;
			} else {
			    var director = -1,
				    step = -1;
			}

			function clickrInit() {
			    clickr(step);
			    step = Math.abs(step) * director;
			    n++;

			    setTimeout(function() {
				if (allowClickr == true) {
				    clickrInit()
				}
				;
			    }, time);
			}

			clickrInit();
		    }
		})
		.on("mouseup", function(e) {

		    if (e.which == 1) {
			allowClickr = false;
		    }
		});

	function stopEditTime() {
	    $container.off("click");
	    $(document).off("keyup.timeEditor");

	    $hours.css("font-size", "1em");
	    $minutes.css("font-size", "1em");

	    switch (s) {
		case 1:
		    $hours.text("0" + $hours.text());
		    break;
		case 3:
		    $minutes.text("0" + $minutes.text());
		    break;
	    }

	    s = 0;
	}

	function closeEditTime() {
	    $(document).off("click.timeEditor").off("keydown.timeEditor");

	    $arrows.off("mousedown")
		    .off("mouseup");

	    $hours.off("click");
	    $minutes.off("click");

	    stopEditTime();

	    if (exit) {
		$hours.text(orgText[0]);
		$minutes.text(orgText[1]);
	    } else {
		course[_activePos.course].tt[$container.index()] = $hours.text() + ":" + $minutes.text();
	    }

	    $container.removeClass("editing");

	    saveForWeek(true);
	}

	function startEditTime($el) {
	    $(document).on("keyup.timeEditor", function(key) {

		editTime(key);

		switch (s) {
		    case 2:
			$hours.css("font-size", "1em");
			$minutes.css("font-size", "1.5em");
			break;
		    case 4:
			$(document).off("keyup.timeEditor");
			$minutes.css("font-size", "1em");
			break;
		}
	    });

	    $container
		    .on("click", function(event) {
			if (!$(event.target).closest($el).length) {
			    stopEditTime();
			}
		    });
	}

	function editTime(key) {

	    if ((key.which > 47) && (key.which < 58)) {
		var offset = 48;
	    } else if ((key.which > 95) && (key.which < 106)) {
		var offset = 96;
	    } else {
		var offset = 0;
	    }

	    if (offset != 0) {

		var keys = key.which - offset;

		switch (s) {
		    case 0:
			if (keys > 2) {
			    s = 2;
			    $hours.text("0" + keys);
			    return true;
			}
			;
			break;
		    case 1:
			if ($hours.text() == "2") {
			    if (keys > 4) {
				return false
			    }
			    ;
			}
			;
			break;
		    case 2:
			if (keys > 5) {
			    s = 4;
			    $minutes.text("0" + keys);
			    return true;
			}
			;
			break;
		}
		s++;

		if (s < 3) {
		    $element = $hours;
		} else {
		    $element = $minutes;
		}

		if ((s == 1) || (s == 3)) {
		    $element.empty()
		}
		;
		$element.text($element.text() + (key.which - offset));

		if ($hours.text() == "24") {
		    $hours.text("00");
		}

		return true;
	    }

	}

	s = 0;
	$hours.css("font-size", "1.5em");
	startEditTime($hours);

	$hours.on("click", function() {
	    setTimeout(function() {
		stopEditTime();

		$hours.css("font-size", "1.5em");

		s = 0;

		startEditTime($hours);
	    }, 1);
	});

	$minutes.on("click", function() {
	    setTimeout(function() {
		stopEditTime();

		$minutes.css("font-size", "1.5em");

		s = 2;

		startEditTime($minutes);
	    }, 1);
	});

	$(document).on("click.timeEditor", function(event) {

	    if (!$(event.target).closest($container).length) {

		closeEditTime();
	    }
	}).on("keydown.timeEditor", function(e) {
	    switch (e.which) {
		case 13:
		    closeEditTime();
		    break;
		case 27:
		    exit = true;
		    closeEditTime();
		    break;
	    }
	    ;
	});
    }

    function saveForWeek(showButtonNow) {
	_enableAnimation.generic = _enableAnimation.main = 0;
	var $saveContainer = $("#u_over .saveButton, #u_over .resetButton");

	$saveContainer.show();

	setTimeout(function() {
	    if (showButtonNow) {
		$saveContainer.addClass("shown");
	    }
	}, 1);
    }

    function createSVG() {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	return svg;
    }

    function controlRadiobox($el, i) {
	var svg = createSVG();
	$el.parent().append($(svg));
	$el.on('change', function() {
	    resetRadio($el);
	    draw($el);
	});

	if ($el.attr("checked")) {
	    draw($el)
	}
	;

	var $parent = $el.parent(),
		$div = $parent.find("div"),
		$captcha = $("#stringCaptcha");

	$div.text(TXT[system.lang].u.weekOptions[i]);
	$captcha.text($div.text());

	var height = $captcha.height();

	$parent.css("height", (height + 2) + "px");
    }

    function resetRadio($el) {
	var $path = $el.parent().parent().find('svg > path');
	$el.parent().parent().children("li").css("color", "");
	$path.remove();
    }
    ;

    function draw($el) {
	var path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
		pathDef = 'M34.745,7.183C25.078,12.703,13.516,26.359,8.797,37.13 c-13.652,31.134,9.219,54.785,34.77,55.99c15.826,0.742,31.804-2.607,42.207-17.52c6.641-9.52,12.918-27.789,7.396-39.713 C85.873,20.155,69.828-5.347,41.802,13.379',
		animDef = {speed: 0.3, easing: 'ease-in-out'},
	$svg = $el.parent().children('svg');

	$svg.append($(path));

	$(path).attr('d', pathDef);

	var length = path.getTotalLength();

	$(path).css({"stroke-dasharray": length + ', ' + length, "stroke-dashoffset": length});
	path.getBoundingClientRect();

	// Define our transition
	$(path).transition('stroke-dashoffset ' + animDef.speed + 's ');

	setTimeout(function() {
	    $(path).css("stroke-dashoffset", 0);
	}, 10);

	$el.parent().css("color", "black");
    }

    $('#week-options input').each(function(i) {
	var $el = $(this);
	controlRadiobox($el, i)
    });

    $("#week-options ul li").each(function(indx) {
	$("#week-options ul").css("height", ($("#week-options ul").height() + $(this).height() + ((indx == 2) ? 40 : 0)) + "px");
    })

    if (system.browser == "firefox") {
	$("#week-options ul").css("top", "-50%");
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
                        $(end).transition("");

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

    function goBack(from, animate) {
	animate = (animate == false) ? false : true;
	switch (from) {
	    case "course":
		$(function() {

		    function _goBack() {
			_enableAnimation.main = true;
			_activePos.course = false;

			if (_temp.reload[$("section").isActive() - 1]) {
			    _temp.reload[$("section").isActive() - 1] = false;
			    createUI("course");
			}
			if (animate) {
			    animateSectionsVertical({
				start: "u_over",
				end: "c_view",
				type: "backward"
			    });
			} else {
			    $(document).trigger("readyForUpload");
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
			    indx = _activePos.user;

		    var n = 0;

		    function _goBack() {
			_enableAnimation.main = true;

			var $el = $("#notes-content").find(".notes-wrapper");

			$el.transform("translateX(-100%)");
			$("#notes-wrapper_main").transform("translateX(0)");

			setTimeout(function() {
			    $el.remove();
			}, 600);

			_activePos.tframe = 0;
			_temp.lastInArray = _temp.lastInTable;
			$("#notes-wrapper_main").show();

			_temp.noCourseMarker.after.splice(0, _temp.noCourseMarker.after.length);
			_temp.noCourseMarker.before.splice(0, _temp.noCourseMarker.before.length);

			_activePos.user = false;

			if (_temp.reload[$("section").isActive() - 1]) {
                            _temp.reload[$("section").isActive() - 1] = false;
			    createUI("users");
			}
			;

			setTimeout(function() {
			    $("#selectedInfoCont").addClass("hide")
				    .attr("data-active", "");
			}, 600);
                        
			if (animate) {
			    animateSectionsVertical({
				start: "u_view",
				end: "u_over",
				type: "backward"
			    });
			} else {
			    $(document).trigger("readyForUpload");
			}
		    }

		    if ((_temp.noCourseMarker.after.length > 0) && (course[_activePos.course].user.length > 1)) {
			warn({message: TXT[system.lang].u.alert.holly[0] + TXT[system.lang].u.alert.holly[1], confirm: true, ifTrue: function() {

				for (var i = 0; i < course[indxC].user.length; i++) {
				    for (var k = 0; k < _temp.noCourseMarker.after.length; k++) {
					var current = _temp.noCourseMarker.after[k];
					course[indxC].user[i].notes[current].attendance = -2;
				    }
				}

				if (_enableAnimation.generic) {
				    _goBack();
				} else {
				    if (typeof _enableAnimation.generic == "number") {
					warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: _goBack});
				    }
				}
			    }, ifFalse: function() {
				_enableAnimation.generic = true;
				console.log("TO-DO: Find nearest changed element");
			    }});
		    } else {
			if (_enableAnimation.generic) {
			    _goBack();
			} else {
			    if (typeof _enableAnimation.generic == "number") {
				warn({message: _string.goBackToken, confirm: true, closeWhenever: true, ifTrue: _goBack});
			    }
			}
		    }
		})
		break;
	}
    }

    function createNewElement(attr) {

	var name = (attr.name == null) ? "[System Error: Not Provided]" : attr.name;
        
	switch (attr.select) {
	    case "course":
		return "<div class='BOX courseBox'><div class='tools'><svg style='width: 20px; height: 20px' class='icon' viewBox='0 0 512 512'><use xlink:href='#edit-icon'></svg><svg style='width: 20px; height: 20px' class='icon' viewBox='-206 -205.997 512 511.996'><use xlink:href='#delete-icon'></svg><svg style='width: 20px; height: 20px' class='icon' viewBox='256.001 256.007 512 511.986'><use xlink:href='#settings-icon'></svg></div><div class='BOXcontainer'><div class='course'><span>" + name + "</span></div></div></div>"
	    case "new-box":
		return "<div class='new-box' ><div class='addIcon-contain center-abs'><svg viewBox='-220.058 -220.05 540.111 540.101'><use xlink:href='#add-icon'></svg></div></div>"
	    case "new-box-copy":
		return "<div class='new-box-copy'><div class='addIcon-contain center-abs'><svg viewBox='-220.058 -220.05 540.111 540.101'><use xlink:href='#add-icon'></svg></div></div>"
	    case "flip-container":
		return "<td class='holdPerspective_" + attr.style + "Box_Flip'><div style='width: inherit; height: 100%; position: relative'><div id='cover-face'></div><div id='flip-transition' class='hide' style='-webkit-transform-style: preserve-3d'><div id='front-face'></div><div id='back-face'></div></div></div></td>"
	    case "user":
		return "<div class='BOX userBox'><div class='tools'><svg style='width: 20px; height: 20px' class='icon' viewBox='0 0 512 512'><use xlink:href='#edit-icon'></use></svg><svg style='width: 20px; height: 20px' class='icon' viewBox='-206 -205.997 512 511.996'><use xlink:href='#delete-icon'></use></svg></div><div class='BOXcontainer'><div class='user'><span>" + name + "</span></div></div><div class='info-icon icon'><svg viewBox='0 0 16 16'><use xlink:href='#info-icon'></use></svg></div><div class='infopanel'><div><div>" + TXT[system.lang].gen.login.user + ": </div><div>" + TXT[system.lang].gen.login.pass + ": </div></div><div><div><span class='username'></span></div><div class='passwordContainer'><span class='password'></span><div class='warning'></div></div></div></div></div>";
	    case "notes-wrapper":
		return "<div class='notes-wrapper'> <div class='center-horiz' style='width: 600px;position:relative;'><div class='go_side_cont go_sideL icon'><div class='go_side center-vert'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></svg></div></div><div class='go_side_cont go_sideR icon'><div class='go_side center-vert'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></svg></div></div>" + createNewElement({select: 'notes-table', name: 1}) + "<div style=' width: 100%;height: 25px;'></div>" + createNewElement({select: 'notes-table', name: 2}) + "</div></div>";
	    case "notes-table":
		return "<table class='notes-table table-nr" + name + "'><thead><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>";
	    case "week-table_cell":
		var nameParsed = name.split(":");
		return "<div class='arrow_container arrow_up'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></use></svg></div><div style='height: 6px'></div><span><div class='hours'>" + nameParsed[0] + "</div>:<div class='minutes'>" + nameParsed[1] + "</div></span><div style='height: 6px'></div><div class='arrow_container arrow_down'><svg class='icon' viewBox='0 0 204.841 300.645'><use xlink:href='#fullarrow-icon'></use></svg></div><div class='deleteDay'><svg class='icon' viewBox='-206 -205.997 512 511.996'><use xlink:href='#delete-icon'></use></svg></div>"
	    case "circle":
		return "<div class='circleContainer' data-active='" + name + "''><div class='coverEntire'></div><div class='coverSmall'></div><div class='circle'></div><div class='date'></div><div class='cancel'><svg class='icon' viewBox='-206 -205.997 512 511.996'><use xlink:href='#delete-icon'></use></svg><span>" + TXT[system.lang].u.cancel + "</span></div><div class='center-abs innerCircle'></div></div>";
	    case "line":
		return "<div class='line'><div class='center-vert'></div></div>";
	    case "complex_line":
		return "<div class='lineContainer'>" + createNewElement("line") + "<div class='nextWeekMarker'><div><div>" + TXT[system.lang].gen.time.nextWeek + "</div></div></div>" + createNewElement("line") + "</div>";
            case "settings_text": 
                return "<div class='formContainer'><span>Name</span><input class='text'><div class='warning'>"+attr.name+"</div></div>";
            case "settings_checkbox":
                return "<div class='formContainer'><span>"+attr.name+"</span><input type='checkbox' class='checker'><div class='checkerBox'></div></div>";
            case "settings_none":
                return "<div class='lower pushDown'>"+TXT[system.lang].gen.settings.none+"</div>";
            case "settings_outage":
                // Localization needed!
                var timespan = (Math.ceil((attr.date.getTime() - today.getTime())/(24*60*60*1000)));
                return "Systemstörung - Seite wird am <span style='color: orange' class='date1'>"+attr.date.toLocaleDateString()+"</span> in <span style='color: orange' class='date2'>"+timespan+" "+((timespan > 1) ? TXT[system.lang].gen.time.inDays[2] : (timespan == 1) ? TXT[system.lang].gen.time.tomorrow : TXT[system.lang].gen.time.today)+"</span> von  <span style='color: orange' class='date3'>"+ attr.time[0] +" bis "+attr.time[1]+"</span> Uhr offline sein!";
        }
        error("Not Found!");
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
		
		if ($("#course-table tr:last-child td:last-child").index() == 2) {
		    $("#course-table").append("<tr></tr>");
		}
		
		$("#course-table:empty").append("<tr></tr>");
		    
		$("#course-table tr:last-child").append(createNewElement({select: "flip-container", style: "big"}));
		$("#c_view #cover-face").append(createNewElement({select: "new-box"}));
		$("#c_view .new-box").attr("id", "new-course");

		$("#course-table td").css("width", courseCellWidth + "px");
		$("#course-table tr").css("width", $("#c_view").width() + "px");
              
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
                                if(timeDiff >= 12){
                                    timeDiff = Math.round((timeDiff / 12)*10)/10;
                                    
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
                                
                                if (timeDiff > 31) {
                                    timeDiff = Math.round(timeDiff / 30.42);
                                    if (Math.floor(timeDiff) == 1) {
                                        var selector = TXT[system.lang].gen.time.month[0];
                                    } else {
                                        var selector = TXT[system.lang].gen.time.month[1];
                                    }
                                } else {
                                    var selector = TXT[system.lang].gen.time.inDays[2];
                                }
                                
				starting = "(" + TXT[system.lang].gen.time.inDays[1] + " " + timeDiff + " " + selector + ")";
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
			} else {
			    $el.append("<div class='addDay center-abs'><svg class='icon' viewBox='-220.058 -220.05 540.111 540.101'><use xlink:href='#add-icon'></use></svg></div>")
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
		    $("#user-table").append("<tr></tr>")
		    $("#user-table tr:last-child").append(createNewElement({select: "flip-container", style: "small"}));
		    $("#user-table tr:last-child td").css("width", userCellWidth + "px");

		    $("#u_over #cover-face").append(createNewElement({select: "new-box"}));
		    $("#u_over .new-box").attr("id", "new-user");

		} catch (err) {
		    error(TXT[system.lang].gen.error);
		    console.warn("Warning: User View encountered an error: " + err.message + " at line " + parseErrorLine(err));
		    sendErrorReport();
		    return false;
		}
		break;
	    case 2:
		var indxC = _activePos.course, indx = _activePos.user;

		try {

		    if (_temp.updateNotes) {
			updateNotesArray();
		    }

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
		    $("#u_view .name").append(user[ID("user",this_user.id)].name);

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

    function resetWeekTable() {
	course[_activePos.course].tt.splice(0, 7);
	course[_activePos.course].tt = course[_activePos.course].tt.concat(_temp.week);

	$("#week-table tbody td").empty();

	for (var i = 0; i < 7; i++) {
	    var $el = $("#week-table tbody td:nth-child(" + (i + 1) + ")");

	    if (course[_activePos.course].tt[i] != "") {
		$el.append(createNewElement({select: "week-table_cell", name: course[_activePos.course].tt[i]}));
	    } else {
		$el.append("<div class='addDay center-abs'><svg class='icon' viewBox='-220.058 -220.05 540.111 540.101'><use xlink:href='#add-icon'></use></svg></div>");
	    }
	}

	_enableAnimation.generic = _enableAnimation.main = true;

	$("#u_over .saveButton, #u_over .resetButton").removeClass("shown").delay(550).hide(0);

	$("#week-table tbody span").css("opacity", "1");
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

	$("#course-table").on("click", ".BOXcontainer", function(e) {
            var $td = $(this).parents("td");
            
            if(e.ctrlKey){
                $td.toggleClass("selected");
            } else {
                _activePos.course = $td.objectIndex();

                if (_enableAnimation.generic && (!$td.hasClass("editing"))) {

                    createUI("users");
                    animateSectionsVertical({
                        start: "c_view",
                        end: "u_over"
                    });
                }
            }
	})
		.on("mouseenter", ".courseBox", function() {

		    var $text = $(this).find("span"),
			    textWidth = $text.innerWidth(),
			    containerWidth = $(this).innerWidth(),
			    containerHeight = 65,
			    /* 	margin = $(this).children(".tools").innerWidth() + 10,*/
			    margin = 43,
			    move = ((containerWidth - textWidth) / 2) - margin;

		    move = $(this).parent().hasClass("editing") ? 0 : move;

		    $text.transform("translateX(-" + move + "px)");

		})
		.on("mouseleave", ".courseBox", function() {
		    var $text = $(this).find("span");

		    $text.transform("translateX(0px)");
		})

		// Create new course element
		.on("click", "#new-course", function() {

		    var s = 1;
		    var name = TXT[system.lang].c.top + " " + s;

		    while (checkObject(name, "course") > 0) {
			s += 1;
			name = TXT[system.lang].c.top + " " + s;
		    }

		    var $front = $("#c_view #front-face"),
			    $back = $("#c_view #back-face"),
			    $cover = $("#c_view #cover-face"),
			    $flip = $("#c_view #flip-transition"),
			    $newBox = $("#c_view .new-box"),
			    $newBoxCopy = $("#c_view .new-box-copy");

		    $front.append(createNewElement({select: "new-box-copy"}));
		    $back.append(createNewElement({select: "course", name: name}));

		    $newBoxCopy.addClass("new-course");
		    $cover.addClass("hide");

		    $flip.removeClass("hide").addClass("show");
		    $cover.remove();

		    $("#c_view .addIcon-contain").css("opacity", "0");
                    
                    setTimeout(function(){
                        $("#c_view .new-box-copy, #c_view .new-box").css("outline-color", "rgba(0,0,0,0)");
                    },100);

		    setTimeout(function() {

			var $lastItemTr = $("#course-table tr:last-child"),
				$lastItemTd = $lastItemTr.find("td:last-child");

			$front.remove();

			$lastItemTd.find(".courseBox").unwrap().unwrap().unwrap()
				.parents("td").objectIndex(course.length - 1);

			$lastItemTd.removeClass("holdPerspective_bigBox_Flip");

			if (startEditor($lastItemTd, true) == false) {
			    error(TXT[system.lang].gen.error)
			    sendErrorReport();
			}
			;

			if ($lastItemTd.index() == 2) {
			    $("#course-table").append("<tr></tr>")
			}

			$lastItemTr = $("#course-table tr:last-child");

			$lastItemTr.css("width", $("#c_view").width() + "px")
				.append(createNewElement({select: "flip-container", style: "big"}))
				.children("td:last-child").css("width", courseCellWidth + "px");

			$("#c_view #cover-face").append(createNewElement({select: "new-box"}));
			$("#c_view .new-box").attr("id", "new-course");

			console.log("LOG 13: CREATE COURSE [" + name + "]");
		    }, 400);

		    createNewData({type: "course", name: name});
		})

		.on("click", ".tools .icon", function(e) {
		    var indx = $(this).index();
		    var $container = $(this).parents("td");

		    switch (indx) {
			case 0:
			    if (startEditor($container, e.ctrlKey) == false) {
				error(TXT[system.lang].ge.error);
				sendErrorReport();
			    }
			    ;
			    break;
			case 1:
			    if (deleteBox($container) == false) {
				error(TXT[system.lang].ge.error);
				sendErrorReport();
			    }
			    ;
			    break;
			case 2:
			    if (startSettings($container) == false) {
				error(TXT[system.lang].gen.noSupport);
			    }
			    break;
		    }
		});
    });

    $(document).on("click.selection", function(e){
        if(!$(e.target).closest(".selectionMenu, td").length){

            if(_activePos.course == false){
                $el = $("#c_view td");
            } else {
                $el = $("#u_over td");
            }
            
            $el.each(function(){
                $(this).removeClass("selected");
            });
        }
    });

    // USER OVERVIEW
    $(function() {

	$("#dateEditor").on("click", function() {
	    var $dateEditor = $("#dateEditor"),
		    newDate,
		    newDateObject,
		    //dateEditorElement = document.getElementById("dateEditor"),
		    originalText = $dateEditor.text();

	    if ($dateEditor.attr("contenteditable") == "true") {
		return false
	    }

	    $dateEditor.attr("contenteditable", "true");
	    $dateEditor.focus();

	    document.execCommand("selectAll", false, null);

	    function saveDate() {
		course[_activePos.course].startdate.setFullYear(newDate[3], newDate[2] - 1, newDate[1]);
		newDate = new Date(course[_activePos.course].startdate.getTime());

		propagateNewStartDate(_activePos.course);

		$("#u_over .startDate div").empty();

		var timeDiff = Math.abs(today - newDate);
		timeDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

		var dateString = newDate.toLocaleDateString();
		var starting;

		if (newDate < today) {

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
	    }

	    function validateDate() {
		$dateEditor.attr("contenteditable", "false");
		newDate = $dateEditor.text();

		if (/^(?:(?:0?[1-9]|[1-3]\d)(?:\||\\|.))(?:(?:0?[1-9]|1[0-2])(?:\||\\|.))\d\d\d\d$/.test(newDate)) {

		    newDate = newDate.match(/^(?:(0?[1-9]|[1-3]\d)(?:\||\\|.))(?:(0?[1-9]|1[0-2])(?:\||\\|.))(\d\d\d\d)$/);
		    originalText = originalText.match(/^(?:(0?[1-9]|[1-3]\d)(?:\||\\|.))(?:(0?[1-9]|1[0-2])(?:\||\\|.))(\d\d\d\d)$/);

		    $dateEditor.off("blur").off("keydown");

		    if ((originalText[3] == newDate[3]) && (originalText[2] == newDate[2]) && (originalText[1] == newDate[1])) {
			return false;
		    }

		    newDateObject = new Date(course[_activePos.course].startdate.getTime());
		    newDateObject.setFullYear(newDate[3], newDate[2] - 1, newDate[1]);

		    if (newDateObject > course[_activePos.course].startdate) {
			warn({message: TXT[system.lang].u.alert.startdate, confirm: true, ifTrue: function() {
				saveDate();
			    }, ifFalse: function() {
				$dateEditor.text(originalText[0]);
			    }});
		    } else {
			saveDate();
		    }
		} else {
		    $dateEditor.attr("contenteditable", "true");
		    $dateEditor.focus();
		    error("Invalid String format: Please use Day.Month.Year");
		}
	    }

	    $dateEditor.on("blur", function() {
		validateDate();
	    })
		    .on("keydown", function(e) {
			if (e.which == 13) {
			    e.preventDefault();
			    e.stopPropagation();
			    validateDate();
			}
		    });
	});

	$("#week-table").on("click", ".deleteDay", function() {
	    var $el = $(this),
		    $parent = $el.parent(),
		    $text = $parent.find("span"),
		    $arrows = $parent.find(".arrow_container"),
		    $save = $("#u_over .saveButton"),
		    indx = $parent.index();

	    course[_activePos.course].tt[indx] = "";

	    $text.css("opacity", "0");
	    $arrows.css("opacity", "0");
	    $el.transition("transform 0.2s");
	    $el.transform("scale(1.4)");

	    setTimeout(function() {
		$parent.addClass("removing");

		$el.transform("");
		setTimeout(function() {
		    $el.transition("");

		    _temp.updateNotes = true;

		    $parent.empty()
			    .append("<div class='addDay center-abs'><svg class='icon' viewBox='-220.058 -220.05 540.111 540.101'><use xlink:href='#add-icon'></use></svg></div>");
		    setTimeout(function() {
			$parent.removeClass("editing removing");
		    }, 10);
		}, 200);
	    }, 200);

	    saveForWeek(true);
	})
		.on("click", ".addDay", function() {
		    var $el = $(this).parent();

		    $el.find(".addDay")
			    .css("opacity", "0")
			    .one("transitionend", function() {
				$el.empty()
					.append(createNewElement({select: "week-table_cell", name: "12:00"}));

				setTimeout(function() {
				    $el.find("span").css("opacity", "1");
				    startTimeEditor($el);
				}, 10);
			    });

		    saveForWeek(false);

		})
		.on("click", "span", function() {
		    var $el = $(this).parent();

		    if (!$el.hasClass("editing")) {
			setTimeout(function() {
			    startTimeEditor($el);
			}, 1);
		    }

		    saveForWeek(false);
		});

	$("#u_over .saveButton").on("click", function() {
	    if (!$(this).hasClass("moved")) {
                for(var i = 0; i < 7; i++){
                    if(course[_activePos.course].tt[i] != ""){
                        break;
                    }
                    if(i == 6){
                        error(TXT[system.lang].u.weekErr);
                        return false;
                    }
                }
		propagateNewWeek();
	    }
	});
	$("#u_over .resetButton").on("click", function() {
	    resetWeekTable();
	});

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
		// Create new course element
		.on("click", "#new-user", function() {

		    var s = 1;
		    var name = TXT[system.lang].u.top + " " + s;

		    while (checkObject(name, "user") > 0) {
			s += 1;
			name = TXT[system.lang].u.top + " " + s;
		    }

		    var $front = $("#u_over #front-face"),
			    $back = $("#u_over #back-face"),
			    $cover = $("#u_over #cover-face"),
			    $flip = $("#u_over #flip-transition"),
			    $newBox = $("#u_over .new-box"),
			    $newBoxCopy = $("#u_over .new-box-copy");

		    $front.append(createNewElement({select: "new-box-copy"}));
		    $newBoxCopy.addClass("new-user");
		    $back.append(createNewElement({select: "user", name: name}));

		    $cover.addClass("hide");
		    $flip.removeClass("hide").addClass("show");
		    $cover.remove();

		    $("#u_over .addIcon-contain").css("opacity", "0");
                    
                    setTimeout(function () {
                        $("#u_over .new-box-copy, #u_over .new-box").css("outline-color", "rgba(0,0,0,0)");
                    }, 100);

		    setTimeout(function() {

			var $lastItem = $("#user-table tr:last-child td");

			$("#u_over #front-face").remove();

			$lastItem.find(".userBox").unwrap().unwrap().unwrap()
				.parents("td").objectIndex(course[_activePos.course].user.length - 1);

			$lastItem.removeClass("holdPerspective_smallBox_Flip");

			if (startEditor($lastItem, true) == false) {
			    error(TXT[system.lang].gen.error);
			    sendErrorReport();
			}
			;

			$("#user-table").append("<tr></tr>");
			var $lastItemNext = $("#user-table tr:last-child");

			$lastItemNext.append(createNewElement({select: "flip-container", style: "small"}));
			$lastItemNext.children("td").css("width", userCellWidth + "px");

			$("#u_over #cover-face").append(createNewElement({select: "new-box"}));
			$("#u_over .new-box").attr("id", "new-user");

			console.log("LOG 13: CREATE USER [" + name + "]");

		    }, 400);

		    createNewData({type: "user", name: name, clearance: 3});
		    $back.find(".username").text(user[ID("user",course[_activePos.course].user.last().id)].username);
		    $back.find(".password").text(user[ID("user",course[_activePos.course].user.last().id)].password);
		    $back.find(".warning").addClass("alert").html(TXT[system.lang].u.alert.warning);
		})
		.on("click", ".tools .icon", function(e) {
		    var indx = $(this).index();
		    var $container = $(this).parent().parent().parent();

		    switch (indx) {
			case 0:
			    if (startEditor($container, e.ctrlKey) == false) {
				error(TXT[system.lang].gen.error);
				sendErrorReport();
			    }
			    ;
			    break;
			case 1:
			    if (deleteBox($container) == false) {
				error(TXT[system.lang].gen.error);
				sendErrorReport();
			    }
			    ;
			    break;
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

	$("#u_view #notes-content").on("click", "table tbody td", function() {
	    var toggle = ["yes", "no","noApproved", "noCourse", "missingInfo"],
		    $el = $(this),
		    $tableContainer = $el.parent().parent().parent(),
		    offset = $el.index() + 1,
		    indxC = _activePos.course,
		    indx = _activePos.user;

	    if ($tableContainer.hasClass("table-nr2")) {
		var offset = offset + 6;
	    }
	    ;

	    var active = (_temp.max_tframe - _activePos.tframe) * 12 + offset - 1;
	    var length = course[indxC].user[indx].notes.length;

	    if ($tableContainer.is("#notes-table_addon")) {
		error(TXT[system.lang].gen.noSupport);
	    }

	    function change() {
		$el.removeClass(toggle[i]);

		if (i == 3) {
		    var splice = _temp.noCourseMarker.after.indexOf(active)

		    _temp.noCourseMarker.after.splice(splice, 1);
		}

		i++;

		if (i == toggle.length) {
		    if (active == length - 1) {
			i = 3;
		    } else {
			i = 0;
		    }
		}

		$el.addClass(toggle[i]);

		switch (i) {
		    case 0:
			i = 1;
			break;
		    case 1:
			i = 0;
			break;
		    case 2:
			i = 2;
			break;
		    case 3:
			i = -2;
			break;
		    case 4:
			i = -1;
			break;
		}

		if (i == -2) {
		    _temp.noCourseMarker.after.push(active)
		}

		course[indxC].user[indx].notes[active].attendance = i;
	    }

	    for (var i = 0; i < toggle.length; i++) {
		if ($el.hasClass(toggle[i]) && (active < length) && (!$tableContainer.is("#notes-table_addon"))) {

		    if (_temp.noCourseMarker.before.indexOf(active) != -1) {

			warn({message: TXT[system.lang].u.alert.holly[1], confirm: true, ifTrue: function() {
				for (var k = 0; k < course[indxC].user.length; k++) {
				    course[indxC].user[k].notes[active].attendance = -1;
				}
				var splice = _temp.noCourseMarker.before.indexOf(active);
				_temp.noCourseMarker.before.splice(splice, 1);

				change();
			    }});
		    } else {
			change();
		    }

		    break;
		}
		;
	    }
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
		    indx = _activePos.user;

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

	$("section").on("click", ".trueEditor .contentContainer, .trueEditor .header", function(e) {
	    var $parent = $(this).parents(".trueEditor"),
		    $container = $parent.find(".contentContainer"),
		    $generalContent = $parent.find(".content.general"),
		    $generalContentFake = $parent.find(".fakeContent.general"),
		    $content = $parent.find(".content.general ~ .content"),
		    $contentFake = $parent.find(".fakeContent.general ~ .fakeContent");

	    var $lastContainer = $("#last_info"),
		    $nextContainer = $("#next_infoContainer");

	    var $header = $parent.find(".header");

	    if ($parent.hasClass("editing")) {
		return false
	    }
	    ;

	    if ($(this).hasClass("header")) {
		var $el = $header,
			el = this;
		var skipp = true;
	    } else if ($(e.target).is($generalContent)) {
		var $el = $generalContent,
			$elFake = $generalContentFake,
			el = this.getElementsByClassName("content")[0];
		var skipp = false;
	    } else if ($(e.target).is($content)) {
		var $el = $content,
			$elFake = $contentFake,
			el = this.getElementsByClassName("content")[1];
		var skipp = false;
	    }

	    var container = el.parentNode.parentNode.getElementsByClassName("contentContainer")[0];

	    $parent.addClass("editing");

	    var indxC = _activePos.course,
		    indx = _activePos.user,
		    active = $parent.attr("data-active") * 1,
		    isDefault = false,
		    ctrlKey = false,
		    trueEditorTimer, checker = false;

	    if ($("section").isActive == 1) {
		var editor = true;
	    } else {
		var editor = false;
	    }

	    function closeEditor(saveAsWell) {
		saveAsWell = (saveAsWell === false) ? false : true;
		if (saveAsWell) {
		    save("all");
		}

		checker = false;

		$header.attr("contenteditable", "false");
		$content.attr("contenteditable", "false");
		$generalContent.attr("contenteditable", "false");

		$header.text($header.text());
		$content.text($content.text());
		$generalContent.text($generalContent.text());

		$header.off("click").off("blur");
		$content.off("click").off("blur");
		$generalContent.off("click").off("blur");

		$container.removeClass("editor");

		container.removeEventListener("keyup", listenerFunction1);
		container.removeEventListener("keydown", listenerFunction2);

		$parent.off("keydown")
			.off("keyup");

		$(document).off("click.editor");

		setTimeout(function() {
		    $parent.removeClass("editing");
		    $container.css("width", "");
		    if ($parent.attr("id") == "selectedInfoCont") {
			$parent.css("display", "inline-block");
			$parent.css("width", ($parent.width() + 5) + "px");
			$parent.css("display", "");
		    }
		}, 300);
	    }

	    function save(selector) {

		function header() {
		    isDefault = ($header.text() == TXT[system.lang].u.info.title[0]) ? true : false;
		    if (!isDefault) {
			if ($header.text().length) {
			    course[indxC].notes[active].title = $header.text();
			} else {
			    $header.text(TXT[system.lang].u.info.title[0]);
			}
		    }
		    ;
		}

		function content() {
		    if ($content.text().length) {
			course[indxC].user[indx].notes[active].note = $content.text();
		    } else {
			$content.text(TXT[system.lang].u.info.content);
		    }
		}

		function genContent() {
		    if ($generalContent.text().length) {
			course[indxC].notes[active].content = $generalContent.text();
		    } else {
			$generalContent.text(TXT[system.lang].u.info.content);
		    }
		}

		switch (selector) {
		    case "header":
			header();
			break;
		    case "content":
			content();
			break;
		    case "genContent":
			genContent();
			break;
		    case "all":
			header();
			content();
			genContent();
		}
	    }

	    function markURL() {
		if (!skipp) {
		    var text = $el.text();
		    text = text.replace(/((?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(?:(?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?)/gi, "<span class='url' data-href='$1'>$1</span>");
		    $elFake.html(text);
		}
		if (($el.parent().hasClass("editor") || skipp) && (checker)) {
		    setTimeout(function() {
			markURL();
		    }, 20);
		}

		adjustHeight();
	    }

	    function markURL_nowebkit() {
		if (!skipp) {
		    var text = $el.text();
		    text = text.replace(/((?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(?:(?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?)/gi, "<span class='url' data-href='$1'>$1</span>");
		    $elFake.html(text);
		}
		if (($el.parent().hasClass("editor") || skipp) && (checker)) {
		    setTimeout(function() {
			markURL();
		    }, 20);
		}

		adjustHeight();
	    }

	    function adjustHeight() {
		if (editor) {

		} else {
		    if ($("#userInformation #selectedInfoCont").hasClass("hide")) {
			var selectedHeight = 0;
		    } else {
			var selectedHeight = $("#userInformation #selectedInfoCont").outerHeight(true);
		    }
		    var height = Math.max($lastContainer.outerHeight(true), $nextContainer.height());

		    $("#infoCont").css("height", height + "px");
		    $("#userInformation").css("height", selectedHeight + height + "px");
		}
	    }

	    $header.attr("contenteditable", "true");
	    $content.attr("contenteditable", "true");
	    $generalContent.attr("contenteditable", "true");

	    if ($parent.attr("id") == "selectedInfoCont") {
		$parent.css("width", "")
	    }
	    $container.css("width", "100%").addClass("editor");

	    if (!$el.hasClass("header")) {
		isDefault = ($el.text() == TXT[system.lang].u.info.content) ? true : false;
		$el.focus();
	    } else {
		isDefault = ($header.text() == TXT[system.lang].u.info.title[0]) ? true : false;
		$header.focus();
	    }

	    if (isDefault || e.ctrlKey) {
		document.execCommand('selectAll', false, null);
	    } else {
		var sel = window.getSelection();

		sel.removeAllRanges();

		if (sel.rangeCount) {
		    var range = sel.getRangeAt(0);

		    range.setStart(range.startContainer, range.startContainer.length);
		    range.collapse(true);
		} else {
		    var range = document.createRange();

		    range.setStart(el.childNodes[0], el.childNodes[0].length);
		    range.collapse(true);

		    sel.removeAllRanges();
		    sel.addRange(range);
		}
	    }

	    $header.on("click", function() {
		skipp = true;
		isDefault = ($header.text() == TXT[system.lang].u.info.title[0]) ? true : false;
		if (isDefault) {
		    document.execCommand('selectAll', false, null);
		}
		;
	    }).on("blur", function() {
		if (!$header.text().length) {
		    $header.text(TXT[system.lang].u.info.title[0]);
		}
	    });

	    $content.on("click", function() {
                skipp = false;
		isDefault = ($content.text() == TXT[system.lang].u.info.content) ? true : false;
		if (isDefault) {
		    document.execCommand('selectAll', false, null);
		}
		;
		$el = $content;
		$elFake = $contentFake;
	    }).on("blur", function() {
		if (!$content.text().length) {
		    $content.text(TXT[system.lang].u.info.content);
		}
	    });

	    $generalContent.on("click", function() {
                skipp = false;
		isDefault = ($generalContent.text() == TXT[system.lang].u.info.content) ? true : false;
		if (isDefault) {
		    document.execCommand('selectAll', false, null);
		}
		;
		$el = $generalContent;
		$elFake = $generalContentFake;
	    }).on("blur", function() {
		if (!$generalContent.text().length) {
		    $generalContent.text(TXT[system.lang].u.info.content);
		}
	    });

	    var listenerFunction1 = function(event) {
		if ((event.keyCode == 17) && (!ctrlKey)) {
		    ctrlKey = true;
		    $content.css("z-index", "-1");
		    $generalContent.css("z-index", "-1");
		}
	    };

	    var listenerFunction2 = function(event) {
		if ((event.keyCode == 17) && (ctrlKey)) {
		    ctrlKey = false;
		    $content.css("z-index", "");
		    $generalContent.css("z-index", "");
		}
	    };

	    container.addEventListener("keydown", listenerFunction1, false);

	    container.addEventListener("keyup", listenerFunction2, false);

	    $parent.on("keydown", function(e) {
		if (e.which == 13) {
		    e.preventDefault();
		    e.stopPropagation();
		}
		if (!checker) {
		    checker = true;
		    markURL();
		}
	    });

	    $parent.on("keyup", function(e) {
		clearTimeout(trueEditorTimer);

		switch (e.which) {
		    case 13:
			if ($content.is(e.target)) {
			    closeEditor();
			} else if ($generalContent.is(e.target)) {
			    $content.focus();
                            
                            skipp = false;
                            $el = $content;
                            $elFake = $contentFake;
                            
			    isDefault = ($content.text() == TXT[system.lang].u.info.content) ? true : false;
			    if (isDefault) {
				document.execCommand('selectAll', false, null);
			    }
			    ;
			} else if ($header.is(e.target)) {
			    $generalContent.focus();
                            
                            skipp = false;
                            $el = $generalContent;
                            $elFake = $generalContentFake;
                            
			    isDefault = ($generalContent.text() == TXT[system.lang].u.info.content) ? true : false;
			    if (isDefault) {
				document.execCommand('selectAll', false, null);
			    }
			    ;
			}
			;
			break;
		    case 27:
			closeEditor(false);
			break;
		    case 83:
			if (ctrlKey) {
			    closeEditor();
			}
		}
		;

		trueEditorTimer = setTimeout(function() {
		    checker = true;
		}, 2000);
	    });

	    setTimeout(function() {
		$(document).on("click.editor", function(event) {
		    if ((!$(event.target).closest($header).length) && (!$(event.target).closest($container).length)) {
			closeEditor();
		    }
		});
	    }, 10);
	});

	$("#u_view #notes-content").on("click", ".go_side_cont", function() {

	    var this_user = {
		notes: []
	    },
	    indxC = _activePos.course,
		    indx = _activePos.user;

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

    $(".simplEdit").on("click", function(e) {
	startSimpleEditor($(this), e.ctrlKey);
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
    $(window).one("hashchange", function(){
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