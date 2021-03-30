# mixxx-launchpad-mini-mapping

In this repository you will find Bass The Wise's Mixxx mapping for Novation's Launchpad Mini. Chances are that it could be adapted to other launchpad versions.

This mapping is largely based on jdsilvaa's work (https://github.com/jdsilvaa/mixxx-launchpad-mini), itself based on marczis and zestoi previous mappings for the controller. There is also a more advanced mapping from dszakallas (https://github.com/dszakallas/mixxx-launchpad); give it a try if you are looking for a very complete controller of 4 decks and 4 samplers!

When using these mapping files with Mixxx, they will turn your launchpad into a simple 2 deck mixer, with support for filters, 4 FX, 16 samplers, library browsing and AutoDJ. It is based on Mixxx's version 2.3, changing some deprecated controls used in the mappings mentioned previously.

To try this mapping, you will need to copy the xml and js files into Mixxx's user controller folder. When starting Mixxx, go to Preferences / Controller, and choose the Launchpad controller. Then choose Novation Launchpad Mini by bassthewise from the Load Mapping list, and make sure to tick the Enabled box.

This is a summary of the functionalities:

1st page is a 2 deck mixer, with track progress, Play, Cue, PFL, Sync, FF/RW, Sync+/-, 4 Hot Cues, 4 Loops, reloop, pitch, crossfader and volume controls.

2nd page is for the SuperFilter and Filters on the 2 decks.

3rd page is for 4 FX: assigning to decks, first meta knob and mix controls for each FX. I didn't manage to enable the filters with the script, so you'll need to activate the first effect on each FX deck for this to work.

4th page is for Master Volume and Headphone volume, plus gain and volume control on the 2 decks. It has peak controls for each deck

5th page is for Samplers 1-8 with gain; samples will always start from the beggining.

6th page is for Samplers 9-16 with gain; activating repeat, quantize, keylock and beatsync on the samples. It is meant to be used with drum samples.

7th page is for Samplers 1-8 again, but instead of gain it has PFL, FF/RW, Sync+/-, and hotcues 1-4.

8th page is for Library Navigation, loading tracks to deck 1, deck 2, samplers 1-8, and the AutoDJ playlist. There are controls for the font size, waveform zoom, toggle Maximize library, and enabling AutoDJ. It also shows the progress of each track.

The more or less detailed funtion by button is as per this image (also in pdf):
![image](https://user-images.githubusercontent.com/81437860/112748655-733e8480-8fbd-11eb-82ac-b949bb6ce3cd.png)


To finish, a disclaimer: my knowledge of JS is very limited, and because of my try-and-error approach the code would most likely profit from some editing and cleaning... I am open to suggestions. Also, this is my first repository in Github, which in part accounts for this bland README.

Enjoy!

Bass The Wise
