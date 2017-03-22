<?php


// Add/update data to Fuseki from CouchDB

require_once(dirname(__FILE__) . '/fuseki.php');



if (1)
{
	add_view('lod');
}
else
{
	debug_view('lod');
}



?>