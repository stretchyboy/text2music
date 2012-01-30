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
var aPatches={
  Grungey:new Class({
        Extends: AudioletGroup,
        initialize: function(audiolet) {
            AudioletGroup.apply(this, [audiolet, 0, 1]);
            // Basic wave
            this.saw = new Saw(audiolet, 100);
            
            // Frequency LFO
            this.frequencyLFO = new Sine(audiolet, 2);
            this.frequencyMA = new MulAdd(audiolet, 10, 100);

            // Filter
            this.filter = new LowPassFilter(audiolet, 1000);
            
            // Filter LFO
            this.filterLFO = new Sine(audiolet, 8);
            this.filterMA = new MulAdd(audiolet, 900, 1000);

            // Gain envelope
            this.gain = new Gain(audiolet);
            this.env = new ADSREnvelope(audiolet,
                                        1, // Gate
                                        0.2, // Attack
                                        0.2, // Decay
                                        0.2, // Sustain
                                        0.2, // Release
                                        function() {
				this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
			}.bind(this)
			      );
			      
			      
            // Main signal path
            this.saw.connect(this.filter);
            this.filter.connect(this.gain);
            this.gain.connect(this.outputs[0]);

            // Frequency LFO
            this.frequencyLFO.connect(this.frequencyMA);
            this.frequencyMA.connect(this.saw);

            // Filter LFO
            this.filterLFO.connect(this.filterMA);
            this.filterMA.connect(this.filter, 0, 1);

            // Envelope
            this.env.connect(this.gain, 0, 1);
        }
    }),
    

  Synth:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
        AudioletGroup.apply(this, [audiolet, 0, 1]);
        // Basic wave
        this.sine = new Sine(audiolet, frequency);
        
        // Gain envelope
        this.gain = new Gain(audiolet, 0.5);
        this.env = new PercussiveEnvelope(audiolet, 1, 0.2, 0.5,
          function() {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
          }.bind(this)
        );
        
        this.envMulAdd = new MulAdd(audiolet, 0.1, 0);
    
        // Main signal path
        this.sine.connect(this.gain);
        this.gain.connect(this.outputs[0]);
    
        // Envelope
        this.env.connect(this.envMulAdd);
        this.envMulAdd.connect(this.gain, 0, 1);
      }
    }),


  /*Cymbal:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
        AudioletGroup.apply(this, [audiolet, 0, 1]);
        // Basic wave
        this.white = new WhiteNoise(audiolet);
        this.sine = new Sine(audiolet, frequency);
    
        this.filter = new LowPassFilter(audiolet, 1000);
    
        this.filterMA = new MulAdd(audiolet, 900, 1000);
            
        // Main signal path
        this.white.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(this.outputs[0]);
    
                // Frequency LFO
                this.frequencyLFO.connect(this.frequencyMA);
                this.frequencyMA.connect(this.saw);
    
                
        
        
        this.sineMul = new MulAdd(audiolet, 0.1, 0);
    
        
        
        // Gain envelope
        this.gain = new Gain(audiolet);
        
        this.env = new PercussiveEnvelope(audiolet, 0.1, 0.2, 0.2,
          function() {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
          }.bind(this)
        );
        
        
        
        this.envMulAdd = new MulAdd(audiolet, 0.1, 0);
    
        
        this.envMulAdd.connect(this.white, 0, 1);
        
        
        // Main signal path
        this.sine.connect(this.envMulAdd);
        this.gain.connect(this.outputs[0]);
        
        
        
        // Envelope
        this.env.connect(this.envMulAdd);
        this.envMulAdd.connect(this.gain, 0, 1);
      }
    });
    */


  Snare:new Class({
        Extends: AudioletGroup,
        initialize: function(audiolet, frequency) {
            AudioletGroup.apply(this, [audiolet, 0, 1]);
            // Basic wave
            this.white = new WhiteNoise(audiolet);        
            this.filter = new BandPassFilter(audiolet, 60);
            
            this.sine = new Sine(audiolet, 60);
            this.clip = new SoftClip(audiolet);
            
            this.gain = new Gain(audiolet, 0.3);
            
            this.env = new PercussiveEnvelope(audiolet, 0.05, 0.05, 0.2,
              function() {
                this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
              }.bind(this)
            );
            this.envMulAdd = new MulAdd(audiolet, 0.3, 0);
            
            this.clipTheFilteredMulAdd = new MulAdd(audiolet, 0.3, 0);
            
            
            //Main signal path
            this.white.connect(this.filter);
            this.sine.connect(this.clip);
            this.clip.connect(this.clipTheFilteredMulAdd);
            this.clipTheFilteredMulAdd.connect(this.filter);
            
            
            // Envelope
            
            this.filter.connect(this.gain);
            
            this.env.connect(this.envMulAdd);
            //this.env.connect(this.filter);
            this.envMulAdd.connect(this.gain, 0, 1);
		        this.gain.connect(this.outputs[0]);

            
        }
    }),

  Bongo:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
          AudioletGroup.apply(this, [audiolet, 0, 1]);
          // Basic wave
          this.white = new WhiteNoise(audiolet);        
          this.filter = new BandPassFilter(audiolet, frequency);
          
          this.sine = new Sine(audiolet, frequency);
          this.clip = new SoftClip(audiolet);
          
          this.gain = new Gain(audiolet);
          
          this.env = new PercussiveEnvelope(audiolet, 0.01, 0.01, 0.1,
            function() {
              this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
            }.bind(this)
          );
          this.envMulAdd = new MulAdd(audiolet, 0.5, 0);
          
          this.sine_filteredwhite_MulAdd = new MulAdd(audiolet, 0.5, 0);
          
          
          //Main signal path
          this.white.connect(this.filter);
          this.sine.connect(this.sine_filteredwhite_MulAdd);
          this.sine_filteredwhite_MulAdd.connect(this.filter);
          
          
          // Envelope
          
          this.filter.connect(this.gain);
          
          this.env.connect(this.envMulAdd);
          this.envMulAdd.connect(this.gain, 0, 1);
          this.gain.connect(this.outputs[0]);

          
      }
    }),
  
  
  Doop:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
          AudioletGroup.apply(this, [audiolet, 0, 1]);
          // Basic wave
          this.white = new WhiteNoise(audiolet);        
          this.filter = new BandPassFilter(audiolet, frequency);
          
          this.sine = new Sine(audiolet, frequency);
          this.clip = new SoftClip(audiolet);
          
          this.gain = new Gain(audiolet);
          
          this.env = new PercussiveEnvelope(audiolet, 0.01, 0.01, 0.1,
            function() {
              this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
            }.bind(this)
          );
          this.envMulAdd = new MulAdd(audiolet, 0.5, 0);
          
          this.sine_filteredwhite_MulAdd = new MulAdd(audiolet, 0.3, 0);
          
          
          //Main signal path
          this.white.connect(this.filter);
          this.sine.connect(this.sine_filteredwhite_MulAdd);
          this.sine_filteredwhite_MulAdd.connect(this.filter);
          
          
          // Envelope
            
          this.filter.connect(this.gain);
          
          this.env.connect(this.envMulAdd);
          this.envMulAdd.connect(this.gain, 0, 1);
          this.gain.connect(this.outputs[0]);

          
      }
    }),
    
  
  Guitar:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
        AudioletGroup.apply(this, [audiolet, 0, 1]);
        // Basic wave
        this.sine = new Saw(audiolet, frequency);
        
        this.filter = new DampedCombFilter(audiolet, 0.06, 0.02, 0.04, 0.2);
        
        //this.filter = new Reverb(audiolet, 1.5, 0.5, 0.8);
        
        // Gain envelope
        this.gain = new Gain(audiolet, 0.3);
        this.env = new PercussiveEnvelope(audiolet, 0.01, 0.05, 0.6,
        //this.env = new PercussiveEnvelope(audiolet, 0.1, 0.1, 0.3,
          function() {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
          }.bind(this)
        );
        
        this.envMulAdd = new MulAdd(audiolet, 0.1, 0);
    
        // Main signal path
        //this.sine.connect(this.gain);
        this.sine.connect(this.filter);
        this.filter.connect(this.gain);
          
        
        
        
        this.gain.connect(this.outputs[0]);
    
        // Envelope
        this.env.connect(this.envMulAdd);
        this.envMulAdd.connect(this.gain, 0, 1);
      }
    }),


  
/*Guitar:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
          AudioletGroup.apply(this, [audiolet, 0, 1]);
          
          this.sine = new Sine(audiolet, frequency);
          this.filter = DampedCombFilter(audiolet, 0.1, 0.05, 0.1, 1);
          
          this.gain = new Gain(audiolet);
          
          this.env = new PercussiveEnvelope(audiolet, 0.1, 0.1, 0.3,
            function() {
              this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
            }.bind(this)
          );
          
          this.envMulAdd = new MulAdd(audiolet, 0.2, 0.3);
          
          //Main signal path
          this.sine.connect(this.filter);
          this.filter.connect(this.gain);
          
          this.env.connect(this.envMulAdd);
          this.envMulAdd.connect(this.gain, 0, 1);
          
          this.gain.connect(this.outputs[0]);

          
      }
    }),
  */  
    

Fuzzed:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
          AudioletGroup.apply(this, [audiolet, 0, 1]);
          // Basic wave
          this.white = new WhiteNoise(audiolet);        
          this.filter = new BandPassFilter(audiolet, frequency);
          
          this.sine = new Sine(audiolet, frequency);
          this.clip = new SoftClip(audiolet);
          
          this.gain = new Gain(audiolet, 0.5);
          
          this.env = new PercussiveEnvelope(audiolet, 0.01, 0.01, 0.3,
            function() {
              this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
            }.bind(this)
          );
          this.envMulAdd = new MulAdd(audiolet, 0.2, 0.3);
          
          this.sine_filteredwhite_MulAdd = new MulAdd(audiolet, 0.3, 0.2);
          
          
          //Main signal path
          this.white.connect(this.filter);
          this.sine.connect(this.sine_filteredwhite_MulAdd);
          this.sine_filteredwhite_MulAdd.connect(this.filter);
          
          
          // Envelope
            
          this.filter.connect(this.gain);
          
          this.env.connect(this.envMulAdd);
          this.envMulAdd.connect(this.gain, 0, 1);
          this.gain.connect(this.outputs[0]);

          
      }
    }),
    
    
  Hiss:new Class({
      Extends: AudioletGroup,
      initialize: function(audiolet, frequency) {
        AudioletGroup.apply(this, [audiolet, 0, 1]);
        // Basic wave
        this.white = new WhiteNoise(audiolet);
        this.filter = new HighPassFilter(audiolet, frequency);
        
        // Gain envelope
        this.gain = new Gain(audiolet, 0.2);
        
        this.env = new PercussiveEnvelope(audiolet, 0.05, 0.05, 0.1,
          function() {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
          }.bind(this)
        );
        this.envMulAdd = new MulAdd(audiolet, 0.01, 0);
    
        // Main signal path
        this.white.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(this.outputs[0]);
        
        // Envelope
        this.env.connect(this.envMulAdd);
        this.envMulAdd.connect(this.gain, 0, 1);
      }
    }),
  
  BassDrum:new Class({
    Extends: AudioletGroup,
    initialize: function(audiolet, frequency) {
      AudioletGroup.apply(this, [audiolet, 0, 1]);
      // Basic wave
      this.sine = new Sine(audiolet, 49);
      //this.filter = new LowPassFilter(audiolet, frequency);
      
      // Gain envelope
      this.gain = new Gain(audiolet, 0.3);
      
      this.env = new PercussiveEnvelope(audiolet, 0.05, 0.05, 0.15,
        function() {
          this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
        }.bind(this)
      );
      this.envMulAdd = new MulAdd(audiolet, 0.3, 0);
  
      // Main signal path
      this.sine.connect(this.gain);
      //this.sine.connect(this.gain);
      this.gain.connect(this.outputs[0]);
      
      // Envelope
      this.env.connect(this.envMulAdd);
      this.envMulAdd.connect(this.gain, 0, 1);
    }
    })

};

