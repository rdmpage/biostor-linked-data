<?php

// Triple store
require_once (dirname(__FILE__). '/config.inc.php');
require_once (dirname(__FILE__). '/arc2/ARC2.php');


$prefix = array (
	// W3C
	'http://www.w3.org/1999/02/22-rdf-syntax-ns#' 			=> 'rdf',
	'http://www.w3.org/2000/01/rdf-schema#' 				=> 'rdfs',
	'http://www.w3.org/2002/07/owl#' 						=> 'owl',
	
	// Dublin Core
	'http://purl.org/dc/elements/1.1/' 						=> 'dc', // legacy
	'http://purl.org/dc/terms/' 							=> 'dcterms',	
	
	// Geography
	'http://www.w3.org/2003/01/geo/wgs84_pos#'				=> 'geo',
	'http://www.geonames.org/ontology#' 					=> 'geonames',
	
	// People
	'http://xmlns.com/foaf/0.1/' 							=> 'foaf',
	'http://www.w3.org/2001/vcard-rdf/3.0#'					=> 'vcard',
	'http://www.w3c.org/2000/10/swap/pim/contact#'			=> 'con',
	'http://www.w3.org/2000/10/swap/pim/contact#'			=> 'con', // CINII
	
	// Bibliography
	'http://prismstandard.org/namespaces/2.0/basic/' 		=> 'prism',
	'http://prismstandard.org/namespaces/basic/2.0/' 		=> 'prism', // CINII
	'http://prismstandard.org/namespaces/basic/2.1/'		=> 'prism', // CrossRef
	'http://purl.org/ontology/bibo/'						=> 'bibo',
	
	// TDWG
	'http://rs.tdwg.org/ontology/voc/Collection#' 			=> 'tcol',
	'http://rs.tdwg.org/ontology/voc/Common#' 				=> 'tcommon',
	'http://rs.tdwg.org/ontology/voc/PublicationCitation#' 	=> 'tpub',
	'http://rs.tdwg.org/ontology/voc/TaxonName#' 			=> 'tn',
	'http://rs.tdwg.org/ontology/voc/TaxonConcept#' 		=> 'tc',
	
	// SKOS
	'http://www.w3.org/2004/02/skos/core#'					=> 'skos',
	
	// Uniprot
	'http://purl.uniprot.org/core/'							=> 'uniprot',
	
	// DBPedia
	'http://dbpedia.org/property/'							=> 'dbpprop',
	'http://dbpedia.org/ontology/'							=> 'dbpedia-owl',
	
	// FreeBase
	'http://rdf.freebase.com/ns/'							=> 'fb',
	
	// Creative Commons
	'http://creativecommons.org/ns#'						=> 'cc',
	
	// XHTML
	'http://www.w3.org/1999/xhtml/vocab#'					=> 'xhtml',
	
	);


//--------------------------------------------------------------------------------------------------
function is_vocab_uri($uri)
{
	global $prefix;
			
	$is_vocab = false;
	
	if (preg_match('/(?<prefix>(.*)[\/|#])(?<local>[A-Za-z_\.]+)$/', $uri, $matches))
	{
		//print_r($matches);
		$is_vocab = isset($prefix[$matches['prefix']]);
	}
	
	return $is_vocab;
}

//--------------------------------------------------------------------------------------------------
// Standard prefix for vocabularies used
function get_prefix($name)
{
	global $prefix;
	
	$p = '';
	
	if (preg_match('/(?<prefix>(.*)[\/|#])(?<local>[A-Za-z_\.]+)$/', $name, $matches))
	{
		//print_r($matches);
		
		$p = $matches['prefix'];
	}
	
	
	return $p;
}

//--------------------------------------------------------------------------------------------------
// Standard prefix for vocabularies used
function get_short_prefix($name)
{
	global $prefix;
	
	$p = '';
	
	if (preg_match('/(?<prefix>(.*)[\/|#])(?<local>[A-Za-z_\.]+)$/', $name, $matches))
	{
		//print_r($matches);
		
		$p = $prefix[$matches['prefix']];
	}
	
	
	return $p;
}


//--------------------------------------------------------------------------------------------------
// Standard qnames for vocabularies used
function get_qname($name)
{
	global $prefix;
	
	$qualified_name = $name;

		
	if (preg_match('/(?<prefix>(.*)[\/|#])(?<local>[A-Za-z_\.]+)$/', $name, $matches))
	{
		//print_r($matches);
		
		$qualified_name = $prefix[$matches['prefix']] . ':' . $matches['local'];
		$qualified_name = strtolower($qualified_name);
	}
	
	return $qualified_name;
}

//--------------------------------------------------------------------------------------------------
/**
 * @brief Return number of triples with given URI as their subject
 *
 * Can be used as test of whether we have a URI in triple store (returns 0 if not present). 
 * Runs a DESCRIBE <uri> query on triple store.
 *
 * @param uri URI of interest
 * @return Number of triples (0 if URI not found)
 *
 */
function num_triples_for_uri($uri)
{
	// Triple store
	global $store_config;
	global $store;
	
	// Get details about object from triple store
	$query = 'DESCRIBE <' . $uri . '>';
		
	$triples = $store->query($query);
		
	$num_triples = count($triples['result']);
	if ($num_triples != 0)
	{
		$uri = key($triples['result']);
		$num_triples = count($triples['result'][$uri]);
	}
	return $num_triples;

}

//--------------------------------------------------------------------------------------------------
/**
 * @brief Get type of object 
 *
 */
function get_type($uri)
{
	// Triple store
	global $store_config;
	global $store;
	
	$type = '';
	
	// Get object type
	$query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT  ?type
WHERE 
{ 
   <' . $uri . '> rdf:type ?type .
}';
		
	$triples = $store->query($query);
	//print_r($triples);
	
	if (isset($triples['result']['rows'][0]['type']))
	{
		$type = $triples['result']['rows'][0]['type'];
	}
	
	return $type;
}

//--------------------------------------------------------------------------------------------------
/**
 * @brief Get triples where URI is the target node (and source node is a URI)
 *
 */
function in_bound_links($uri, $kind = '')
{
	// Triple store
	global $store_config;
	global $store;
	

	$query = 'PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
	SELECT DISTINCT * 
		WHERE { 
			?s ';
			
	if ($kind == '')
	{
		$query .= ' ?p ';
	}
	else
	{
		$query .= $kind;
	}
	
	// Ensure only URIs are returned
	$query .= ' <' . $uri . '> . 
			FILTER isIRI(?s)
		} ';
	
	$r = $store->query($query);
	
	return $r;
}


//--------------------------------------------------------------------------------------------------
function inbound_links_to_rdfquery($uri)
{
	global $prefix;
	
	$links = in_bound_links($uri);
	
	$rdfquery = '';

	$count = 0;
	foreach ($links['result']['rows'] as $row)
	{
		if (!is_vocab_uri($row['s']))
		{
			if ($count > 0)
			{
				$rdfquery .= ",\n";
			}
			$count++;
			
			$rdfquery .= "$.rdf.triple('<" . $row['s'] . "> ";
			$rdfquery .= get_qname($row['p']);
		
			$namespaces =  "namespaces: { " . get_short_prefix($row['p']) . ": '" . get_prefix($row['p']) . "' }";

			$rdfquery .= ' <' . $uri . ">";
			$rdfquery .= " .',{\n$namespaces\n})";
			
		}
	}
	$rdfquery .= "\n";
	
	return $rdfquery;
}


//--------------------------------------------------------------------------------------------------
// Describe an object in our triple store
function describe($uri)
{
	// Triple store
	global $store_config;
	global $store;
	
	// Get details about object from triple store
	$query = 'DESCRIBE <' . $uri . '>';
	
	$r = $store->query($query);

	return $r;
}

//--------------------------------------------------------------------------------------------------
/**
 * @brief Declare and setup (if necessary) our triple store
 *
 */

// Triple store
$store_config = array
(
  /* db */
  'db_name' => $config['db_name'],
  'db_user' => $config['db_user'],
  'db_pwd' 	=> $config['db_passwd'],
  /* store */
  'store_name' => 'arc'
);

// We may need to go through a proxy
$store_config['proxy_host'] = $config['proxy_name'];
$store_config['proxy_port'] = $config['proxy_port'];
	

$store = ARC2::getStore($store_config);

// If the store hasn't been set up we need to do so, then add some core
// vocabularies
if (!$store->isSetUp()) 
{
	$store->setUp();
	
	// Add core vocabularies
	
	/*
	
	// RDF
	$store->query('LOAD <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
	$store->query('LOAD <http://www.w3.org/2000/01/rdf-schema#>');

	// Dublin Core
	$store->query('LOAD <http://purl.org/dc/elements/1.1/>');
	$store->query('LOAD <http://purl.org/dc/terms/>');
	
	// SKOS
	$store->query('LOAD <http://www.w3.org/2004/02/skos/core#>');	
	
	// Geography
	$store->query('LOAD <http://www.w3.org/2003/01/geo/wgs84_pos#>');
	
	$store->query('LOAD <http://www.geonames.org/ontology#>');
		
	// People (FOAF, vCard)
	$store->query('LOAD <http://xmlns.com/foaf/0.1/>');
	$store->query('LOAD <http://www.w3.org/2001/vcard-rdf/3.0#>');
	$store->query('LOAD <http://www.w3c.org/2000/10/swap/pim/contact#>');
	
	// Bibliography
	$store->query('LOAD <http://purl.org/ontology/bibo/>');
	
	// TDWG vocabularies
	$store->query('LOAD <http://rs.tdwg.org/ontology/voc/Common#>');
	$store->query('LOAD <http://rs.tdwg.org/ontology/voc/Collection#>');
	$store->query('LOAD <http://rs.tdwg.org/ontology/voc/PublicationCitation#>');
	$store->query('LOAD <http://rs.tdwg.org/ontology/voc/TaxonConcept#>');
	$store->query('LOAD <http://rs.tdwg.org/ontology/voc/TaxonName#>');	
	
	
	// FreeBase
	$store->query('LOAD <http://rdf.freebase.com/ns/>');
	
	// Uniprot
	//-- not RDF? $store->query('LOAD <http://purl.uniprot.org/core/'>);
	*/
	
}

?>