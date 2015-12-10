<?php
include_once 'auth_connect.php';
include_once 'data_connect.php';
include_once 'functions.php';

sec_session_start();
if(login_check($mysqli) == true){
    // Unset all session values 
    $_SESSION = array();

    // get session parameters 
    $params = session_get_cookie_params();

    // Delete the actual cookie. 
    setcookie(session_name(),
            '', time() - 42000, 
            $params["path"], 
            $params["domain"], 
            $params["secure"], 
            $params["httponly"]);

    // Destroy session 
    session_destroy();

    $mysqli -> close();
    $mysqli_content -> close();

    echo true;
} else {
    echo false;
}