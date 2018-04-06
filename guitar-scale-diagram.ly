\version "2.18.2"
\include "aaron.ly"

% Common Library
#(define visit (lambda ( es callback )
                   (letrec ((proc (lambda (x)
                                      (if (eq? x '())
                                          #f
                                          (begin
                                           (callback (car x))
                                           (proc (cdr x)))))))
                       (proc es))))

#(define lookup-music-by-name (lambda ( es sym )
                                  (define result '())
                                  (visit es (lambda( e)
                                                (if (eq? (ly:music-property e 'name) sym )
                                                    (set! result
                                                          (cons e result))
                                                    #f)))
                                  result ))
% #(warn (length (lookup-music-by-name (ly:music-property (ly:music-property music 'element ) 'elements ) 'NoteEvent)))
% \void \displayMusic \music

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Creating guitar strings to note number
%

#(define fretdiagram-guitar-string-offset-map
     ((lambda ()
          (define result '())
          (visit 
           (ly:music-property (ly:music-property #{ \relative { mi la re sol ti mi } #} 'element ) 'elements )
           (lambda(e)
               (set! result
                     (cons
                      (+  (ly:pitch-semitones (ly:music-property e 'pitch ) )  12 )
                      result))
               ;(write (+  (ly:pitch-semitones (ly:music-property e 'pitch ))  12 )  )
               ;(write (ly:pitch-semitones (ly:music-property e 'pitch ) ))
               ))
          (append '(null)  result ))))
%#(warn fretdiagram-guitar-string-offset-map)

#(define set-string-number-to-note-event 
     (lambda ( e num )
         ;(warn (ly:grob-array? (ly:music-property e 'articulations)))
         (set! (ly:music-property e 'articulations)
               (cons
                (make-music
                 'StringNumberEvent
                 'string-number
                 num) 
                (ly:music-property e 'articulations)))))

#(define fretdiagram-def '())
#(define fretdiagram-init (lambda() (set! fretdiagram-def '() )))
#(define fretdiagram-get (lambda() fretdiagram-def ))
#(define fretdiagram-add 
     (lambda (string-num fret-num fret-mark )
         (if (and 
              (<= 0 fret-num )
              (< fret-num 24 ))
             (set! fretdiagram-def
                   (cons
                    (list 'place-fret string-num fret-num 
                        (markup
                         #:line
                         (#:override
                          (cons (quote font-family) (quote serif))
                          (#:italic 
                           fret-mark ))))
                    fretdiagram-def ))    
             #f)
         
         ; (warn fretdiagram-def)
         ))

#(define fretdiagram-add-by-pitch
     (lambda* ( string-num pitch-offset pitch-name )
         (define string-offset (list-ref fretdiagram-guitar-string-offset-map string-num))
         (fretdiagram-add string-num (- pitch-offset string-offset) pitch-name )
         ))


#(define fretdiagram-add-note-event
     (lambda* (e)
         (define p (ly:music-property e 'pitch))
         (define sne (car (reverse (lookup-music-by-name (ly:music-property e 'articulations ) 'StringNumberEvent ))))
         ; (display-scheme-music (ly:pitch-notename p))
         (if (null? sne)
             #f
             (let* ((string-num (ly:music-property sne 'string-number))
                    (pitch-offset (+ (ly:pitch-semitones p ) 24))
                    (pitch-name (lookup-aaron-by-pitch p)))
                 ;(write "pitch-offset=" )(write pitch-offset)
                 ;(write "string-offset=" )(write string-offset)
                 ;(newline)
                 (fretdiagram-add-by-pitch string-num pitch-offset pitch-name)))))


#(define put-string-number-on-music!
     (lambda (music string-number-map)
         ; Initialization
         (fretdiagram-init)
         
         (visit
          (ly:music-property (ly:music-property music 'element ) 'elements )
          ((lambda()
               (define counter 0)
               
               (lambda (e)
                   (if (eq? (ly:music-property e 'name) 'NoteEvent )
                       (begin
                        (set-string-number-to-note-event e (list-ref string-number-map counter ))
                        (fretdiagram-add-note-event e)
                        (set! counter (+ counter 1)) )
                       #f)))))
         (fretdiagram-get)))



% #(display-scheme-music fretdiagram-def)
#(define put-scale-chart!
     (lambda (music fretdiagram-def )
         (define obj1 (last (lookup-music-by-name (ly:music-property (ly:music-property music 'element ) 'elements ) 'NoteEvent)))
         (set!
          (ly:music-property obj1 'articulations )
          (cons
           ; (make-music 'TextScriptEvent 
           ; 'text (markup #:bold (markup #:abs-fontsize 32 (markup "I HATE SCHEME!!!" ) ) (markup #:beam 5 1 2) ))
           (make-music 'TextScriptEvent 
               'direction 1
               'text
               (markup #:override '(font-family . serif )
                   (markup #:translate '(8 . 0) 
                       (markup
                        #:line
                        (#:override
                         (cons (quote size) 2.0)
                         (#:override
                          (list 'fret-diagram-details
                              (cons (quote finger-code) (quote in-dot))
                              (cons (quote number-type) (quote arabic))
                              (cons (quote fret-label-font-mag) 0.5)
                              (cons (quote dot-label-font-mag) 0.6)
                              (cons (quote string-label-font-mag) 0.6 ) 
                              (cons 'dot-radius 0.45 )
                              (cons (quote label-dir) 1)
                              (cons (quote mute-string) "M")
                              (cons (quote orientation) (quote landscape))
                              (cons (quote barre-type) (quote curved))
                              (cons 'top-fret-thickness  0.1)
                              (cons 'capo-thickness  0.3)
                      
                              (cons (quote xo-font-magnification) 0.4)
                              (cons (quote xo-padding) 0.3))
                          (#:fret-diagram-verbose  fretdiagram-def  )))))))
           (ly:music-property obj1 'articulations )))))


%#(write put-scale-chart!)
#(newline)

% #(warn (length (lookup-music-by-name (ly:music-property (ly:music-property music 'element ) 'elements ) 'NoteEvent)))
% vim: lisp sw=1 ts=1 sts=1 et
