/*
This file is part of text2music.

text2music is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Text2music is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Text2music.  If not, see <http://www.gnu.org/licenses/>.
*/

window.addEvent("domready", function() {

var AudioletAppChord = new Class({
	initialize: function(chordArray) {
		this.audiolet = new Audiolet();

		var chordPattern = new PSequence([chordArray]);

		// Play the progression
		this.audiolet.scheduler.play([chordPattern], 1,
									 this.playChord.bind(this));
	},

	playChord: function(chord) {
		for (var i=0; i<chord.length; i++) {
			var synth = new Synth(this.audiolet, chord[i].frequency());
			synth.connect(this.audiolet.output);
		}
	}
});

var aInstruments = null;

var PlayTunes = new Class({
    iScaleLen:8,
    sScaleName:'major',
    sBaseNote:'C',
		initialize: function(aInstruments, aPatches, beatsPerBar, tempo, phraseInMinutes) {
		this.iCurrentBaseOffset = 0;
		this.iTempo = tempo || 80;
		this.beatsPerBar = beatsPerBar || 4;
    this.lengthInMinutes = 20;
    this.lengthInBars = (this.lengthInMinutes * this.iTempo) / this.beatsPerBar;
    this.phraseInMinutes = phraseInMinutes || 0.5;
    //this.phraseInBars = 12;//
    this.phraseInBars = Math.floor((this.phraseInMinutes * this.iTempo) / this.beatsPerBar);
    //console.log("this.phraseInBars =", this.phraseInBars);
    this.phraseInBeats = this.beatsPerBar * this.phraseInBars;
    //console.log("this.phraseInBeats =", this.phraseInBeats);
    this.phraseInSeconds = this.phraseInBeats / this.iTempo;
    //console.log("this.phraseInSeconds =", this.phraseInSeconds);
    
    this.altWeight = 3;
    
    //console.log("this.lengthInBars =", this.lengthInBars);

		this.audiolet = new Audiolet();
	  this.audiolet.scheduler.setTempo(this.iTempo);
		
		this.audiolet.scheduler.beatsPerBar = this.beatsPerBar;
  	this.aPatches = aPatches;
  	//console.log("aPatches =", aPatches);
		
  	
  	this.sLetterUseOrder = 'etaoinsrhdlucmfywgpbvkxqjz';
    this.oLetterValues = {};
    
    for(n = 0; n < this.sLetterUseOrder.length; n++)
    {
      var rem = n%2;
      var iLetterValue = Math.floor(n/2) * (1 - (rem*2));
      var sLetter = this.sLetterUseOrder[n];
      this.oLetterValues[sLetter] = iLetterValue;
    }
    this.aScales = {};
    this.aScaleNames = Object.keys(MUSIC.scales);
    
    for(var p=0; p<this.aScaleNames.length; p++)
    {  
      this.aScales[this.aScaleNames[p]] = ['unison'].concat(MUSIC.scales[this.aScaleNames[p]]);
    }
    
        
    this.aNotesNumbers = Object.keys(MUSIC.notes);
		
    
		this.aSynths = {};
		Object.each(this.aPatches, function(item, key, list){
		    //console.log("item =", item);
		    //console.log("key =", key);
		    this.aSynths[key] = function(frequency){
            var funcPatch = this.aPatches[key];
            //console.log("funcPatch =", funcPatch);
            var synth = new this.aPatches[key](this.audiolet, frequency);
            synth.connect(this.audiolet.output);
          };
		    
		}.bind(this));
		
 		this.aInstruments = aInstruments;		
		
		//console.log("this.aSynths =", this.aSynths);
		this.iIntroLength = 0;
		for(var iInstrument = 0 ; iInstrument < this.aInstruments.length; iInstrument++)
    {
      this.aInstruments[iInstrument].aPhrases = [];
      this.iIntroLength += this.aInstruments[iInstrument].bars;
    }
    this.iCurrOffSet = 0;
		//console.log("initialize");
		
	},
	
	
	getWeightedCharNum:function()
  {
    //console.log("getWeightedCharNum this.iStringPos =", this.iStringPos);
  
    var sLetter = this.sText[this.iStringPos % this.sText.length].toLowerCase();
    
    $("output").appendText(this.sText[this.iStringPos % this.sText.length]);
    
    //console.log("sLetter =", sLetter);
    var iChar = this.oLetterValues[sLetter];
    
    if(typeof iChar == 'undefined' || iChar === null)
    {
      iChar = 0;
    }
    this.iStringPos++;
    return iChar;
  },

  getCharNum:function()
  {
    var iChar = this.sText.charCodeAt(this.iStringPos % this.sText.length);
    $("output").appendText(this.sText[this.iStringPos % this.sText.length]);
    this.iStringPos++;
    
    
    return iChar;
  },
  
  
  
  euclid:function(steps, attacks)
  {
    var rests = steps - attacks;
    var per_attack = parseInt(rests/attacks, 10);
    var rem = rests % attacks;
    
    var rhythm = [];
    var i = 0;
    var j = 0;
    
    while(i<attacks) {
      //document.writeln(“attk “+i);
      rhythm[j] = 1;
      j++;
      for(var k=0;k<per_attack;k++) {
        rhythm[j]=0;
        j++;
      }
      if(i<rem) {
        rhythm[j]=0;
        j++;
      }
    i++;
    }
    return rhythm;
  },
  
  rotate:function(iSplit, seq, beat)
  {
    //console.log("iSplit =", iSplit);
    //console.log("seq =", seq);
    //console.log("beat =", beat);
    
    if(beat !== null)
    {
      for(var o = 0 ; o < seq.length; o ++)
      {
        if(seq[(iSplit + beat+ o) % seq.length] === 1)
        {
          break;
        }
      }
      
      iSplit += o; 
    }
    
    var aEnd = seq.splice(iSplit, seq.length - iSplit);
    //console.log("seq after splice=", seq);
    
    //console.log("aEnd =", aEnd);
    seq = aEnd.concat(seq);
    //console.log("seq after splice =", seq);
    
    return seq;
  },
  
  addText:function(sText)
  {
    this.iStringPos = 0;
    this.sText = sText;
  },

  resetText:function(sText)
  {
    this.iStringPos = 0;
  },
  
  getScaleAndBaseNote:function()
  {
    var iChar = Math.abs(this.getWeightedCharNum());
   //console.log("iChar =", iChar);
    this.sScaleName = this.aScaleNames[iChar % this.aScaleNames.length];
   //console.log("this.sScaleName =", this.sScaleName);
    this.iScaleLen = this.aScales[this.sScaleName].length;
   //console.log("this.iScaleLen =", this.iScaleLen);
    
    var iChar2 = 8 + this.getWeightedCharNum();
   //console.log("iChar2 =", iChar2);
    this.sBaseNote = this.aNotesNumbers[iChar2 % this.aNotesNumbers.length];
   //console.log("this.sBaseNote =", this.sBaseNote);
    
  },
  
  calcTune:function()
  {
    var iChar = 0;
    
    //Loop around the instruments
    for(var iInstrument = 0 ; iInstrument < this.aInstruments.length; iInstrument++)
    {
      this.calcPhrase(iInstrument);
    }
  },
  

  
  
  calcPhrase:function(iInstrument)
  {
    //GET THE RHYTHM
    var iChar = this.getCharNum();
    var steps = this.aInstruments[iInstrument].bars * this.beatsPerBar;
    
    //console.log("this.aInstruments =", this.aInstruments);
    //console.log("this.aInstruments[iInstrument] =", this.aInstruments[iInstrument]);
    //console.log("this.beatsPerBar =", this.beatsPerBar);
    //console.log("this.aInstruments[iInstrument].bars =", this.aInstruments[iInstrument].bars);
    //console.log("steps =", steps);
    var pulses = Math.max(Math.ceil(steps *this.aInstruments[iInstrument].min), iChar % Math.floor(steps *this.aInstruments[iInstrument].max));
    //console.log("pulses =", pulses);
    var seq = this.euclid(steps, pulses); 
    //console.log("seq =", seq);
    
    var iChar2 = this.getCharNum();
    var iSplit = iChar2 % steps;
    seq = this.rotate(iSplit, seq, this.aInstruments[iInstrument].beat);
    
    this.aInstruments[iInstrument].seq = seq;
    
    var durations = [];
    var curr_duration = 0;
    var total_duration = 0;
    for(var l=0; l< seq.length; l++)
    {
      if(seq[l] === 0 || (l===0))
      {
        curr_duration ++;
      }
      else
      {
       total_duration += curr_duration;
       durations[durations.length] = curr_duration;
       curr_duration = 1;
      }
    }
    if(curr_duration > 0)
    {
      total_duration += curr_duration;
      durations[durations.length] = curr_duration;
    }
    
    this.aInstruments[iInstrument].durations = durations;
    
    var distances = [];
    //get note numbers
    var totaltravel = 0;
    for(var m = 0; m < this.aInstruments[iInstrument].durations.length; m++)
    {
      var iChar3 = this.getWeightedCharNum();
      //console.log("iChar2 =", iChar2);
      var iScaleInterval = Math.round(iChar3 * (this.iScaleLen/(2*13)));
      //console.log("iScaleInterval =", iScaleInterval);
      distances[distances.length] = iScaleInterval;
      totaltravel += iScaleInterval;

    }
    
    this.aInstruments[iInstrument].distances = distances;
    var aInstrument = aInstruments[iInstrument];
    var durationArray = aInstrument.durations;
    
    var baseNote = Note.fromLatin(this.sBaseNote + aInstrument.baseOctave);
    var scale = this.aScales[this.sScaleName];
    var iScalePos = 0;
    var freqArray = [];
    
    
    for (var i = 0; i < aInstrument.distances.length; i++)
    {
      note = baseNote;
      iChange = aInstrument.distances[i];
      //console.log("iChange =", iChange);
      iScalePos = (iScalePos + iChange);
      if(iScalePos < 0)
      {
        note = note.subtract('octave');
        iScalePos += scale.length;
      }
      else if(iScalePos >= scale.length)
      {
        note = note.add('octave');
        iScalePos -= scale.length;
      }  
      
      var interval = Interval.fromName(scale[iScalePos]);
      note = note.add(interval);
      fFrequency = note.frequency();
      freqArray.push(fFrequency);
    }
    
    
    var iPhrase = this.aInstruments[iInstrument].aPhrases.length;
    //console.log("iPhrase in the calcPhrase =", iPhrase);
    var iOffset = this.iCurrentBaseOffset;
    //console.log("iOffset =", iOffset);
    
    var iFullRepeat = Math.ceil(this.phraseInBars / this.aInstruments[iInstrument].bars);
    //console.log("iFullRepeat =", iFullRepeat);
    
    var frequencyPattern = {};
    var durationPattern  = {};
    var oEvent           = {};
    
    if(iPhrase === 0 && false)
    {
        iOffset = this.iCurrentBaseOffset + (iInstrument * 2 * this.beatsPerBar);
        //console.log("iOffset =", iOffset);
        //TODO : workout the offset
        iRepeats = Math.floor(((this.beatsPerBar * this.phraseInBars) - iOffset) / (this.phraseInBars * this.aInstruments[iInstrument].bars));
        //iRepeats = Math.floor(this.phraseInBars / this.aInstruments[iInstrument].bars) - iInstrument;
    
        frequencyPattern = new PSequence(freqArray, iRepeats);//new PChoose([melody]);
        durationPattern = new PSequence(durationArray, iRepeats);
        
        oEvent = this.audiolet.scheduler.playAbsolute(iOffset, [frequencyPattern], durationPattern,
          this.aSynths[aInstrument.instrument].bind(this));
        
        iOffset = this.iCurrentBaseOffset + (this.phraseInBars * this.beatsPerBar);
        
    }
    
    var iTimes = (Math.abs(this.getWeightedCharNum()) % 3) + 1;
    //console.log('iTimes =', iTimes);
    
    frequencyPattern = new PSequence(freqArray, iFullRepeat*iTimes);
    durationPattern = new PSequence(durationArray, iFullRepeat * iTimes);
    
    this.aInstruments[iInstrument].aPhrases[iPhrase] = {
        'frequencyPattern':frequencyPattern,
        'durationPattern' :durationPattern
    };
  },
  
  
  addPhrase:function(iOffset, iInstrument, iPhrase)
  {
  
    //console.log("Adding iInstrument =", iInstrument, "iPhrase =", iPhrase, " @ iOffset =", iOffset, ' mins', (iOffset / this.iTempo));
      
    //console.log("durationPattern =", this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern.list,'x',this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern.repeats);
    /*var iBeats = 0;
    for(var i =0 ; i< this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern.list.length; i++)
    {
      iBeats += this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern.list[i];
    }
    iBeatTotal = iBeats * this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern.repeats;
    //console.log("iBeatTotal =", iBeatTotal);
      //console.log(".durationPattern =", this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern); 
      
    */
    var sSynthName = this.aInstruments[iInstrument].instrument;
    if(this.aInstruments[iInstrument].alt)
    {
      var iAltNumber = Math.abs(this.getWeightedCharNum()) % (this.altWeight + 1);
      if(iAltNumber == this.altWeight)
      {
        sSynthName = this.aInstruments[iInstrument].alt;
      }
    }
    var oEvent = this.audiolet.scheduler.playAbsolute(iOffset, [this.aInstruments[iInstrument].aPhrases[iPhrase].frequencyPattern], this.aInstruments[iInstrument].aPhrases[iPhrase].durationPattern, this.aSynths[sSynthName].bind(this));
    //console.log('oEvent=', oEvent);
  },
  
  addPhrases:function()
  {
    var iOffset =  this.iCurrentBaseOffset;
    var iPhrase = 0;
    
    if(false)
    {
      //the mixed up one
      for(var iInstrument = 0 ; iInstrument < this.aInstruments.length; iInstrument++)
      {
        //console.log('aPhrases=', this.aInstruments[iInstrument].aPhrases.length);
        var iChar = this.getCharNum();
        //console.log("instrument loop iChar =", iChar);
      
        iPhrase = iChar % this.aInstruments[iInstrument].aPhrases.length;
        
        
        this.addPhrase(iOffset, iInstrument, iPhrase);
      }
      iOffset +=   this.phraseInBeats;
    }
    
    if(true)
    {
      for(iInstrument = 0 ; iInstrument < this.aInstruments.length; iInstrument++)
      {
        if(this.aInstruments[iInstrument].active)
        {
          iPhrase = this.aInstruments[iInstrument].aPhrases.length - 1;
          //console.log("iPhrase SHOULD BE THE NEWEST =", iPhrase);
          this.addPhrase(iOffset, iInstrument, iPhrase);
        }
      }
      
      iOffset +=   this.phraseInBeats;
    }
    
    $('sorteduntil').set('text', (iOffset / this.iTempo));
    
    this.iCurrentBaseOffset = iOffset;
    
  },
  
  getTime:function()
  {
    var minutes = this.audiolet.scheduler.beat/this.iTempo;
    var sSecs =  Math.floor(minutes)+":"+(Math.round(minutes * 60) %60); 
    return sSecs;
  }
    
  
  
  


});


var sText = "";

var fAddText = function(event)
{
  var sText = $('text').get('value');
  
  if(sText)
  {
    if (myTune === false)
    { 
      myTune = new PlayTunes(aInstruments, aPatches, 8, 80 * 3, 0.5);
      var intervalID = fTimeCheck.periodical(1000);
      $('add').set('value','Add Text');
    }
  
    
    myTune.addText(sText);
    myTune.calcTune();
    myTune.addPhrases();

    $('text').set('value', '');
  }
  
  
};

var fPad = function(event)
{
  //console.log('event=', event);
    myTune.calcTune();
    myTune.addPhrases();
    
};

var fRepeat = function(event)
{
  myTune.resetText();
  myTune.calcTune();
  myTune.addPhrases();  
};

var fTimeCheck = function(event)
{
  $("currtime").set('text',myTune.getTime());
};




var eTemplate = $('form');
var eHolder = $('formholder');
//console.log("eHolder =", eHolder);


Request.Twitter = new Class({

  Extends: Request.JSONP,

  options: {
    linkify: true,
    url: 'http://twitter.com/statuses/user_timeline/{term}.json',
    data: {
      count: 5
    }
  },
  
  initialize:function(term, options){
    this.parent(options);
    this.options.url = this.options.url.substitute({term: term});
  },
  
  success:function(data, script){
    if(this.options.linkify)
    {
      data.each(function(tweet){
        tweet.text = this.linkify(tweet.text);
      }, this);
    }
    
    // keep subsequent calls newer
    if(data[0])
    {
      this.options.data.since_id = data[0].id;
    }
    this.parent(data, script);
  },
  
  linkify: function(text){
    // modified from TwitterGitter by David Walsh (davidwalsh.name)
    // courtesy of Jeremy Parrish (rrish.org)
    return text.replace(/(https?:\/\/[\w\-:;?&=+.%#\/]+)/gi, '<a href="$1">$1</a>')
               .replace(/(^|\W)@(\w+)/g, '$1<a href="http://twitter.com/$2">@$2</a>')
               .replace(/(^|\W)#(\w+)/g, '$1#<a href="http://search.twitter.com/search?q=%23$2">$2</a>');
  }
  
});



var fGetFromTwitter = function(event)
{

  var sScreenName = $('screenname').get('value');
  var oTwitter = new Request.Twitter(sScreenName, {
      linkify:false,
      onSuccess: function(data) {
        $('text').set('value', "");
        data.each(function(tweet, i) {
            var sNewValue = '@'+tweet.user.screen_name + ':' + tweet.text+"\n"+$('text').get('value');
            //console.log("tweet.user =", tweet.user);
            //console.log("sNewValue =", sNewValue);
            $('text').set('value', sNewValue);   
        });
      }
    }).send();
}; 



$('add').addEvent('click', fAddText);
$('pad').addEvent('click', fPad);
$('repeat').addEvent('click', fRepeat);
$('twitter').addEvent('click', fGetFromTwitter);


aInstruments = [
  {active:1,instrument:'BassDrum', bars:2, min:0.1, max:0.6, beat:0, baseOctave:'3', alt:''},
  {active:1,instrument:'Doop',    bars:4, min:0.4, max:0.9, beat:0   , baseOctave:'4', alt:''},
  {active:0,instrument:'Snare',    bars:2, min:0.3, max:0.7, beat:8, baseOctave:'3', alt:''}, 
  //{active:0,instrument:'grungey',  bars:2, min:0.3, max:0.7, beat:0   , baseOctave:'2', alt:''}
  {active:0,instrument:'Bongo',    bars:2, min:0.3, max:0.7, beat:8, baseOctave:'3', alt:''},
  //{active:0,instrument:'Doop',    bars:2, min:0.4, max:0.9, beat:0   , baseOctave:'2', alt:''},
  {active:0,instrument:'BassDrum', bars:4, min:0.1, max:0.6, beat:8, baseOctave:'3', alt:''}
  //{active:0,instrument:'Snare', bars:8, min:0.1, max:0.3, beat:0, baseOctave:'3', alt:''}
  
];

for(var z=0; z<aInstruments.length; z++)
{
  var eNewLine = eTemplate.clone();
  eNewLine.bindObject(aInstruments[z], {});
  eHolder.grab(eNewLine);
}


var myTune = false;



});


