// Default values for the module 'chromadoc'.
module.exports = {
		/*
		 * The default tempo for festival voice generator. 
		 * - (Fri, 04 May 2018 18:38:30 +0900) Added prefix scm
		 */
		scmFestivalTempo : 150,

		/*
		 * The default voice name for festival voice generator.
		 * History
		 * - (Fri, 04 May 2018 18:38:30 +0900) Added prefix scm
		 */
		// scmFestivalVoice : 'voice_us1_mbrola',
		scmFestivalVoice : 'voice_us2_mbrola',

		/*
		 * Default voice string filter for festival voice generator.
		 * History
		 * - (Fri, 04 May 2018 18:38:30 +0900) Renamed from voiceFilter() to festivalFilter().
		 */
        /*
         * festivalFilter : require( "chromadoc/formatter" ).defaultFestivalFilter,
         */
        festivalFilter : ( captionObject )=>{
            if ( ! captionObject ) {
                return captionObject;
            }

            var result = captionObject.duplicate();

            result.festival = result.festival.
                replace( /è/g, 'e' ).
                replace( /”/g, '"' ).
                replace( /“/g, '"' );

            // REMOVED >>> (Wed, 12 Feb 2020 13:05:12 +0900)
            // replace( /\btextit\b/g,'' );
            // REMOVED <<< (Wed, 12 Feb 2020 13:05:12 +0900)

            // (Wed, 12 Feb 2020 10:28:35 +0900)
            // Default filter must be applied after other filters.  It adds a
            // period character depending if the string is a null string or
            // not. For further information, see the code of the default
            // filter.
            result = require( 'chromadoc/formatter' ).defaultFestivalFilter( result );

            return result;
        },

		/*
		 *  "eventhandler"
		 *  "eventhandler" is used to filter various values which are generated
		 *  druing a writeScore() session. 
		 * 
		 *  Generally `filter` should not be an arrow function since it receives
		 *  ScaleGenerator object as `this` pointer.  But as a default value, it
		 *  is not necessary to receive this so it can be an arrow function.
		 * 
		 *  History
		 *  - (Sat, 28 Apr 2018 23:35:23 +0900) Created
		 *  - (Fri, 04 May 2018 17:21:44 +0900) Moved from ScaleGenerator to settings.js
		 *                                      Renamed from filter to eventhandler
		 *
		 */
		eventhandler : (eventtype,id,notes,text)=>text,

		/*
		 * The default value of a size which is refered by writeScore() function.
		 * This is applied in \includegraphics command of tex output file. 1.0
		 * means 100% width of its container document.
		 *
		 * History
		 * - (Fri, 04 May 2018 17:59:09 +0900) Renamed from size to texGraphicWidth.
		 */
		texGraphicWidth : '1.0',

		/*
		 * The default value of a size which is refered by writeScore() function.
		 */
		lyTextBefore : null,

		/*
		 * The default value of a size which is refered by writeScore()
		 * function.  If textAfter is an array, then it will be converted to a
		 * lilypond code block that specify a paper dimension.  In such case,
		 * it is interpreted as [h,w]. The unit is(maybe) inch.
		 */
		lyTextAfter : [8,3],


        /*
         * This two values control the festival compiling process.
         *
         * scmDoCompile 
         *     When the value is true, the system compiles the generated voice
         *     file by executing Festival's text2voice command.
         *
         * scmDoPlay 
         *     When the value is true, the system opens the synthesized 
         *     voice file after the compilation.
         */
        scmDoCompile : true,
        scmDoPlay  : false,

        /*
         * Specifying the command line to execute lilypond.  This default
         * setting refers the environment variable LILYPOND_INCLUDE_DIR
         * which should keep search path for to include library files.
         */
        __lilypondCommandLine : (function() {
            if ( process.env.LILYPOND_INCLUDE_DIR ) {
                console.error( 'LILYPOND_INCLUDE_DIR = ' + process.env.LILYPOND_INCLUDE_DIR );
                return "lilypond -I " + process.env.LILYPOND_INCLUDE_DIR;
            } else {
                console.error( '** warning ** LILYPOND_INCLUDE_DIR is not set!' );
                return "lilypond ";
            }
        })(),
	};
