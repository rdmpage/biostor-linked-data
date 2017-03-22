# biostor-linked-data
Generating linked data for BioStor


## SPARQL queries

### Date and year of publication for all records

```
SELECT ?date (SUBSTR(?date,1,4) as ?year)  (COUNT(?date) as ?dateCount)
WHERE {
  ?s <http://schema.org/datePublished> ?date .
}
GROUP BY ?date
```

### Thumbnails for each BioStor record

```
SELECT ?work ?thumbnailUrl ?position
WHERE {
  ?work <http://schema.org/workExample> ?workExample .
  ?workExample <http://schema.org/hasPart> ?page .
  ?page <http://schema.org/thumbnailUrl> ?thumbnailUrl .
  ?page <http://schema.org/position> ?position .
}
LIMIT 10
```

### Author VIAF via OCLC

Given a book chapter that has an OCLC identifier, we can get possible VIAF identifiers for authors via the OCLC RDF (e.g., for OCLC number 952647 the RDF is available at http://experiment.worldcat.org/oclc/952647.rdf ). Assumes we can match on last name.

```
SELECT *
WHERE {
  ?biostor <http://schema.org/isPartOf> ?book .
  ?book <http://schema.org/editor> ?editor1 .
  ?editor1 <http://schema.org/familyName> ?fn1 .
  ?editor1 <http://schema.org/name> ?n1 .

  ?book <http://purl.org/dc/terms/identifier> ?id .
  ?id <http://schema.org/editor> ?editor2 .
  ?editor2 <http://schema.org/familyName> ?fn2 .
  ?editor2 <http://schema.org/name> ?n2 .

 
  FILTER regex(str(?editor1), "biostor", "i" ) .
  FILTER regex(str(?editor2), "viaf", "i" ) .
  
  FILTER (?fn1 = ?fn2) .
 
}
```



