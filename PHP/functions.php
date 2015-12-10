<?php

//include_once 'config.php';

function sec_session_start() {
    $session_name = 'sec_session';
    $secure = SECURE;
    // This stops JavaScript being able to access the session id.
    $httponly = true;
    // Forces sessions to only use cookies.
    if (ini_set('session.use_only_cookies', 1) === FALSE) {
        header("Location: ../error.php?err=Could not initiate a safe session (ini_set)");
        exit();
    }
    // Gets current cookies params.
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly);
    // Sets the session name to the one set above.
    session_name($session_name);
    session_start();            // Start the PHP session 
    session_regenerate_id();    // regenerated the session, delete the old one. 
}

function login($username, $password, $mysqli) {
    // Using prepared statements means that SQL injection is not possible. 
    if ($stmt = $mysqli->prepare("SELECT id, password, salt 
        FROM members WHERE username = ?
        LIMIT 1")) {
        $stmt->bind_param('s', $username);  // Bind "$email" to parameter.
        $stmt->execute();    // Execute the prepared query.
        $stmt->store_result();

        // get variables from result.
        $stmt->bind_result($user_id, $hash_password, $salt);
        $stmt->fetch();

        // hash the password with the unique salt.
        $password = hash('sha512', $password . $salt);

        if ($stmt->num_rows == 1) {
            // Check if the password in the database matches
            // the password the user submitted.
            if ($hash_password == $password) {
                // Password is correct!
                // Get the user-agent string of the user.
                $user_browser = $_SERVER['HTTP_USER_AGENT'];
                // XSS protection as we might print this value
                $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                $_SESSION['user_id'] = $user_id;
                // XSS protection as we might print this value
                $username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
                $_SESSION['username'] = $username;
                $_SESSION['login_string'] = hash('sha512', $password . $user_browser);
                // Login successful.
                return true;
            } else {
                // Password is not correct
                return false;
            }
        } else {
            // No user exists.
            return false;
        }
    }
}

function login_check($mysqli) {
    // Check if all session variables are set 
    if (isset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['login_string'])) {
        $user_id = $_SESSION['user_id'];
        $login_string = $_SESSION['login_string'];
        //$username = $_SESSION['username'];
        // Get the user-agent string of the user.
        $user_browser = $_SERVER['HTTP_USER_AGENT'];

        if ($stmt = $mysqli->prepare("SELECT password FROM members WHERE id = ? LIMIT 1")) {
            // Bind "$user_id" to parameter. 
            $stmt->bind_param('i', $user_id);
            $stmt->execute();   // Execute the prepared query.
            $stmt->store_result();

            if ($stmt->num_rows == 1) {
                // If the user exists get variables from result.
                $stmt->bind_result($password);
                $stmt->fetch();
                $login_check = hash('sha512', $password . $user_browser);

                if ($login_check == $login_string) {
                    // Logged In!!!! 
                    return true;
                } else {
                    // Not logged in 
                    return false;
                }
            } else {
                // Not logged in 
                return false;
            }
        } else {
            // Not logged in 
            return false;
        }
    } else {
        // Not logged in 
        return false;
    }
}

function recover_password($email, $mysqli) {
    if ($stmt = $mysqli->prepare("SELECT id FROM members WHERE email = ? LIMIT 1")) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($id);

        if ($id) {

            if ($stmt = $mysqli->prepare("SELECT key FROM recovery WHERE user_id = ? LIMIT 1")) {
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $stmt->bind_result($result);

                if ($result) {
                    return "recovery_pending";
                } else {
                    $key = hash('sha512', string_random(20, null));
                    if ($stmt = $mysqli->prepare("INSERT INTO recovery (user_id, key) VALUES (?,?)")) {
                        $stmt->bind_param("ss", $id, $key);
                        $stmt->execute();

                        // Send email
                        mail($email, "Passwort Zurücksetzung", "");

                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function privilege_check($mysqli) {

    if (login_check($mysqli)) {
        $user_id = $_SESSION['user_id'];

        if ($stmt = $mysqli->prepare("SELECT clearance FROM members WHERE id = ? LIMIT 1")) {
            // Bind "$user_id" to parameter. 
            $stmt->bind_param('i', $user_id);
            $stmt->execute();   // Execute the prepared query.
            $stmt->store_result();

            $stmt->bind_result($clearance);
            $stmt->fetch();

            return $clearance;
        }
    }
}

function esc_url($url) {

    if ('' == $url) {
        return $url;
    }

    $url = preg_replace('|[^a-z0-9-~+_.?#=!&;,/:%@$\|*\'()\\x80-\\xff]|i', '', $url);

    $strip = array('%0d', '%0a', '%0D', '%0A');
    $url = (string) $url;

    $count = 1;
    while ($count) {
        $url = str_replace($strip, '', $url, $count);
    }

    $url = str_replace(';//', '://', $url);

    $url = htmlentities($url);

    $url = str_replace('&amp;', '&#038;', $url);
    $url = str_replace("'", '&#039;', $url);

    if ($url[0] !== '/') {
        // We're only interested in relative links from $_SERVER['PHP_SELF']
        return '';
    } else {
        return $url;
    }
}

function string_random($len, $o) {
    $base_alpha_lower = "abcdefghijklmnopqrstuvwxyz";
    $base_alpha_upper = strtoupper($base_alpha_lower);
    $base_numeric = "0123456789";

    if ($o == null) {
        $base = $base_numeric . $base_alpha_lower . $base_alpha_upper;
    } else {
        $o = str_split($o);
        foreach ($o as $element) {
            switch ($element) {
                case "l": $base .= $base_alpha_lower;
                case "u": $base .= $base_alpha_upper;
                case "n": $base .= $base_numeric;
            }
        }
        if (!strlen($base)) {
            $base = $base_alpha_lower;
        }
    }

    $result = "";
    $base = str_split($base);

    for ($i = 0; $i < $len; $i++) {
        $result .= $base[mt_rand(0, count($base) - 1)];
    }

    return $result;
}

function find_username($username, $mysqli){
    $username_found = "Error";
    
    if($stmt = $mysqli -> prepare("SELECT id FROM members WHERE username = ?")){
        $stmt -> bind_param("s",$username);
        $stmt -> execute();
        $stmt -> store_result();
        
        $stmt -> bind_result($username_found);
        
        $stmt -> fetch();
        $stmt -> close();
        
        if($username_found != intval($_SESSION['user_id'])){
            if(strtolower($username) != "admin"){
                if($username_found == 0){
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
    }
    
    return true;
}

//Stores Data from table to JSON formated strings and outputs them to JS
function parseData($mysqli, $mysqli_content) {

    $user_id = intval($_SESSION['user_id']);
    $username = $_SESSION['username'];
    $clearance = privilege_check($mysqli);

    $data = array();
    // Init data object
    $data["course"] = array();
    $data["user"] = array();
    $data["currentUser"] = array();

    // We create an instance of the current user

    if ($stmt = $mysqli->prepare("SELECT id, username, name, include_course, clearance, settings, email FROM members WHERE id = ? LIMIT 1")) {
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($data["currentUser"]["id"], $data["currentUser"]["username"], $data["currentUser"]["name"], $data["currentUser"]["include_course"], $data["currentUser"]["clearance"], $data["currentUser"]["settings"], $data["currentUser"]["email"]);
        $stmt->fetch();
        //$result = $stmt -> get_result();
        //$data["currentUser"] = $result -> fetch_assoc();
        
        $data["currentUser"]["password"] = "dont_look_here";

        if (($data["currentUser"]["include_course"] != false) && ($data["currentUser"]["include_course"] != "all")) {
            $data["currentUser"]["include_course"] = json_decode($data["currentUser"]["include_course"], true);
        }
    }

    // If we have the permission, we populate the user object with other users information
    if ($clearance < 3) {
        $result = $mysqli->query("SELECT id, username, name, include_course, clearance  FROM members WHERE clearance > 2");

        while ($row = $result->fetch_assoc()) {
            $data["user"][] = $row;
            $data["user"][count($data["user"]) - 1]["include_course"] = json_decode($data["user"][count($data["user"]) - 1]["include_course"], true);
            $data["user"][count($data["user"]) - 1]["password"] = "";
        }
    }

    // If the permissions are lower than 1LVL use limitations of include_course variable
    if (($clearance > 1) && ($data["currentUser"]["include_course"] !== "all")) {
        if ($stmt = $mysqli_content->prepare("SELECT id, name, info, startdate, tt, notes, user FROM courses WHERE id = ? LIMIT 1")) {
            foreach ($data["currentUser"]["include_course"] as $including) {
                $data["course"][] = array();
                $last = count($data["course"]) - 1;

                $stmt->bind_param("i", $including);
                $stmt->execute();
                $stmt->store_result();
                $stmt->bind_result($data["course"][$last]["id"], $data["course"][$last]["name"], $data["course"][$last]["info"], $data["course"][$last]["startdate"], $data["course"][$last]["tt"], $data["course"][$last]["notes"], $data["course"][$last]["user"]);
                $stmt->fetch();
                //$result = $stmt -> get_result();
                //$data["course"][] = $result -> fetch_assoc();

                $data["course"][$last]["user"] = json_decode($data["course"][$last]["user"], true);

                if ($clearance > 2) {
                    for ($i = 0; $i < count($data["course"][$last]["user"]); $i++) {
                        if ($data["course"][$last]["user"][$i]["id"] != $data["currentUser"]["id"]) {
                            array_splice($data["course"][$last]["user"], $i, 1);
                        }
                    }
                }

                $data["course"][$last]["user"] = json_encode($data["course"][$last]["user"]);
            }
        }
        // The permissions are not high enough to keep all user information, delete where they don't match
        // In case of clearance lower than 3LVL the user variable is not used, so we can ignore it
        if (($clearance == 2) && ($data["currentUser"]["include_course"] != "all")) {
            for ($i = 0; $i < count($data["user"]); $i++) {
                if (!count(array_intersect($data["user"]["include_course"], $data["currentUser"]["include_course"]))) {
                    // The user is not present in any course, replace his object with a false statement
                    array_splice($data["user"], $i, 1);
                }
            }
        }
    } else {
        // Clearance high enough - query everything!
        $result = $mysqli_content->query("SELECT id, name, info, startdate, tt, notes, user FROM courses");

        while ($row = $result->fetch_assoc()) {
            $data["course"][] = $row;
        }
    }

    // Return formated data
    return json_encode($data);
}

function saveData($data, $mysqli, $mysqli_content) {

    $user_id = intval($_SESSION['user_id']);
    $username = $_SESSION['username'];

    $data = json_decode($data, true);

    foreach ($data["course"] as $course) {
        $course["notes"] = json_encode($course["notes"]);
        $course["user"] = json_encode($course["user"]);
    }

    for ($i = 0; $i < count($data["user"]); $i++) {
        $data["user"][$i]["include_course"] = json_encode($data["user"][$i]["include_course"]);
    }

    $clearance = privilege_check($mysqli);

    // Only Admins/Users can edit their informations - Spectator Edits are not allowed
    if ($clearance != 2) {

        // Decide whether the User should be able to edit his full name
        if ($clearance < 4) {
            $prepared_statement = "SELECT username, password, salt, settings, email, name FROM members WHERE id = ? LIMIT 1";
        } else {
            $prepared_statement = "SELECT username, password, salt, settings, email FROM members WHERE id = ? LIMIT 1";
        }

        // Update data
        if ($stmt = $mysqli->prepare($prepared_statement)) {
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($temp_user_data["username"], $temp_user_data["password"], $temp_user_data["salt"], $temp_user_data["settings"], $temp_user_data["email"], $temp_user_data["name"]);
            $stmt->fetch();
            //$result = $stmt -> get_result();
            //$temp_user_data = $result -> fetch_assoc();

            if ($clearance < 4) {
                unset($temp_user_data["name"]);
            }

            if ($data["currentUser"]["password"] == "") {
                $data["currentUser"]["salt"] = $temp_user_data["salt"];
                $data["currentUser"]["password"] = $temp_user_data["password"];
            } else {
                $data["currentUser"]["salt"] = hash('sha512', string_random(8, null));
                $data["currentUser"]["password"] = hash('sha512', $data["currentUser"]["password"] . $data["currentUser"]["salt"]);
            }
            if ($stmt = $mysqli->prepare("UPDATE members SET ? = ? WHERE id = ?")) {
                for ($i = 0; $i < count($temp_user_data); $i++) {
                    $key = key($temp_user_data);
                    $data_store = $data["currentUser"][$key];

                    if ($temp_user_data[$key] != $data_store) {
                        // Update the database
                        $stmt->bind_param("ssi", $key, $data_store, $user_id);
                        $stmt->execute();
                    }
                    next($temp_user_data);
                }
            }
        }
        // Don't forget to remove the second condition statement!
        if ($clearance == 1||clearance == 0) {
            
            // Update the user Database
            $result = $mysqli->query("SELECT id, username, name, password, salt, include_course, settings, email, clearance FROM members WHERE clearance > 2");
            $user_temp = array();

            while ($row = $result->fetch_assoc()) {
                $user_temp[] = $row;
            }

            foreach ($user_temp as $user) {
                for ($i = 0; $i < count($data["user"]); $i++) {

                    if ($data["user"][$i]["id"] == $user["id"]) {
                        // Check for length
                        if ($data["user"][$i]["password"] == "") {
                            $data["user"][$i]["password"] = $user["password"];
                            $salt = $user["salt"];
                        } else {
                            $salt = hash('sha512', string_random(8, null));
                            $data["user"][$i]["password"] = hash('sha512', $data["user"][$i]["password"] . $salt);
                        }
                        if (hash("md5", json_encode($user)) != hash("md5", json_encode($data["user"][$i]))) {
                            $user_real = $data["user"][$i];

                            if ($stmt = $mysqli->prepare("UPDATE members SET username = ?, name = ?, password = ?, salt = ?, include_course = ?, settings = ?, email = ?, clearance = ? WHERE id = ?")) {
                                $stmt->bind_param("ssssssssi", $user_real["username"], $user_real["name"], $user_real["password"], $salt, $user_real["include_course"], $user_real["settings"], $user_real["email"], $user_real["clearance"], $user_real["id"]);
                                $stmt->execute();
                            }
                        }
                        array_splice($data["user"], $i, 1);
                        break;
                    }

                    if ($i == count($data["user"]) - 1) {
                        if ($stmt = $mysqli->prepare("DELETE FROM members WHERE id = ?")) {
                            $stmt->bind_param("i", $user["id"]);
                            $stmt->execute();
                        }
                    }
                }
            }
            foreach ($data["user"] as $user) {
                $salt = hash('sha512', string_random(8, null));
                $user["password"] = hash('sha512', $user["password"] . $salt);

                if ($stmt = $mysqli->prepare("INSERT INTO members (id, username, name, password, salt, include_course, settings, email, clearance) VALUES (?,?,?,?,?,?,?,?,?)")) {
                    $stmt->bind_param("issssssss", $user["id"], $user["username"], $user["name"], $user["password"], $salt, $user["include_course"], $user["settings"], $user["email"], $user["clearance"]);
                    $stmt->execute();
                }
            }

            // Update the data Database
            $result = $mysqli_content->query("SELECT id, name, info, startdate, tt, notes, user FROM courses");

            $data_temp = array();
            
            while ($row = $result->fetch_assoc()) {
                $data_temp[] = $row;
            }

            foreach ($data_temp as $course) {
                for($i = 0; $i < count($data["course"]);$i++){
                    if ($data["course"][$i]["id"] == $course["id"]) {
                        if (hash("md5",json_encode($course)) != hash("md5",json_encode($data["course"][$i]))) {
                            if ($stmt = $mysqli_content->prepare("UPDATE courses SET name = ?, info = ?, startdate = ?, tt = ?, notes = ?, user = ? WHERE id = ?")) {
                                $stmt->bind_param("ssssssi", $data["course"][$i]["name"], $data["course"][$i]["startdate"], $data["course"][$i]["tt"], $data["course"][$i]["notes"], $data["course"][$i]["user"], $data["course"][$i]["id"]);
                                $stmt->execute();

                                array_splice($data["course"], $i, 1);
                            }
                        }
                        break;
                    }

                    if ($i == count($data["course"])-1) {
                        if ($stmt = $mysqli_content->prepare("DELETE FROM courses WHERE id = ?")) {
                            $stmt->bind_param("i", $course["id"]);
                            $stmt->execute();
                        }
                    }
                }
            }

            foreach ($data["course"] as $course) {
                if ($stmt->prepare("INSERT INTO courses (id,name, info, startdate, tt, notes, user) VALUES (?,?,?,?,?,?,?)")) {
                    $stmt->bind_param("issssss",$course["id"], $course["name"], $course["info"], $course["startdate"], $course["tt"], $course["notes"], $course["user"]);
                    $stmt->execute();
                }
            }

            /*$mysqli_content->query("DELETE FROM courses");

            foreach ($data["course"] as $course) {
                $course["tt"] = json_encode($course["tt"]);
                $course["notes"] = json_encode($course["notes"]);
                $course["user"] = json_encode($course["user"]);

                if ($stmt = $mysqli_content->prepare("INSERT INTO courses (id, name, info, startdate, tt, notes, user) VALUES (?,?,?,?,?,?,?)")) {
                    $stmt->bind_param("issssss", $course["id"], $course["name"], $course["info"], $course["startdate"], $course["tt"], $course["notes"], $course["user"]);
                    $stmt->execute();
                }
            }*/
        }
    } else {
        // Spectator, You don't have permissions to edit any data!
        return false;
    }
    return true;
}
