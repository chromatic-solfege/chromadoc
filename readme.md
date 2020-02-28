
Chromadoc
=======================================

## Introduction

Chromadoc is a toolkit for writing documentation with Chromatic-Solfege 
notation. This toolkit contains a compiler which compiles _Chromadoc_ document 
into TeX and Lilypond, then builds PDF documents.

_Chromadoc_ format is a file-format which can contain paragraphs with 
Chromatic-Solfège notation embedded in them. These paragraphs are compiled into 
TeX document. And the notations embedded to paragraphs are converted to 
Lilypond documents and then embedded to the TeX document. The compiler also 
generates singing voice data from Lilypond documents.

This toolkit contains programs to perform following tasks : 

- Automatically generating TeX file from a _Chromadoc_.
- Transposing notes written in Chromatic-Solfège.
- Compiling notes written in Chromatic-Solfège into Lilypond.
- Compiling Lilypond documents into singing voice audio data.
- Automatically generating patterns of a mechanical scale practice.
- Enumerating all possible fingering pattern for the guitar from a sequence of
  Chromatic-Solfege note names and generating fingerboard charts.

## System Requirement
This system is built on following systems :

- bash
- nodejs 
- xelatex
- Lilypond
- ffmpeg
- ImageMagick
- Festival Speech Synthesis System
- SoX
- sysvbanner
- ges1.0-tools
- [Chromatic-Solfege for JavaScript](/chromatic-solfege-for-javascript/)
- [Chromatic-Solfege for Lilypond](/chromatic-solfege-for-lilypond/)

Please note that although this system is partially written by nodejs, NPM is not necessary.

## Installation
Chromadoc does not need installation. You can place any directory. 


Go to any directory you want to place the _Chromadoc_ and clone the GitHub 
repository as:

	git clone https://github.com/chromatic-solfege/chromadoc.git

## Usage
After clone _Chromadoc_, go to the directory and `source` the file 
`init-chromadoc` in the root directory of the repository.

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

After writing the script file, save it as "ex1.chromadoc". In order to convert 
the script you have written into a beautifully readable documents, use  
`chromadoc` command.

It firstly converts the script to JavaScript program, and then execute the 
program. The program outputs a number of tex scripts and lilypond scripts.
And `chromadoc` command automatically invokes necessary conversions to build
a document we want.

	> chromadoc ex1.chromadoc

`chromadoc` clears the output directory and then executes the specified i 
JavaScript file and invokes Lilypond and Festival Speech System to the created 
files.

## Command Reference
The available tag-functions are prefixed by `t_`. Every function has its 
corresponding TeX tag as describing following.

The functions prefixed by `write` are advanced version of `t_` functions.
The `write` functions can perform more precise control since these accept more 
parameters than `t_` version.


__t_abstract__
Outputs `\\begin{abstract} TEXT \\end{abstract}`.

__t_headerPart__
Outputs `\\part{ TEXT }`.

__t_header0__
Outputs `\\section{ TEXT }`.

__t_header1__
Outputs `\\subsection{ TEXT }`.

__t_header2__
Outputs `\\subsubsection{ TEXT }`.

__t_header3__
Outputs `\\paragraph{ TEXT }`.

__t_header4__
Outputs `\\subparagraph{ TEXT }`.

__t_textBody__
Outputs `TEXT` as is.

__t_score__
Outputs a musical score. This accepts _Csall_ scripts.
For further information, see [Chromatic-Solfege for JavaScript][csfj].

__t_commands__
Outputs a TeX command directly.


__t_diagram__
TODO

__t_TOC__
Outputs `\\tableofcontents`.

__t_newPage__
Outputs `~\\newpage`.

__t_newLine__
Outputs `\\\\~`.

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
			This is the main shell script. `chromadoc` automates the 
			compilation process of Chromadoc documents. This converts every 
			specified chromadoc documents into a JavaScript program and then 
			executes all of the programs. And `chromadoc` then invokes the 
			following conversion.

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
			This script concat given multiple audio/video files into another 
			audio/video file.

```sh
	> chmake-concat infile1 infile2... outfile
```
		- chmake-mp4
			This script generates a video from the output of `chromadoc` 
			command.

```sh
	> chmake-mp4 in-dir background-image out-dir
```
		- lypdf2png
			This script converts a Lilypond generated PDF to a PNG file.

		- pdfwav2mp4
			This script converts a TeX generated PDF and reading voice data 
			into a mp4 movie file.
			
		- pngwav2mp4
			This script converts a Lilypond generated PNG and reading voice 
			data into a mp4 movie file.

		- replace_text.js
			This script replaces a specific string literal in a file with 
			another specific string literal. This script is used for 
			templating.

		- txtwav2mp4
			This script creates a movie from a text caption data and audio 
			data.
		- txtwav2mp4-header-template.svg
			This is a SVG template for headers. This template is used for 
			generating videos.
			
		- txtwav2mp4-template.svg
			This is a SVG template for musical scores. This template is used 
			for generating videos.

		- vid2effect
			This script adds effects to the generated video files by using 
			GStreamer. This script is experimental and currently not used.

		- wav2mp4
			This script takes a filename of a wave file which _chromadoc_ 
			output. Then it checks the filename and determin if the audio data 
			is from a music singing audio or reading a caption audio.
			And then the script creates videos from the audio data.


## Further Information

For further information, please refer the documents of the respective
modules/commands.



[csfj]: https://chromatic-solfege.github.io/chromatic-solfege-for-javascript/
[modeline]: # ( vim: set fo+=wa suffixesadd+=/readme.md,.md  noexpandtab fenc=utf-8 spell spl=en: )
