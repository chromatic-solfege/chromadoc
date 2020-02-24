
Chromatic-Solfege Documentation Toolkit
=======================================

## Introduction

This toolkit contains a set of programs for writing documentation with a 
new musical notation which is named _Chromatic-Solfege_.

Chromatic-Solfege is an extension of traditional solfege system. As Solfege is 
generally known as *"do re mi"*, the traditional solfege is using name system
which is based on the diatonic scale. On the other hand, Chromatic-Solfege is
based on the twelve-tone chromatic scale. That is, every tone in the 
Chromatic-Solfege are independently named as *"do di re ri me mi fa ..."*.

This toolkit helps to write documents which contains Chromatic-Solfege
notation. With this toolkit, the notation which is written by the
Chromatic-Solfege is embeddable to a document. The notations which are embedded
to the document are automatically compiled to sheets of music and embedded to
the main document.  The compiler also automatically generates singing voice
data of every embedded notations and can be used for other purposes.

Let's call a document contains Chromatic-Solfege notation **Chromadoc**.

This toolkit contains programs to perform following tasks : 

- Automatically generating TeX file from a chromadoc.
- Transposing chromatic note names.
- Creating a sheet of music from a sequence of Chromatic-Solfege note names.
- Creating singing voice data from a sequence of Chromatic-Solfege note names.
- Automatically generating patterns of a mechanical scale practice.
- Enumerating all possible fingering pattern for the guitar from a sequence of
  Chromatic-Solfege note names and generating fingerboard charts.

## System Requirement

This system is built on following systems :

- bash
- nodejs 
- xelatex
- Lilypond
- Festival Speech Synthesis System
- SoX
- [Chromatic-Solfege for JavaScript](/chromatic-solfege-for-javascript/)

Please note that although this system is partially written by nodejs, NPM is not necessary.

## The Directory Structure

+ chromadoc
	- `readme.md`
		The file which you are now reading. In case you did not notice that
		what you are reading is actually this file, please reconfirm it now.

	- `init-chromadoc`
		A bash script file that initializes Chromadoc system. This file
		initializes PATH and other environment variables.

	+ `js`
		This is a node module directory. 
		- `chromadoc-formatter.js`
			This is the main module. This generates TeX and lilypond files.
			  
		- `chromadoc-template.js`
			A template for generating Lilypond scripts.

		- `lilyutils.js`
			This module manages a command-line to execute Lilypond. The main 
			purpose of this module maybe managing include directories of Lilypond.

		- `settings.js`
			This module manages the settings of the system.

		- `formatter.js`
			A stub to call "chromadoc-formatter.js".

		- `template.js`
			A stub to call "chromadoc-template.js".

		- `index.js`
			This is the default module for Chromadoc. And this is merely a stub 
			to `chromadoc-formatter.js`.

	+ lib-tex
		This directory is for main script files.
		- `chromadoc`
			This is the main shell script.  `chromadoc` automates compilation 
			of Chromadoc documents. This converts every specified chromadoc 
			documents into a JavaScript program and then executes all of the 
			programs. And `chromadoc` then invokes the following conversion.

		- `chromadoc2js`
			This program converts the passed Chromadoc document into a 
			JavaScript program.

		- `chromadoc2js.sh`
			The former version of `chromadoc2js` which is written by `bash`.
			Do not use this script and this file will be removed in near 
			future.

		- `chmake-tex`
			This script invokes `xelatex` command to compile the generated TeX 
			file.

		- `lilypond_cmd`
			A command-line program which outputs a command-line string to 
			execute Lilypond.

		- `music2mp3`
			A bash script file to convert all of the wave files in the 'out' 
			directory into mp3.

		- `openwav`
			This scirpt opens all of the wave files by calling `gnome-open` 
			command.

		- `bebeep`
			This program generates a fancy beep to indicate finishing the 
			conversion process.

		- `scale-generator`
			An old unused file. This could be deleted.


	+ `lib-ly`
		A directory for modules and programs for Lilypond and Festival.

		- `aaron.ly`
			This is an utility for Chromatic-Solfege. The module is managed in 
			another project and this file is simply a symlink to the project.
			See [Chromatic-Solfege for Lilypond](/chromatic-solfege-for-lilypond/)

		- `chromatic-festival.scm`
			A library which enables Festival to read the note names which are based
			on the Chromatic-Solfege correctly.

		- `chromatic-template.ly`
			This defines a Scheme function which outputs a music staff and other
			utilities.

		- `guitar-scale-diagram.ly`
			This defines Scheme functions to implement displaying fingerboard-chart
			of guitar.
		
		- `include-scm.ly`
			An utility to include Scheme scripts from Lilypond scripts. This is
			currently not used.

	+ `lib-mov`
		A directory for scripts to generate audio data and videos.
		
		- chmake-media
			This is the main script to start the generation.

		- chmake-concat
		- chmake-mp4
		- lypdf2png
		- pdfwav2mp4
		- pngwav2mp4
		- replace_text.js
		- txtwav2mp4
		- txtwav2mp4-header-template.svg
		- txtwav2mp4-template.svg
		- vid2effect
		- wav2mp4


## Usage

At first, open your terminal with bash as its shell and go to the root
directory of the Chromatic-Solfege documentation system and source a shell
script file which name is "init-chromadoc".

```bash
	. init-chromadocd
```

This will set up a number of environment variables. 

The main task of using this system is writing JavaScript programs upon
`chromatic.js` and `chromatic-formatter.js`.

```
	#!/usr/bin/nodejs

	var Chromatic = require('chromatic');
	var ChromaticFormatter = require('chromatic/formatter');
```

ChromaticFormatter is a class which capsulates a session to output tex and
lilypond scripts; it has to be instantiated on the top of the script file.

	var cf = new ChromaticFormatter( "./output/" );

The only argument of the constructor is to specify a path to a directory where
every output file goes.

    c.t_abstract`
		This document presents how to use the Chromatic-Solfege Documentation
		System. Brab rab rabra ...
	`;

	c.t_header0`Introduction`;
	c.t_textBody`
		This system is so-and-so and such-and-such.
	`;

    c.writeNewPage();
	// Ouput Table of Contents
    c.writeTOC();
    c.writeNewPage();

    c.writeScore( 'example01', `@do do4 re mi `, {} );
	
    c.close();

Note that this system heavily depends on JavaScript's new feature "template
string" that enables users to use JavaScript as documentation tool.

After writing the script file, save it as "ch-000-example".

The file you wrote can be simply executed; it outputs a number of tex scripts 
and lilypond scripts. But you usually have to properly compile these files 
before you use them in your tex document.  In order to simplify the compilation 
process, use `chromadoc`.

	> chromadoc ch-000-example

`chromadoc` clears the output directory and then executes the specified i 
JavaScript file and invokes Lilypond and Festival Speech System to the created 
files.

## Further Information

For further information, please refer the documents of the respective
modules/commands.




[modeline]: # ( vim: set noexpandtab fenc=utf-8 spell spl=en: )
[modeline]: # ( vim: set fo+=a suffixesadd+=/readme.md,.md  noexpandtab fenc=utf-8 spell spl=en: )
