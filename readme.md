
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

## Installation

Chromadoc converter does not necessarily have to be installed to a specific 
directory. You can place any directory. Typically you clone the GitHub 
repository as:

	git clone https://github.com/chromatic-solfege/chromadoc.git

And then go to the directory and `source` the file `init-chromadoc` in the root 
directory of the repository. 

## Usage

At first, open your terminal as its shell and go to the root
directory of the Chromatic-Solfege documentation system and source a shell
script file which name is "init-chromadoc".

```bash
	. init-chromadoc
```

This will set up some environment variables including `PATH`.

The main task of using this system is writing _Chromadoc_ scripts.
The _chromadoc_ is designed to automate the generation of TeX files and 
Lilypond files.

A _chromadoc_ file is a JavaScript program which later will be compiled with 
additional headers and footers. The converted program outputs TeX scripts and 
Lilypond scripts. 

A typical Chromadoc script is as:

```javascript
	t_abstract`
		This document presents how to use the Chromatic-Solfege Documentation
		System. Brab rab rabra ...
	`;

	t_header0`Introduction`;
	t_textBody`
		This system is so-and-so and such-and-such.
	`;

	writeNewPage();

	// Ouput Table of Contents
	writeTOC();
	writeNewPage();

	writeScore( 'example01', `@do do4 re mi `, {} );
```

Note that the extensive use of _template string_. The main forcus of writing 
Chromadoc script is writing a number of template string literals.

After writing the script file, save it as "ex1.chromadoc".

In order to convert the script you have written into a beautifully readable 
documents, use `chromadoc` command.

It firstly converts the script to JavaScript program, and then execute the 
program. The program outputs a number of tex scripts and lilypond scripts.
And `chromadoc` command automatically invokes necessary conversions to build
a document we want.

	> chromadoc ex1.chromadoc

`chromadoc` clears the output directory and then executes the specified i 
JavaScript file and invokes Lilypond and Festival Speech System to the created 
files.

## Command Reference

The available tag functions are prefixed by `t_`. Every function has its 
corresponding TeX tag. 

The functions prefixed by `write` are advanced version of `t_` functions.
The `write` functions can perform more precise control since these accept more 
parameters than `t_` version.


__t_abstract__
`\\begin{abstract}`

__t_headerPart__

__t_header0__

__t_header1__

__t_header2__

__t_header3__

__t_textBody__

__t_commands__

__t_score__

__t_diagram__

__t_TOC__

__t_newPage__

__t_newLine__

__writeAbstract__
__writeHeaderPart__
__writeHeader0__
__writeHeader1__
__writeHeader2__
__writeHeader3__
__writeTextBody__
__writeCommands__
__writeScore__
__writeDiagram__
__writeTOC__
__writeNewPage__
__writeNewLine__


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


## Further Information

For further information, please refer the documents of the respective
modules/commands.




[modeline]: # ( vim: set noexpandtab fenc=utf-8 spell spl=en: )
[modeline]: # ( vim: set fo+=a suffixesadd+=/readme.md,.md  noexpandtab fenc=utf-8 spell spl=en: )
