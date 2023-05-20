### Simon Says Demo
As a little exercise and demo of React as a declarative framework,
I hacked together a somewhat sloppy but fun "Simon Says" frontend.

A detail I'm pleased with - the game scales as you go via a neat
interpolation of key hyperparameters between easy initial states
and a practically impossible endgame.

One I'm not pleased with - refresh to start over... oop.
The state of game logic in hooks as they exist now is a little
too messy to cleanly add a more user-friendly restart, but a quick
refactor would probably suffice.
