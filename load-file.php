<?php

require_once(dirname(__FILE__) . '/arc2/ARC2.php');
require_once(dirname(__FILE__) . '/fuseki.php');


//--------------------------------------------------------------------------------------------------
function rdf_to_triples($xml)
{	
	// Parse RDF into triples
	$parser = ARC2::getRDFParser();		
	$base = 'http://example.com/';
	$parser->parse($base, $xml);	
	
	$triples = $parser->getTriples();
	
	//print_r($triples);
	
	// clean up
	
	$cleaned_triples = array();
	foreach ($triples as $triple)
	{
		$add = true;

		if ($triple['s'] == 'http://example.com/')
		{
			$add = false;
		}
		
		if ($add)
		{
			$cleaned_triples[] = $triple;
		}
	}
	
	return $parser->toNTriples($cleaned_triples);
	

}

$filename = '952647.rdf';

$rdf = file_get_contents($filename);
echo $rdf;

	// convert to triples
$triples = rdf_to_triples($rdf);

echo $triples;

upload_data($triples);



?>
