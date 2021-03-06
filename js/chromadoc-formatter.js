#!/usr/bin/nodejs

var fs = require( 'fs' );
var cht  = require( 'chromadoc/template' );

function init( __settings ) {
	// ScaleGenerator.voiceName = 'voice_us1_mbrola';
	function fmt( i, len ) {
		var s = String(i);
		while ( s.length < len ) {
			s ='0' + s; 
		}
		return s;
	}

	function toPDF( filename ) {
		return filename.replace( /\.ly$/, '.pdf' );
	}


	function ScaleGenerator( outputPath, filenamePrefix, templatePath ) {
		if ( ! filenamePrefix )
			filenamePrefix = ScaleGenerator.fname;
        console.error( 'filename-prefix=', filenamePrefix );
		if (! outputPath || ! filenamePrefix ) throw new Error();

		this.outputPath = outputPath;
		this.filenamePrefix = filenamePrefix;
		this.templatePath = templatePath;
		this.filenameCounter = {};
		this.includeText = "";
		this.valueCurrentOutputFilename = "";
		this.settings = Object.assign( {}, 
				require ( 'chromadoc/settings' ), 
				ScaleGenerator.__globalSettings, 
				__settings );

		this.developmentMode = false;
		this.alwaysOutputHeader = false;
		this.enabled = false;

		this.initBoundFunctions();
	}

	Object.defineProperties( ScaleGenerator.prototype, {
		valid : {
			configurable : false,
			get : function() {
				if ( this.developmentMode && ( ! this.enabled ) ) return false;
				return true;
			},
		},
	});


	ScaleGenerator.writeFile  = function( filename, output ) {
		fs.writeFileSync( filename, output, 'utf8' );
		console.error( "generated ", filename );
	};
	ScaleGenerator.appendFile  = function( filename, output ) {
		fs.appendFileSync( filename, output, 'utf8' );
	};

	ScaleGenerator.prototype.setDevelopmentMode = function( value ) {
		this.developmentMode = value ? true : false;
	};
	ScaleGenerator.prototype.setAlwaysOutputHeader = function( value ) {
		this.alwaysOutputHeader = value ? true : false;
	};
	ScaleGenerator.prototype.enable = function() {
		this.enabled = true;
	};

	ScaleGenerator.prototype.disable = function() {
		this.enabled = false;
	};

	ScaleGenerator.prototype.nextOutputFilename = function( id, fileExtension ) {
		var counterID = 'all';
		if ( typeof this.filenameCounter[ counterID ] === 'undefined' ) {
			this.filenameCounter[ counterID ] = 0;
		}
		var value = this.filenameCounter[ counterID ]++;

		this.valueCurrentOutputFilename = this.filenamePrefix + '-' + fmt( value ,5 ) + '-' + id + '.' + fileExtension;
	};

	ScaleGenerator.prototype.currentOutputFilename = function(id) {
		return this.outputPath + this.valueCurrentOutputFilename;
	};
	ScaleGenerator.prototype.currentOutputFilenameAsPDF = function(id) {
		return toPDF( this.valueCurrentOutputFilename );
	};

	ScaleGenerator.prototype.mainOutputFilename = function() {
		return this.filenamePrefix + '-' + "output" + '.tex';
	};

	ScaleGenerator.prototype.commonOutputFilename = function(id) {
		return this.outputPath + "output.tex";
	};

	ScaleGenerator.prototype.writeIncludeText = function writeIncludeText( s ) {
		this.includeText += s;
	};

	ScaleGenerator.notes2id = function( notes ) {
		var id = notes.split( /\s+/ ).shift();
		if ( id ) 
			id.replace( /(^[a-zA-Z0-9\-_]+)(.*)$/ , (s0,s1,s2)=> s1 );
		if ( ! id  )
			throw new Error( "Invalid ID (" + id + ")" );
		return id;
	};

	/////////////////////////////////////////////////////////
	//
	// writeScore()
	//
	/////////////////////////////////////////////////////////

	/*
	 * writeScore( [id], notes, [settings] )
	 */
	function transpose( value, settings ) {
		return require( 'chromatic-solfege' ).transposeScript( value, settings ).join( " " )
	}

	function toNotes_pre( s ) {
		// s = s.replace( /\n/gm, ' \\bar "" \\break ' );
		return s;
	}
	function toNotes_post( s ) {
		// console.error( s );
		// s = s.replace( /\|\.\|/g,  '\\bar "|.|" ' );
		return s.split( / +/ ).map( (s)=> {
			switch ( s ) {
				case '|'   : return ' \\bar "|" ';
				case '||'  : return ' \\bar "||" ';
				case '.|'  : return ' \\bar ".|" ';
				case '|.'  : return ' \\bar "|." ';
				case '|.|' : return ' \\bar "|.|" ';
				case '!'   : return ' \\bar "" \\break ';
				case '|!'  : return ' \\bar "|" \\break ';
				// case '\n'  : return ' \\bar "" \\break ';
			}
			return s;

			// if ( /\|\|/g.exec( s ) ) return '\\bar "||" ';
			// if ( /\|\./g.exec( s ) ) return '\\bar "|." ';
			// if ( /\.\|/g.exec( s ) ) return '\\bar ".|" ';
			// if ( /\|/g  .exec( s ) ) return '\\bar "|" ' ;
			// if ( /\n/gm .exec( s ) ) return ' \\bar "" \\break ';
		}).join(' ');

		// console.error( s );
		// return s;
	}
	function toNotes( s, settings ) {
		if ( ! settings  ) {
			settings = {};
		}
		s = toNotes_pre( s );
		s = transpose( s, settings );
		s = toNotes_post( s );
		return s;
	}

	ScaleGenerator.toNotes = toNotes;


	function checkErrorForQuery( curr_settings ) { 
		// /*
		//  * ERROR CHECKING FOR IRREGULAR PATTERN NO1
		//  *
		//  * queryFretDiagram() sets executeQuery flag to 'true'.
		//  * If so, only queries are accepted; otherwise this throws an exception.
		//  */
		// if ( curr_settings.executeQuery && ! curr_settings.formatType.startsWith( 'query' ) )
		// 	throw new Error( 'Unknown Display Type :' + curr_settings.formatType  );

		// /*
		//  * ERROR CHECKING FOR IRREGULAR PATTERN NO2
		//  *
		//  * if formatType starts with 'query' was passed by other than queryFretDiagram() ,
		//  * this is also not acceptable.
		//  */
		// if ( ! curr_settings.executeQuery && curr_settings.formatType.startsWith( 'query' ) )
		// 	throw new Error( 'Illegal formatType :' + curr_settings.formatType  );

		// /*
		//  * formatType should be one of 
		//  *    - 'queryFretDiagram'
		//  *    - 'queryVisibleNotesFretDiagram' 
		//  * Otherwise, it will throw an exception.
		//  */
		// if ( curr_settings.formatType.startsWith( 'query' ) ) {
		// 	switch ( curr_settings.formatType ) {
		// 		case 'queryFretDiagram' :
		// 		case 'queryRangeFretDiagram' :
		// 		case 'queryVisibleNotesFretDiagram' :
		// 			break;
		// 		default :
		// 			throw new Error( 'Unknown Display Type' + curr_settings.formatType  );
		// 	}
		// }
	}


	//
	// noteArrays = [
	//	  "do do re mi fa",
	//	  [ 'do', 'do', 're', 'mi', ],
	//	  [ 'do', 'do', 're', 'mi', ],
	// ] 
	// => This bocomes a file contains three scores.
	//

	ScaleGenerator.prototype.writeScore = function () {
		if ( this.developmentMode && ( ! this.enabled ) ) return;


		// var id, notes, texGraphicWidth, lyTextAfter, lyTextBefore, filter, settings;
		var id, notes, settings;
		var arr = Array.prototype.slice.call ( arguments );

		if ( arr.length == 0 ) {
			throw new Error( 'invalid argument error' );
		} else if ( arr.length == 1 ) {
			[ id, notes, settings ] = [ null , arr[0], {} ];
		} else {
			// See settings.js (Fri, 04 May 2018 17:31:07 +0900)
			[ id, notes, settings={} ] = arr;
			// console.error( 'id', id, 'notes', notes, 'texGraphicWidth ', texGraphicWidth );
		}

		var curr_settings = Object.assign( {}, this.settings, settings );

		// console.error( 'writeScore.curr_settings' , curr_settings );
		// console.error( '==========================================================' );

		// SPECIAL >>> (Thu, 14 Jun 2018 21:36:48 +0900)
		// checkErrorForQuery( curr_settings );
		// SPECIAL <<< (Thu, 14 Jun 2018 21:36:48 +0900)

		// console.error( "curr_settings ", curr_settings );
		// console.error( "settings", settings );

		if ( id == null ) {
			// This should be / +/ not /\s+/ because \n has special meaning here.
			// See toNotes() function.
			id = notes.split( / +/ ).shift().replace( /^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/, (s0,s1,s2,s3)=> s2 );
		}

		// console.error( id );
		if ( Array.isArray( curr_settings.lyTextAfter  ) ) {
			if ( curr_settings.lyTextAfter.length == 0 ) {
				curr_settings.lyTextAfter = [5,3];
			}
			{
				let [ __h, __w ] = curr_settings.lyTextAfter;
				curr_settings.lyTextAfter = `\
					\\paper  {
						#(set! paper-alist (cons '("a4insides" . (cons (* ${__h} in) (* ${__w} in))) paper-alist))
						#(set-paper-size "a4insides")
					}
					`.replace(/^\s{5}/gm,'');
			}
		}

		// console.error( 'notes', notes );
		// console.error( 'settings', curr_settings );

		var output = cht.template( [ { notes : toNotes( notes, curr_settings ) } ] ,  curr_settings );

		// SPECIAL >>> (Thu, 14 Jun 2018 21:36:48 +0900)
		if ( curr_settings.formatType && curr_settings.formatType.startsWith( 'query' )  ) {
			let lilypondCommandLine = require( "chromadoc/lilyutils" ).getLilypondCommandLine();
            let queryFileBase  = this.currentOutputFilename() + "-query-fretdiagram";
			let queryFileName  =                                  queryFileBase + ".ly";
			let resultFileName =                                  queryFileBase + '.LOG';
			let tempFileName   =                                  queryFileBase + '-tmp';

			require('fs').writeFileSync( queryFileName , output, 'utf8' );
			// require('child_process').execSync( 'lilypond -I /home/ats/Documents/lilypond/include/ "' + queryFileName + '" > "' + resultFileName + '"' );
			require('child_process').execSync( lilypondCommandLine +  ' --output="' + tempFileName + '" "' + queryFileName + '" > "' + resultFileName + '"' );
            // Read the result file.
			let queryResult = require('fs').readFileSync( resultFileName, 'utf8' ) ;
            // Remove the temporary files.
			require('child_process').execSync( "rm -v \"" + queryFileBase + "\"* ", {stdio: [process.stdin, process.stdout, process.stderr]} );
			return JSON.parse( queryResult );
		}
		// SPECIAL <<< (Thu, 14 Jun 2018 21:36:48 +0900)

		{
			let lyTextBefore = curr_settings.eventhandler.call( 
					this, 'before', id, notes, curr_settings.lyTextBefore );
			if ( lyTextBefore )
				output = lyTextBefore + '\n\n' + output;
		}

		{
			let lyTextAfter  = curr_settings.eventhandler.call( 
					this, 'after',  id, notes, curr_settings.lyTextAfter );
			if ( lyTextAfter )
				output = output + '\n\n' + lyTextAfter + '\n';
		}
		this.nextOutputFilename( id, 'ly' );
		ScaleGenerator.writeFile( this.currentOutputFilename(), output );
		this.writeIncludeText(
				curr_settings.eventhandler.call( this, 'tex',id, notes, 
					'\\noindent $\\vcenter{ \\hbox{ \\includegraphics[width=' + 
					curr_settings.texGraphicWidth + 
					' \\textwidth]{' + 
					this.currentOutputFilenameAsPDF() + 
					'}}}$\n' ));
	};

	ScaleGenerator.prototype.queryFretDiagram = function ( type, notes, settings ) {
		if ( ! settings )
			settings = {};
		settings = Object.assign( {}, settings );

		settings.executeQuery = true;
		settings.formatType = 'query' + type + "FretDiagram";

		// console.error( 'settings', settings );
		return ScaleGenerator.prototype.writeScore.call( this, null, notes, settings );
	};


	function caption2id( caption ) {
		var id = caption.replace( /[^a-zA-Z0-9]/g, "" );
		// Limit the maximum length of id
		if ( 24 < id.length )
			id = id.substring(0,24);
		return id;
	};
	ScaleGenerator.caption2id = caption2id;

	ScaleGenerator.prototype.writeDiagram = function () {
		var id ='diagram';
		var output = '';

		this.nextOutputFilename( id, 'ly' );
		ScaleGenerator.writeFile( this.currentOutputFilename(), output );
		this.writeIncludeText(
				curr_settings.eventhandler.call( this, 'tex',id, notes, 
					'\\noindent $\\vcenter{ \\hbox{ \\includegraphics[width=' + 
					curr_settings.texGraphicWidth + 
					' \\textwidth]{' + 
					this.currentOutputFilenameAsPDF() + 
					'}}}$\n' ));

	};

	ScaleGenerator.prototype.writeHeaderVoice = function( captionObject ) {
        var festivalCaption = captionObject.festival;
        var prefix = captionObject.type;

        // Suppress output empty files.
        // (Wed, 12 Feb 2020 09:19:21 +0900)
        /* 
         * NOTE: I could not find the code the generate a malformed empty
         * caption '.'; thought it is suffice to suppress the output when it is
         * '.'.  Please fix it if you find the real reason it outputs it. 
         */ 
        festivalCaption = festivalCaption.trim();
        if ( festivalCaption == '' || festivalCaption == '.' ) {
            return;
        }

		var id = prefix + '-' + caption2id( festivalCaption );
		this.nextOutputFilename( id, 'ftxt' );
		var filename = this.currentOutputFilename();

		ScaleGenerator.writeFile( filename , festivalCaption );

		// fs.writeFileSync( filename + ".ftxt" , festivalCaption , 'utf8' );
		// require('child_process').execSync( 'text2wave -eval "(' + ScaleGenerator.voiceName + ')" ' + filename + ".ftxt" + '>' + filename + ".wav" );
	}

    function CaptionObject( type, festival, caption ) {
        this.type = type;
        this.festival = festival;
        this.caption = caption;
    }
    CaptionObject.prototype.duplicate = function() {
        return new CaptionObject( this.type, this.festival, this.caption );
    };

	/*
	 * CaptionObject {
	 *     festival : "string",
	 *     caption  : "string",
	 * };
	 */
    ScaleGenerator.createCaptionObject = function createCaptionObject( type, captionString ) {
        return new CaptionObject( type, captionString, captionString );
    };

	ScaleGenerator.prototype.writeAbstract = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;

        // Let it say "abstract" 
        // >>> (Tue, 11 Feb 2020 11:05:10 +0900) 
        {
            var captionObject1 = 
                this.settings.festivalFilter(
                        ScaleGenerator.createCaptionObject( "HeaderAbstract", "Abstract" ) );

            this.writeHeaderVoice( captionObject1 );
        }
        // <<< (Tue, 11 Feb 2020 11:05:10 +0900) 
        {
            var captionObject2 = 
                this.settings.festivalFilter( 
                        ScaleGenerator.createCaptionObject( "TextBodyAbstract", caption ) );

            this.writeHeaderVoice( captionObject2 );
            this.writeIncludeText('\\begin{abstract}' + captionObject2.caption + '\\end{abstract}\n' );
        }

	};
	ScaleGenerator.prototype.writeHeaderPart = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "HeaderPart", caption ) );
		// var filtered  = this.settings.festivalFilter( 'part', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText('\\part{' + filtered.caption + '}\n' );
	};
	ScaleGenerator.prototype.writeHeader0 = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "Header0", caption ) );
		// var filtered  = this.settings.festivalFilter( 'header0', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText('\\section{' + filtered.caption + '}\n' );
	};

	ScaleGenerator.prototype.writeHeader1 = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "Header1", caption ) );
		// var filtered  = this.settings.festivalFilter( 'header1', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText('\\subsection{' + filtered.caption + '}\n' );
	};

	ScaleGenerator.prototype.writeHeader2 = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "Header2", caption ) );
		// var filtered  = this.settings.festivalFilter( 'header2', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText( '\\subsubsection{' + filtered.caption + '}\n' );
	};
	ScaleGenerator.prototype.writeHeader3 = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "Header3", caption ) );
		// var filtered  = this.settings.festivalFilter( 'header3', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText( '\\paragraph{' + filtered.caption + '}\n' );
	};
	ScaleGenerator.prototype.writeHeader4 = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "Header4", caption ) );
		// var filtered  = this.settings.festivalFilter( 'header4', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText( '\\subparagraph{' + filtered.caption + '}\n' );
	};

	ScaleGenerator.prototype.writeTextBody = function(caption) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
        var filtered = 
            this.settings.festivalFilter( 
                    ScaleGenerator.createCaptionObject( "TextBody", caption ) );
		// var filtered  = this.settings.festivalFilter(  'body', caption );
		this.writeHeaderVoice( filtered );
		this.writeIncludeText( '' + filtered.caption + '\n\n' );
	};

	// writeCommand() outputs only tex commands but does not output festival commands.
	ScaleGenerator.prototype.writeCommands = function( commands ) {
		if ( this.developmentMode && ( ! this.alwaysOutputHeader ) && ( ! this.enabled ) ) return;
		this.writeIncludeText( '' +  commands  + '\n\n' );
	};
	ScaleGenerator.prototype.writeTOC = function() {
		this.writeCommands( "\\tableofcontents" );
	};
	ScaleGenerator.prototype.writeNewPage = function() {
		this.writeCommands( "~\\newpage" );
	};
	ScaleGenerator.prototype.writeNewLine = function() {
		this.writeCommands( "\\\\~" );
	};
	function makeTagFunction( func ) {
		return function ( tag ) {
			func.call( this, String.raw( tag ) );
		};
	}

	ScaleGenerator.prototype.t_abstract   = makeTagFunction( ScaleGenerator.prototype.writeAbstract   );
	ScaleGenerator.prototype.t_headerPart = makeTagFunction( ScaleGenerator.prototype.writeHeaderPart );
	ScaleGenerator.prototype.t_header0    = makeTagFunction( ScaleGenerator.prototype.writeHeader0    );
	ScaleGenerator.prototype.t_header1    = makeTagFunction( ScaleGenerator.prototype.writeHeader1    );
	ScaleGenerator.prototype.t_header2    = makeTagFunction( ScaleGenerator.prototype.writeHeader2    );
	ScaleGenerator.prototype.t_header3    = makeTagFunction( ScaleGenerator.prototype.writeHeader3    );
	ScaleGenerator.prototype.t_textBody   = makeTagFunction( ScaleGenerator.prototype.writeTextBody   );
	ScaleGenerator.prototype.t_commands   = makeTagFunction( ScaleGenerator.prototype.writeCommands   );
	ScaleGenerator.prototype.t_score      = makeTagFunction( ScaleGenerator.prototype.writeScore      );
	ScaleGenerator.prototype.t_diagram    = makeTagFunction( ScaleGenerator.prototype.writeDiagram    );

	ScaleGenerator.prototype.t_TOC        = makeTagFunction( ScaleGenerator.prototype.writeTOC        );
	ScaleGenerator.prototype.t_newPage    = makeTagFunction( ScaleGenerator.prototype.writeNewPage    );
	ScaleGenerator.prototype.t_newLine    = makeTagFunction( ScaleGenerator.prototype.writeNewLine    );

	ScaleGenerator.boundFunctionNameList = [
		't_abstract'      ,
		't_headerPart'    ,
		't_header0'       ,
		't_header1'       ,
		't_header2'       ,
		't_header3'       ,
		't_textBody'      ,
		't_commands'      ,
		't_score'         ,
		't_diagram'       ,
		't_TOC'           ,
		't_newPage'       ,
		't_newLine'       ,
		'writeAbstract'   ,
		'writeHeaderPart' ,
		'writeHeader0'    ,
		'writeHeader1'    ,
		'writeHeader2'    ,
		'writeHeader3'    ,
		'writeTextBody'   ,
		'writeCommands'   ,
		'writeScore'      ,
		'writeDiagram'    ,
		'writeTOC'        ,
		'writeNewPage'    ,
		'writeNewLine'    ,
	];

	ScaleGenerator.prototype.initBoundFunctions = function() {
		this.boundFunctions = {};
		var list= ScaleGenerator.boundFunctionNameList;
		for ( var i=0; i<list.length; i++ ) {
			this.boundFunctions[ list[i] ] = ScaleGenerator.prototype[ list[i] ].bind( this );
		}

		// this.boundFunctions ={
		// 	t_abstract      : ScaleGenerator.prototype.t_abstract      .bind( this ),
		// 	t_headerPart    : ScaleGenerator.prototype.t_headerPart    .bind( this ),
		// 	t_header0       : ScaleGenerator.prototype.t_header0       .bind( this ),
		// 	t_header1       : ScaleGenerator.prototype.t_header1       .bind( this ),
		// 	t_header2       : ScaleGenerator.prototype.t_header2       .bind( this ),
		// 	t_header3       : ScaleGenerator.prototype.t_header3       .bind( this ),
		// 	t_textBody      : ScaleGenerator.prototype.t_textBody      .bind( this ),
		// 	t_commands      : ScaleGenerator.prototype.t_commands      .bind( this ),
		// 	t_score         : ScaleGenerator.prototype.t_score         .bind( this ),
		// 	t_diagram       : ScaleGenerator.prototype.t_diagram       .bind( this ),
		// 't_TOC'           ,
		// 't_newPage'       ,
		// 't_newLine'       ,
		// 	writeAbstract   : ScaleGenerator.prototype.writeAbstract   .bind( this ),
		// 	writeHeaderPart : ScaleGenerator.prototype.writeHeaderPart .bind( this ),
		// 	writeHeader0    : ScaleGenerator.prototype.writeHeader0    .bind( this ),
		// 	writeHeader1    : ScaleGenerator.prototype.writeHeader1    .bind( this ),
		// 	writeHeader2    : ScaleGenerator.prototype.writeHeader2    .bind( this ),
		// 	writeHeader3    : ScaleGenerator.prototype.writeHeader3    .bind( this ),
		// 	writeTextBody   : ScaleGenerator.prototype.writeTextBody   .bind( this ),
		// 	writeCommands   : ScaleGenerator.prototype.writeCommands   .bind( this ),
		// 	writeScore      : ScaleGenerator.prototype.writeScore      .bind( this ),
		// 	writeDiagram    : ScaleGenerator.prototype.writeDiagram    .bind( this ),
		// 'writeTOC'        ,
		// 'writeNewPage'    ,
		// 'writeNewLine'    ,
		// };
	};

	ScaleGenerator.prototype.close = function(caption) {
		// Output to their main file.
		ScaleGenerator.writeFile( this.outputPath + this.mainOutputFilename(), this.includeText );

		// // Output to the common main file.
		// var commonOutput = `\\input{ ly-generated/${ this.mainOutputFilename() } }`;
		// ScaleGenerator.appendFile( this.commonOutputFilename() , commonOutput );
		// console.error( commonOutput );
	};

	ScaleGenerator.note2festival_map = [
			{ note : "de"   , festival : "daeh"   },
			{ note : "do"   , festival : "doh"    },
			{ note : "di"   , festival : "dee"    },
			{ note : "ra"   , festival : "rah"    },
			{ note : "re"   , festival : "ray"    },
			{ note : "ri"   , festival : "ree"    },
			{ note : "me"   , festival : "meh"    },
			{ note : "mi"   , festival : "mee"    },
			{ note : "ma"   , festival : "mah"    },
			{ note : "fe"   , festival : "feh"    },
			{ note : "fa"   , festival : "faah"   },
			{ note : "fi"   , festival : "fee"    },
			{ note : "se"   , festival : "saeh"   },
			{ note : "sol"  , festival : "sew"    },
			{ note : "si"   , festival : "see"    },
			{ note : "le"   , festival : "laeh"   },
			{ note : "la"   , festival : "lah"    },
			{ note : "li"   , festival : "lee"    },
			{ note : "te"   , festival : "taeh"   },
			{ note : "ti"   , festival : "tee"    },
			{ note : "ta"   , festival : "taah"   },
	
			{ note : "daw"  , festival : "daw"    },
			{ note : "raw"  , festival : "raw"    },
			{ note : "maw"  , festival : "maw"    },
			{ note : "faw"  , festival : "faw"    },
			{ note : "saw"  , festival : "saw"    },
			{ note : "law"  , festival : "law"    },
			{ note : "taw"  , festival : "taw"    },
	
			{ note : "dai"  , festival : "dai"    },
			{ note : "rai"  , festival : "rai"    },
			{ note : "mai"  , festival : "mai"    },
			{ note : "fai"  , festival : "fai"    },
			{ note : "sai"  , festival : "sai"    },
			{ note : "lai"  , festival : "lai"    },
			{ note : "tai"  , festival : "tai"    },
	
			{ note : "dae"  , festival : "dae"    },
			{ note : "rae"  , festival : "rae"    },
			{ note : "mae"  , festival : "mae"    },
			{ note : "fae"  , festival : "fae"    },
			{ note : "sae"  , festival : "sae"    },
			{ note : "lae"  , festival : "lae"    },
			{ note : "tae"  , festival : "tae"    },
	
			{ note : "dao"  , festival : "dao"    },
			{ note : "rao"  , festival : "rao"    },
			{ note : "mao"  , festival : "mao"    },
			{ note : "fao"  , festival : "fao"    },
			{ note : "sao"  , festival : "sao"    },
			{ note : "lao"  , festival : "lao"    },
			{ note : "tao"  , festival : "tao"    },
	
			{ note : "daes" , festival : "daes"   },
			{ note : "raes" , festival : "raes"   },
			{ note : "maes" , festival : "maes"   },
			{ note : "faes" , festival : "faes"   },
			{ note : "saes" , festival : "saes"   },
			{ note : "laes" , festival : "laes"   },
			{ note : "taes" , festival : "taes"   },
	
			{ note : "daos" , festival : "daos"   },
			{ note : "raos" , festival : "raos"   },
			{ note : "maos" , festival : "maos"   },
			{ note : "faos" , festival : "faos"   },
			{ note : "saos" , festival : "saos"   },
			{ note : "laos" , festival : "laos"   },
			{ note : "taos" , festival : "taos"   },
		];

	// NOT USED (Tue, 29 May 2018 05:48:36 +0900)
	ScaleGenerator.note2festival = function ( note ) {
		for ( var i=0; i<ScaleGenerator.note2festival_map.length; i++ ) {
			var obj = ScaleGenerator.note2festival_map[i]
			if ( obj.note == note  ) {
				return obj.festival;
			}
		}
		throw new Error( note + ' is not a valid note name.' );
	};

	// NOT USED (Tue, 29 May 2018 05:48:36 +0900)
	ScaleGenerator.replace_note2festival = function ( str ) {
		for ( var i=0; i<ScaleGenerator.note2festival_map.length; i++ ) {
			var obj = ScaleGenerator.note2festival_map[i]
			str = str.replace( new RegExp( `\\b${obj.note}\\b` , 'g' ), obj.festival  );
		}
		return str;
	};


	/*
	 * filtered = {
	 *     festival : "string",
	 *     caption  : "string",
	 * };
	 */
	// default function for settings.festivalFilter
	ScaleGenerator.defaultFestivalFilter = function ( captionObject ) {
		function caption2festival( type, caption ) {
			var filecontent = caption;

			// Replace tex command to plain text.
			// filecontent = filecontent.replace( /\\[a-zA-Z]+\{([^\u007d]*)\}/g, (s0,s1)=>`"${s1}"` );
			filecontent= filecontent.replace( /\\[a-zA-Z ]+{([^\u007f]*?)}/g, (s0,s1,s2)=>`${s1}` );
			filecontent= filecontent.replace( /\\([a-zA-Z]+)/g, (s0,s1)=>`${s1}` );

			// Replace  extended festival voice command.
			filecontent = filecontent.replace( /\[([a-zA-Z0-9\s\'\,]+)\]/g , 
					(s0,s1)=>s1.replace( /([a-zA-Z]+)/g, 
						(s0,s1)=> ScaleGenerator.note2festival( s1.trim() ) ) );

			// Remove line Feeds.
			filecontent = filecontent.replace( /\\\\\~/g, ""  );
			filecontent = filecontent.replace( /\\\\/g,   ""  );

			filecontent = filecontent.replace( /\s+/g, " " );

            // Suppress output empty files.
            // (Wed, 12 Feb 2020 09:19:21 +0900)
			filecontent = filecontent.trim();

            // In case the caption is null string at this point, do not add the
            // period at the end of the string.  It yields an empty string with
            // a period which causes generating an empty wave file later.  See
            // writeHeaderVoice() function; now it does not process on empty
            // strings.
            if ( filecontent == '' ) {
                return '';
            }

			// Place a period at the end if there is none.
			if ( ! /\.$/.exec( filecontent ) ) {
				filecontent = filecontent + '.\n';
            }

			return filecontent;
		};

		// Remove extended local festival commands which are special for "chromadoc-formatter.js".
		function caption2caption( type, caption ) {
			// Extract note name from do-re-mi command. (Tue, 29 May 2018 05:21:15 +0900)
			caption = caption.replace( /\[([a-zA-Z0-9\s\'\,]+)\]/g , (s0,s1)=>s1 );

			// Process double quotations.
			caption = caption.replace( /"([a-zA-Z0-9\!\?\#\s]+?)"/g , (s0,s1)=> "``" +s1 + "''" );

			return caption;
		}

        var result = captionObject.duplicate();
        result.festival = caption2festival( result.type, result.festival );
        result.caption  = caption2caption(  result.type, result.caption );
        return result;
	};

	Object.defineProperty( ScaleGenerator, 'fname', {
		configurable:false,
		get() { return process.argv[1] ? require( 'path' ).basename( process.argv[1] ).replace( /(^[^\.]*)\..*$/, "$1" )  : 'default' },
		set() {}
	})

	// not used ... maybe
	function commandInterface() {
		var args = Array.prototype.slice.call( process.argv );
		args.shift();
		args.shift();
		var notes = args.join( ' ' );
		// console.error( notes );
		process.stdout.write( cht.template( [ { notes : toNotes( notes ) } ] , this.settings ) );
		process.stdout.write( "\n" );

		// let content = '';
		// process.stdin.resume();
		// process.stdin.on('data', function(buf) { content += buf.toString(); });
		// process.stdin.on('end', function() {
		// });
	}
	ScaleGenerator.commandInterface = commandInterface;

	ScaleGenerator.init = init;

	ScaleGenerator.__globalSettings = {};
	ScaleGenerator.globalSettings = function( __globalSettings ) {
		ScaleGenerator.__globalSettings = __globalSettings;
	};

	return ScaleGenerator;
}

if ( module && module.exports ) {
	module.exports = init();
} 

if ( require.main === module ) {
	commandInterface();
}



// vim: filetype=javascript ts=4 noexpandtab:

