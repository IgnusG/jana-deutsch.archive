<?php

include_once 'auth_connect.php';
include_once 'functions.php';
 
sec_session_start(); // Our custom secure way of starting a PHP session.

if (isset($_POST['username'])) {
    $email = $_POST['username'];
    // Login successfull
    $compl = recover_password($email, $mysqli);
    
    if ($compl == true) {
        echo true;
    } else if($compl == "recovery_pending"){
        // Recovery pending
        echo 0;
    } else {
        // Incorrect values sent
        echo false;
    }
} else {
    // The correct POST variables were not sent to this page. 
    echo false;
}

