/*

Shared code


*/

//----------------------------------------------------------------------------------------
// http://stackoverflow.com/a/25715455
function isObject (item) {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

//----------------------------------------------------------------------------------------
// http://stackoverflow.com/a/21445415
function uniques(arr) {
  var a = [];
  for (var i = 0, l = arr.length; i < l; i++)
    if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
      a.push(arr[i]);
  return a;
}

		
//----------------------------------------------------------------------------------------
// Store a triple with optional language code
function triple(subject, predicate, object, language) {
  var triple = [];
  triple[0] = subject;
  triple[1] = predicate;
  triple[2] = object;
  
  if (typeof language === 'undefined') {
  } else {
    triple[3] = language;
  }
  
  return triple;
}

//----------------------------------------------------------------------------------------
// Store a quad (not used at present)
function quad(subject, predicate, object, context) {
  var triple = [];
  triple[0] = $subject;
  triple[1] = $predicate;
  triple[2] = $object;
  triple[3] = $context;
  
  return triple;
}

//----------------------------------------------------------------------------------------
// Enclose triple in suitable wrapping for HTML display or triplet output
function wrap(s, html) {
if (s) {

  if (s.match(/^(http|urn|_:)/)) {
    if (html) {
      s = '&lt;' + s + '&gt;';
    } else {
      s = '<' + s + '>';
    }
  } else {
    s = '"' + s.replace(/"/g, '\\"') + '"';
  }}
  return s;
}

//----------------------------------------------------------------------------------------
// https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//----------------------------------------------------------------------------------------
function output(doc, triples) {
 
 	  for (var i in triples) {
		var s = 0;
		var p = 1;
		var o = 2;
		//emit([wrap(triples[i][s], false), wrap(triples[i][p], false), wrap(triples[i][o], false)], 1);

    var lang = 3;

      var nquads = wrap(triples[i][s], false) 
	    	+ ' ' + wrap(triples[i][p], false) 
	    	+ ' ' + wrap(triples[i][o], false);
	    if (triples[i][lang]) {
	    	nquads += '@' + triples[i][lang];
	    }
	    	
	    nquads += ' .' + "\n";


      emit(doc._id, nquads);
	  }
  
}


// START COUCHDB VIEW
function message(doc) {

	// to do, make this more general
    var subject_id = doc._id;

	if (subject_id.match(/^biostor\/\d+/)) {
		subject_id = subject_id.replace(/biostor\//, 'http://biostor.org/reference/');
	}

	if (subject_id.match(/^[a-z0-9]+$/)) {
		subject_id = 'http://bionames.org/references/' + doc._id;
	}

    var triples = [];
    var type = '';

    for (var i in doc) {
    
      switch (i) {
      
        case 'identifier':
        	for (var j in doc[i]) {
        		switch (doc[i][j].type) {
        		
 					case 'biostor':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://biostor.org/reference/' + doc[i][j].id));
        				break;
        		
        			case 'doi':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://identifiers.org/doi/' + doc[i][j].id.toLowerCase()));
        				break;

        			case 'handle':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://hdl.handle.net/' + doc[i][j].id));
        				break;
        				
        			// at this level it is the isbn for a book
        			case 'isbn':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://identifiers.org/isbn/' + doc[i][j].id));
							
						  triples.push(triple(subject_id,
							'http://schema.org/isbn',
							doc[i][j].id));
						  
        				break;

       				case 'jstor':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://www.jstor.org/stable/' + doc[i][j].id));
        				break;

       				case 'oclc':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://www.worldcat.org/oclc/' + doc[i][j].id));
        				break;

        			case 'pmc':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://identifiers.org/pmc/' + doc[i][j].id));
        				break;

        			case 'pmid':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://identifiers.org/pmid/' + doc[i][j].id.toString()));
        				break;
        				
        			case 'zoobank':
						  triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							'http://zoobank.org/' + doc[i][j].id.toLowerCase()));
							
 							triples.push(triple(subject_id,
							'http://purl.org/dc/terms/identifier',
							doc[i][j].id.toLowerCase()));							
        				break;
        				       		
        			default:
        				break;
        		}      	
        	}
        	break;
        	
        	
        case 'bhl_pages':
			// Treat collection of pages as a workExample,
			// and each page is a part of that workExample
			var work_id = subject_id + '#pages';
			
			triples.push(triple(subject_id,
               			'http://schema.org/workExample',
						  work_id));   
						  
			  triples.push(triple(work_id,
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
			  'http://schema.org/CreativeWork'));

            var page_counter = 1;
            for (var j in doc[i]) {
            
               var page_id = 'http://www.biodiversity.org/page/' + doc[i][j];
               
               // link to article
				triples.push(triple(work_id,
               			'http://schema.org/hasPart',
						  page_id));               
               
               triples.push(triple(page_id,
               			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
						  'http://schema.org/CreativeWork'));
						  
				triples.push(triple(page_id,
               			'http://schema.org/name',
						  j));	
						  
				// image
				triples.push(triple(page_id,
               			'http://schema.org/image',
						'http://www.biodiversitylibrary.org/pageimage/' + doc[i][j]));	
				
				// thumbnail
				triples.push(triple(page_id,
               			'http://schema.org/thumbnailUrl',
						'http://www.biodiversitylibrary.org/pagethumb/' + doc[i][j]));	
				
				
				// ocr
				triples.push(triple(page_id,
               			'http://schema.org/text',
						'http://www.biodiversitylibrary.org/pageocr/' + doc[i][j]));	

				triples.push(triple(page_id,
               			'http://schema.org/position',
						page_counter.toString()));	
									  
            	page_counter++;
            }
        	break;
        	
        case 'link':
           var link_count = 0;
        	for (var j in doc[i]) {
        		switch (doc[i][j].anchor) {
        		
        			case 'LINK':
        				url = doc[i][j].url;
        				url = url.replace(/http:\/\/direct.biostor.org/, 'http://biostor.org'); // hack
        			triples.push(triple(subject_id,
						  'http://schema.org/url',
						  url));
        				break;
        		
        			case 'PDF':
        				var link_id = subject_id + '#link_' + (link_count + 1);

					  // type
					  triples.push(triple(link_id,
						'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
						'http://schema.org/CreativeWork'));
						
					 
						triples.push(triple(link_id,
						  'http://schema.org/url',
						  doc[i][j].url));

						triples.push(triple(link_id,
							'http://schema.org/fileFormat',
							'application/pdf'));
							
							
						// sha1
						if (doc.file) {
						  if (doc.file.sha1) {
							triples.push(triple(link_id,
								'http://id.loc.gov/vocabulary/preservation/cryptographicHashFunctions/sha1',
								doc.file.sha1));
							}
						}

						// link to work
						triples.push(triple(subject_id,
						  'http://schema.org/workExample',
						  link_id));
       				break;

         				       		
        			default:
        				break;
        		}      	
        	}
        	break;        	
			
		case 'type':
			switch (doc[i]) {
			  case 'article':
			    type = 'http://schema.org/ScholarlyArticle';
				break;
			  case 'book':
			    type = 'http://schema.org/Book';
				break;
			  case 'chapter':
			    type = 'http://schema.org/Chapter';
				break;
			  default:
				break;
			}
			break;
			  
          // title can be string or array
        case 'title':
            triples.push(triple(subject_id,
              'http://schema.org/name',
              doc[i]));
          break;

        case 'journal':
           var issn = '';
           var oclc = '';
           var journal_id = '';
           
           // do we have an ISSN?
           if (doc.journal.identifier) {
           	 for (var j in doc.journal.identifier) {
           	   if (doc.journal.identifier[j].type == 'issn') {
           	     issn = doc.journal.identifier[j].id;
           	   }
           	   if (doc.journal.identifier[j].type == 'oclc') {
           	     oclc = doc.journal.identifier[j].id;
           	   }
           	 } 
           }
           
           if (issn != '') {
			 journal_id = 'http://identifiers.org/issn/' + issn;
		   } else {
		     if (oclc != '') {
		       journal_id = 'http://www.worldcat.org/oclc/' + oclc;
		     } else {
		       // No identifier, just use name
		       triples.push(triple(subject_id,
				'http://prismstandard.org/namespaces/basic/2.1/publicationName',
				doc.journal.name));
		     }
		   }
		   
		   if (journal_id != '') {
			  triples.push(triple(subject_id,
				'http://schema.org/isPartOf',
				journal_id
			  ));
		 
			  // type
			  triples.push(triple(journal_id,
				'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
				'http://schema.org/Periodical'));
				
			  // name
			  triples.push(triple(journal_id,
				'http://schema.org/name',
				doc.journal.name));
				
              if (issn != '') {       
					triples.push(triple(journal_id,
									'http://schema.org/issn',
									issn));              
               }  
             
				triples.push(triple(journal_id,
						'http://purl.org/dc/terms/identifier',
						journal_id));              
              
              
              // article metadata
              if (doc.journal.volume) {
				triples.push(triple(subject_id,
			  		'http://schema.org/volumeNumber',
			  		doc.journal.volume.toString()));
			  }

              if (doc.journal.issue) {
				triples.push(triple(subject_id,
			  		'http://schema.org/issueNumber',
			  		doc.journal.issue.toString()));
			  }
 
              if (doc.journal.pages) {
					var parts = doc.journal.pages.match(/^(.*)\--(.*)$/);
					if (parts) {
					  triples.push(triple(subject_id,
						'http://schema.org/pageStart',
						parts[1]));
					  triples.push(triple(subject_id,
						'http://schema.org/pageEnd',
						parts[2]));
					} else {
					  triples.push(triple(subject_id,
						'http://schema.org/pagination',
						doc.journal.pages.toString()));
					}              
			  }
            
           
           
           }
           break;
           
        // book (chapter)
        case 'book':
           var isbn = '';
           var oclc = '';
           var book_id = '';
           
           // do we have an ISBN?
           if (doc.book.identifier) {
           	 for (var j in doc.book.identifier) {
           	   if (doc.book.identifier[j].type == 'isbn') {
           	     isbn = doc.book.identifier[j].id;
           	   }
           	   if (doc.book.identifier[j].type == 'oclc') {
           	     oclc = doc.book.identifier[j].id;
           	   }
           	 } 
           }
           
           if (isbn != '') {
			 book_id = 'http://identifiers.org/isbn/' + isbn;
		   } else {
		     if (oclc != '') {
			   book_id = 'http://www.worldcat.org/oclc/' + oclc;
		     }
		   }
		   
		   if (book_id != '') {
			  triples.push(triple(subject_id,
				'http://schema.org/isPartOf',
				book_id
			  ));
		 
			  // type
			  triples.push(triple(book_id,
				'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
				'http://schema.org/Book'));
				
			  // name
			  triples.push(triple(book_id,
				'http://schema.org/name',
				doc.book.title));
				
              if (isbn != '') {              
					triples.push(triple(book_id,
									'http://schema.org/isbn',
									isbn));              
              }
			triples.push(triple(book_id,
					'http://purl.org/dc/terms/identifier',
					book_id));              
              
              // chapter metadata
              
              if (doc.book.editor) {
					var n = doc.book.editor.length;
			
					// store an ordered list of authors as well
			
					//http://purl.org/ontology/bibo/contributorList
			
			
					for (var j = 0; j < n; j++) {
					  var editor_id = '';

					  // create identifier
					  editor_id = subject_id + '#editor_' + (j + 1);

					  // type, need to handle organisations as authors
					  triples.push(triple(editor_id,
						'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
						'http://schema.org/Person'));

					  triples.push(triple(book_id,
						'http://schema.org/editor',
						editor_id));

					  // name
					  if (doc.book.editor[j].firstname) {
						triples.push(triple(editor_id,
						  'http://schema.org/givenName', // ?
						  doc.book.editor[j].firstname));
					  }

					  if (doc.book.editor[j].lastname) {
						triples.push(triple(editor_id,
						  'http://schema.org/familyName', // ?
						  doc.book.editor[j].lastname));
					  }
			  
					  if (doc.book.editor[j].name) {
						triples.push(triple(editor_id,
						  'http://schema.org/name', // ?
						  doc.book.editor[j].name));
					  }
					}
              
              
              }
 
              if (doc.book.pages) {
					var parts = doc.book.pages.match(/^(.*)\--(.*)$/);
					if (parts) {
					  triples.push(triple(subject_id,
						'http://schema.org/pageStart',
						parts[1]));
					  triples.push(triple(subject_id,
						'http://schema.org/pageEnd',
						parts[2]));
					} else {
					  triples.push(triple(subject_id,
						'http://schema.org/pagination',
						doc.book.pages));
					}              
			  }
            
           
           
           }
           break;           
          
		  case 'author':
			var n = doc[i].length;
			
			// store an ordered list of authors as well
			
			//http://purl.org/ontology/bibo/contributorList
			
			
			for (var j = 0; j < n; j++) {
			  var author_id = '';

			  // create identifier
			  author_id = subject_id + '#author_' + (j + 1);

			  // type, need to handle organisations as authors
			  triples.push(triple(author_id,
				'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
				'http://schema.org/Person'));

			  triples.push(triple(subject_id,
				'http://schema.org/author',
				author_id));

			  // name
			  if (doc[i][j].firstname) {
				triples.push(triple(author_id,
				  'http://schema.org/givenName', // ?
				  doc[i][j].firstname));
			  }

			  if (doc[i][j].lastname) {
				triples.push(triple(author_id,
				  'http://schema.org/familyName', // ?
				  doc[i][j].lastname));
			  }
			  
			  if (doc[i][j].name) {
				triples.push(triple(author_id,
				  'http://schema.org/name', // ?
				  doc[i][j].name));
			  }
			}
			break;
			
        case 'publisher':
        	if (isObject(doc[i])) {
        		if (doc[i].name) {
        			triples.push(triple(subject_id,
    	        	  'http://schema.org/publisher',
        	     	 doc[i].name));
        		}
        	} else {
	            triples.push(triple(subject_id,
    	          'http://schema.org/publisher',
        	      doc[i]));
        	}
          break;

        case 'abstract':
            triples.push(triple(subject_id,
              'http://schema.org/description',
              doc[i]));
          break;
			
			
        case 'year':
            triples.push(triple(subject_id,
              'http://schema.org/datePublished',
              doc[i].toString()));
          break;

        default:
          break;
      }
    }
    

    if (type == '') {
      type = 'http://schema.org/CreativeWork';
    }
    

    // defaults
    triples.push(triple(subject_id,
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      type));

    output(doc, triples);
  
}

function (doc) {
  var types = ['article','book','chapter','generic'];
  var type = types.indexOf(doc.type);

  if (type != -1) {
  	message(doc);
  }
 
}

// END COUCHDB VIEW