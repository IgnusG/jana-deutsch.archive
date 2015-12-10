<?php

include_once 'auth_connect.php';
include_once 'data_connect.php';

$arrayUsers = array();

if($result = $mysqli->query("SELECT * FROM members")){
    while($obj = $result->fetch_object()){
        $arrayUsers[count($arrayUsers)] = $obj;
    }
} else {
    die("Unable to read from USER Database!");
}

$arrayData = array();

if ($result = $mysqli_content->query("SELECT * FROM courses")) {
    while ($obj = $result->fetch_object()) {
        $arrayData[count($arrayData)] = $obj;
    }
} else {
    die("Unable to read from DATA Database!");
}

$array = array($arrayUsers,$arrayData);

$counter = 0;
$tmp = "";


do {
    $file_list = glob("../Backup/Backup_".$counter."*.txt");
    $counter++;
} while (!empty($file_list));
$counter--;

$file = fopen("../Backup/Backup_".$counter."-".date("d.m.y").".txt", "x") or die("Unable to open file!");
fwrite($file,  json_encode($array));
fclose($file);

$mysqli -> close();
$mysqli_content -> close();

// Get rid of old Data
$files = scandir("../Backup");

while(count($files) > 60){
    unlink(array_shift($files));
}

echo true;