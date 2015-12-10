<?php

include_once 'auth_connect.php';
include_once 'data_connect.php';
include_once 'functions.php';
 
sec_session_start(); // Our custom secure way of starting a PHP session.

if (isset($_POST['username'], $_POST['p'])) {
    $username = $_POST['username'];
    $password = $_POST['p']; // The hashed password.
    
    // Login successfull
    if (login($username, $password, $mysqli) == true) {
        // Send the formated data over
        echo parseData($mysqli, $mysqli_content);
    } else {
        // Incorrect values sent
        echo false;
    }
} else {
    // The correct POST variables were not sent to this page. 
    echo false;
}