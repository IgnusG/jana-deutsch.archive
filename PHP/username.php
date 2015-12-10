<?php

include_once 'auth_connect.php';
include_once 'data_connect.php';
include_once 'functions.php';

sec_session_start();

if(login_check($mysqli) == true){
    echo find_username($_POST["username"], $mysqli);
} else {
    echo false;
}
