/*************************************************************************************/
/*      Novation Launchpad Mini Mapping                                              */
/*      For Mixxx version 2.2.4                                                        */
/*      Author: bassthewise based on jdsilvaa and marczis and zestoi's work          */
/*                                                                                   */
/*************************************************************************************/

//Common helpers
colorCode = function()
{
    return {
        black: 4,
        lo_red: 1 + 4,
        mi_red: 2 + 4,
        hi_red: 3 + 4,
        lo_green: 16 + 4,
        mi_green: 32 + 4,
        hi_green: 48 + 4,
        lo_amber: 17 + 4,
        mi_amber: 34 + 4,
        hi_amber: 51 + 4,
        hi_orange: 35 + 4,
        lo_orange: 18 + 4,
        hi_yellow: 50 + 4,
        lo_yellow: 33 + 4,
    }
};
//Define one Key
Key = Object;
Key.prototype.color = colorCode("black");
Key.prototype.x = -1;
Key.prototype.y = -1;
Key.prototype.page = -1;
Key.prototype.pressed = false;

Key.prototype.init = function(page, x, y)
{
    this.x = x;
    this.y = y;
    this.page = page;
    //print("Key created");
}

Key.prototype.setColor = function(color)
{
    //First line is special
    this.color = colorCode()[color];
    this.draw();
};

Key.prototype.draw = function()
{
    if ( this.page != NLM.page ) return;
    if ( this.y === 8 ) {
        midi.sendShortMsg(0xb0, this.x + 0x68, this.color);
        return;
    }
    midi.sendShortMsg(0x90, this.x+this.y*16, this.color);
    //midi.sendShortMsg(0xb0, 0x0, 0x28); //Enable buffer cycling
}

Key.prototype.onPush = function()
{
}

Key.prototype.onRelease = function()
{
}

Key.prototype.callback = function()
{
    if (this.pressed) {
        this.onPush();
    } else {
        this.onRelease();
    }
}

function PushKey(colordef, colorpush) {
    var that = new Key;

    that.setColor(colordef);

    that.colordef = colordef;
    that.colorpush = colorpush;

    that.onPush = function()
    {
        this.setColor(this.colorpush);
    }

    that.onRelease = function()
    {
        this.setColor(this.colordef);
    }

    return that;
}

function PushKeyBin(colordef, colorpush, group, control, pushval) {
    var that = PushKey(colordef, colorpush);

    that.onPushOrig = that.onPush;
    that.onPush = function()
    {
        engine.setValue(group, control, pushval);
        this.onPushOrig();
    }
    return that;
}

function PushKeyBinADJ(colordef, colorpush, group, control, pushval) {
    var that = PushKey(colordef, colorpush);

    that.onPushOrig = that.onPush;
    that.onPush = function()
    {
        engine.setValue(group, control, pushval);
        engine.setValue("[Library]", "MoveDown", 1);
        this.onPushOrig();
    }
    return that;
}

function ToogleLibrary(ctrl) {
    var that = new Key();
    that.group = ctrl;
    that.ctrl  = "maximize_library";
    that.state = engine.getValue(this.group, "maximize_library");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("lo_amber");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function TooglePfl(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "pfl";
    that.state = engine.getValue(this.group, "pfl");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("lo_yellow");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function PageSelectKey() {
    var that = new Key;

    that.onPush = function()
    {
        NLM.btns[NLM.page][8][NLM.page].setColor("black");
        NLM.page = this.y;
        NLM.btns[NLM.page][8][NLM.page].setColor("hi_amber");
        NLM.drawPage();
    }
    return that;
}

function ShiftKey() {
    var that = PushKey("lo_green", "hi_yellow");

    that.onPushOrig = that.onPush;
    that.onPush = function()
    {
        NLM.shiftstate = this.pressed;
        this.onPushOrig();
    }

    that.onReleaseOrig = that.onRelease;
    that.onRelease = function()
    {
        NLM.shiftstate = this.pressed;
        this.onReleaseOrig();
    }

    return that;
}

function Sync(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "sync_enabled";
    that.state = engine.getValue(this.group, "sync_enabled");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("hi_yellow");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function Cue(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "cue_gotoandplay";
    that.state = engine.getValue(this.group, "cue_gotoandplay");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_amber");
        } else {
            this.setColor("hi_green");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.callback = function() {
        if (this.pressed) {
            engine.setValue(this.group, this.ctrl, 1);
        } else {
            engine.setValue(this.group, this.ctrl, 0);
        }

        this.setled();
    }

    return that;
}

function GotoStart(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "start";
    // that.ctrl_start  = "start_play";
    that.state = engine.getValue(this.group, "start");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_amber");
        } else {
            this.setColor("hi_red");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.callback = function() {
        if (this.pressed) {
            engine.setValue(this.group, this.ctrl, 1);
        } else {
            engine.setValue(this.group, this.ctrl, 0);
        }

        this.setled();
    }

    return that;
}

function beatlooptoggle(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "beatloop_activate";
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, "reloop_toggle") === 1) {
            this.setColor("lo_orange");
        } else {
            this.setColor("lo_orange");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}
 
function relooptoggle(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "reloop_toggle";
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("lo_orange");
        } else {
            this.setColor("hi_orange");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function AutoDJ_enable() {
    var that = new Key();
    that.group = "[AutoDJ]";
    that.ctrl  = "enabled";
    that.state = engine.getValue(this.group, "enabled");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("hi_yellow");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function AutoDJ(group, ctrl, color1, color2) {
    var that = new Key();
	
    that.group = group;
    that.ctrl  = ctrl;
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor(color2);
        } else {
            this.setColor(color1);
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function FXAssign(fxdeck, deck) {
    var that = new Key();
    that.group = "[EffectRack1_EffectUnit" + fxdeck + "]";
    that.ctrl  = "group_[Channel" + deck + "]_enable";
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("lo_orange");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
	
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function SamplersShow() {
    var that = new Key();
    that.group = "[Samplers]";
    that.ctrl  = "show_samplers";
    that.state = engine.getValue(this.group, "show_samplers");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("hi_red");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function SamplersBank(ctrl) {
    var that = new Key();
    that.group = "[Sampler]";
    that.ctrl  = ctrl;
    // that.state = engine.getValue(this.group, "show_samplers");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_amber");
        } else {
            this.setColor("hi_amber");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function MasterVol(ctrl) {
    var that = new Key();
	
    that.group = "[Master]";
    that.ctrl  = ctrl;
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_amber");
        } else {
            this.setColor("hi_yellow");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function MasterXfader(ctrl) {
    var that = new Key();
	
    that.group = "[Master]";
    that.ctrl  = ctrl;
    that.state = engine.getValue(this.group, this.ctrl);

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("hi_green");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
		 if (NLM.shiftstate) {
			engine.setValue(this.group, "crossfader", 0);
        } else {
        engine.setValue(this.group, this.ctrl, 1);
        engine.setValue(this.group, this.ctrl, 1);
        }
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function HotCueKey(ctrl, deck, hotcue) {
    var that = new Key();
    that.deck = deck;
    that.hotcue = hotcue;

    that.group = "[" + ctrl + deck + "]";
    that.ctrl_act = "hotcue_" + hotcue + "_activate";
    that.ctrl_del = "hotcue_" + hotcue + "_clear";
    that.state   = "hotcue_" + hotcue + "_enabled";

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, this.state) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("lo_green");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.callback = function() {
        if (NLM.shiftstate) {
            ctrl = this.ctrl_del;
        } else {
            ctrl = this.ctrl_act;
        }

        if (this.pressed) {
            engine.setValue(this.group, ctrl, 1);
        } else {
            engine.setValue(this.group, ctrl, 0);
        }

        this.setled();
    }

    return that;
}

function FFBK(deck, ctrl, ffbk) {
  var that = new Key();
  that.deck = deck;
    that.ctrl_syncmminus = "rate_temp_down";
    that.ctrl_syncplus = "rate_temp_up";
  that.ctrl = ffbk
  that.group = "[" + ctrl + deck + "]";
  that.state = engine.getValue(this.group, ffbk);
  this.setColor("lo_green");

  that.setled = function() {
      if (this.pressed) {
          this.setColor("hi_red");
      } else {
          this.setColor("lo_orange");
      }
  }

  that.setled()

  that.callback = function() {
        if (NLM.shiftstate) {
			if (ffbk === "back" ) {
            ctrl = this.ctrl_syncmminus;
			} else {
            ctrl = this.ctrl_syncplus;
			}
        } else {
			ctrl = ffbk;
        }
    
    if (this.pressed) {
      engine.setValue(this.group, ctrl, 1);
    } else {
      engine.setValue(this.group, ctrl, 0);
    }
    that.setled()
  }
  return that;
}

function PlayKey(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "play";
    that.state = "play_indicator";

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, this.state) === 1) {
            this.setColor("mi_green");
        } else {
            this.setColor("hi_orange");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function PlayKeyS(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "play";
    that.state = "play_indicator";

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, this.state) === 1) {
            this.setColor("hi_red");
        } else {
            this.setColor("lo_red");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

	that.SampleRepeatinit = function() {
		engine.setValue(this.group, "keylock", 1);
		engine.setValue(this.group, "quantize", 1);
		engine.setValue(this.group, "start", 1);
		engine.setValue(this.group, "repeat", 1);
		engine.setValue(this.group, "beatsync", 1);
	}
	that.SampleRepeatinit();
    that.setled();
    that.conEvent();
	
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function PlayKeyStart(ctrl, deck) {
    var that = new Key();
    that.group = "[" + ctrl + deck + "]";
    that.ctrl  = "play";
	// that.ctrl = "cue_gotoandplay"
    that.state = "play_indicator";

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, this.state) === 1) {
            this.setColor("hi_red");
        } else {
            this.setColor("hi_orange");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    that.onPush = function()
    {
		engine.setValue(this.group, "start",1) 
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function PeakIndicator(deck) {
    var that = new Key();
    that.group = "[Channel" + deck + "]";
    that.ctrl  = "PeakIndicator";
    that.state = "PeakIndicator";

    that.setled = function() {
        if (this.pressed) {
            this.setColor("hi_amber");
        } else if (engine.getValue(this.group, this.state) === 1) {
            this.setColor("hi_red");
        } else {
            this.setColor("mi_green");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();

    return that;
}

function HPhoneSplit() {
    var that = new Key();
    that.group = "[Master]";
    that.ctrl  = "headSplit";
    that.state = engine.getValue(this.group, "enabled");

    that.setled = function() {
        if (this.pressed) {
            this.setColor("lo_yellow");
        } else if (engine.getValue(this.group, that.ctrl) === 1) {
            this.setColor("hi_green");
        } else {
            this.setColor("hi_yellow");
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.group, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.group, this.ctrl, engine.getValue(this.group, this.ctrl) === 1 ? 0 : 1);
        this.setled();
    }

    that.onRelease = function()
    {
        this.setled();
    }

    return that;
}

function LoopKey(deck, loop) {
    var that = new Key();

    that.group = "[Channel" + deck + "]";
    that.ctrl0 = "beatloop_" + loop + "_toggle";
    that.ctrl1 = "beatlooproll_" + loop + "_activate";
    that.state = "beatloop_" + loop + "_enabled";
    that.setColor("hi_yellow");

    if (LoopKey.keys === undefined) {
        LoopKey.keys = new Array;
        LoopKey.mode = 0;
    }

    LoopKey.setMode = function(mode)
    {
        LoopKey.mode = mode;
        if (mode === 1) {
            LoopKey.keys.forEach(function(e) { e.setColor("hi_orange");} );
        }
        if (mode === 0) {
            LoopKey.keys.forEach(function(e) { e.setColor("hi_yellow");} );
        }
    }

    that.callback = function()
    {
        if (LoopKey.mode === 0) {
             if (this.pressed) {
                engine.setValue(this.group, this.ctrl0, 1);
                this.setColor("hi_green");
            } else {
                if ( engine.getValue(this.group, this.state) === 1) {
                    engine.setValue(this.group, this.ctrl0, 1);
                }
                this.setColor("hi_yellow");
            }
        } else {
            if (this.pressed) {
                engine.setValue(this.group, this.ctrl1, 1);
                this.setColor("hi_green");
            } else {
                engine.setValue(this.group, this.ctrl1, 0);
                this.setColor("hi_orange");
            }
        }
    }

    LoopKey.keys.push(that);
    return that;
}

function LoopModeKey() {
    var that = new Key();
    that.setColor("lo_yellow");

    that.callback = function()
    {
        if (this.pressed) {
            if (LoopKey.mode === 0) {
                LoopKey.setMode(1);
                this.setColor("lo_orange");
            } else {
                LoopKey.setMode(0);
                this.setColor("lo_yellow");
            }
        }
    }

    return that;
}

function LoadKey(ctrl, channel, color1, color2) {
    var that = PushKey(color1,color2);

    that.group   = "[" + ctrl + channel + "]";
    that.control = "LoadSelectedTrack";

    that.onPushOrig = that.onPush;

    that.onPush = function()
    {
        engine.setValue(this.group, this.control, 1);
        this.onPushOrig();
    }

    that.event = function() {
        if (engine.getValue(this.group, "play")) {
            this.colordef = "hi_red";
        } else {
            this.colordef = "hi_green";
        }
        this.setColor(this.colordef);
    }

    that.conEvent = function() {
        engine.connectControl(this.group, "play", this.event);
    }

    that.conEvent();
    return that;
}

function LoadKey2(ctrl, channel, color1, color2) {
    var that = PushKey(color1,color2);

    that.group   = "[" + ctrl + channel + "]";
    that.control = "LoadSelectedTrack";

    that.onPushOrig = that.onPush;

    that.onPush = function()
    {
        engine.setValue(this.group, this.control, 1);
        this.onPushOrig();
    }

    that.event = function() {
        if (engine.getValue(this.group, "play")) {
            this.colordef = "lo_red";
        } else {
            this.colordef = color1;
        }
        this.setColor(this.colordef);
    }

    that.conEvent = function() {
        engine.connectControl(this.group, "play", this.event);
    }

    that.conEvent();
    return that;
}

function ZoomKey(dir) {
    var that = PushKey("lo_green", "hi_amber");

    that.dir  = dir;

    that.onPushOrig = that.onPush;
    that.onPush = function()
    {
        if ( ZoomKey.zoom < 6 && this.dir === "+" ) {
            ZoomKey.zoom++;
        }
        if ( ZoomKey.zoom > 1 && this.dir === "-") {
            ZoomKey.zoom--;
        }

        for ( ch = 1 ; ch <= NLM.numofdecks ; ch++ ) {
            //print("Zoom:" + ZoomKey.zoom);
            var group = "[Channel" + ch + "]";
            engine.setValue(group, "waveform_zoom", ZoomKey.zoom);
        }

        this.onPushOrig();
    }

    return that;
}
ZoomKey.zoom = 3;

function RateKey(dir, deck) {
    var that = PushKey("lo_orange", "hi_amber");
    that.dir  = dir;
	that.group = "[Channel" + deck + "]";
    that.onPushOrig = that.onPush;
    that.onPush = function()
    {
        if ( this.dir === "+" ) {
            ctrl = "rate_perm_up";
        }
        if ( this.dir === "-") {
            ctrl = "rate_perm_down"
        }
            engine.setValue(this.group, ctrl, 1);
        this.onPushOrig();
    }

    return that;
}

function SeekKey(ch, pos, color) {
    var that = new Key();

    that.pos  = 0.07 * pos;
    that.grp = "[Channel"+ ch + "]";

    that.setled = function()
    {
        if (engine.getValue(this.grp, "playposition") > this.pos) {
            this.setColor("black");
        } else {
            this.setColor(color);
        }
    }

    that.conEvent = function()
    {
        engine.connectControl(this.grp, "beat_active", this.setled);
    }

    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.grp, "playposition", this.pos);
        SeekKey.keys[ch].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKey.keys[ch] === undefined ) SeekKey.keys[ch] = new Array();
    SeekKey.keys[ch][pos] = that;
    return that;
}
SeekKey.keys = new Array();

function SeekKeySampler(ch, pos) {
    var that = new Key();

    that.pos  = 0.125 * pos;
    that.grp = "[Sampler"+ ch + "]";

    that.setled = function()
    {
        if (engine.getValue(this.grp, "playposition") >= this.pos) {
            this.setColor("lo_red");
        } else {
            this.setColor("black");
        }
    }

    that.conEvent = function()
    {
        engine.connectControl(this.grp, "beat_active", this.setled);
    }

    that.conEvent();

    that.onPush = function()
    {
        engine.setValue(this.grp, "playposition", this.pos);
        SeekKeySampler.keys[ch].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeySampler.keys[ch] === undefined ) SeekKeySampler.keys[ch] = new Array();
    SeekKeySampler.keys[ch][pos] = that;
    return that;
}
SeekKeySampler.keys = new Array();

function SeekKey2(ch, pos, multiplier, color1, color2, param, check) {
    var that = new Key();

    that.pos  = multiplier * pos;
    that.grp = "[Channel"+ ch + "]";
    that.param = param;
	that.state = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, this.param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.grp, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
	
    that.onPush = function()
    {
        engine.setValue(this.grp, this.param, this.pos); 
        SeekKey2.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKey2.keys[check] === undefined ) SeekKey2.keys[check] = new Array();
    SeekKey2.keys[check][pos] = that;
    return that;
}
SeekKey2.keys = new Array();

function SeekKeyS2(ch, pos, multiplier, color1, color2, param, check) {
    var that = new Key();

    that.pos  = multiplier * pos;
    that.grp = "[Sampler"+ ch + "]";
    that.param = param;
	that.state = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, this.param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.grp, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
	
    that.onPush = function()
    {
        engine.setValue(this.grp, this.param, this.pos);
        SeekKeyS2.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeyS2.keys[check] === undefined ) SeekKeyS2.keys[check] = new Array();
    SeekKeyS2.keys[check][pos] = that;
    return that;
}
SeekKeyS2.keys = new Array();

function SeekKeySF(ch, pos, multiplier, color1, color2, param, check) {
    var that = new Key();

    that.pos  = multiplier * pos;
    that.grp = "[QuickEffectRack1_[Channel" + ch + "]]";
    that.param = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, this.param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.onPush = function()
    {
        engine.setValue(this.grp, this.param, this.pos);
        SeekKeySF.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeySF.keys[check] === undefined ) SeekKeySF.keys[check] = new Array();
    SeekKeySF.keys[check][pos] = that;
    return that;
}
SeekKeySF.keys = new Array();

function SeekKeyFi(ch, pos, multiplier, color1, color2, param, check) {
    var that = new Key();

    that.pos  = multiplier * pos;
    that.grp = "[EqualizerRack1_[Channel" + ch + "]_Effect1]";
    that.param = param;
	that.state = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, this.param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.grp, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
	
    that.onPush = function()
    {
        engine.setValue(this.grp, this.param, this.pos);
        SeekKeyFi.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeyFi.keys[check] === undefined ) SeekKeyFi.keys[check] = new Array();
    SeekKeyFi.keys[check][pos] = that;
    return that;
}
SeekKeyFi.keys = new Array();

function SeekKeyMaster(ch, pos, multiplier, color1, color2, param, check) {
    var that = new Key();

    that.pos  = multiplier * pos;
    that.grp = "[Master]";
    that.param = param;
	that.state = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, this.param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.conEvent = function() {
        engine.connectControl(this.grp, this.state, this.setled);
    }

    that.setled();
    that.conEvent();
    that.onPush = function()
    {
        engine.setValue(this.grp, this.param, this.pos);
        SeekKeyMaster.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeyMaster.keys[check] === undefined ) SeekKeyMaster.keys[check] = new Array();
    SeekKeyMaster.keys[check][pos] = that;
    return that;
}
SeekKeyMaster.keys = new Array();

function SeekKeyEffect(pos, value, color1, color2, unit, effect, param, check) {
    var that = new Key();

    that.pos  = value;
    if (param === "mix") {
      that.grp = "[EffectRack1_EffectUnit"+unit+"]";
    } else {
      that.grp = "[EffectRack1_EffectUnit"+unit+"_Effect"+effect+"]";
    }
    that.param = param;

    that.setled = function()
    {
        if (engine.getValue(this.grp, param) >= this.pos) {
            this.setColor(color1);
        } else {
            this.setColor(color2);
        }
    }

    that.onPush = function()
    {
        engine.setValue(this.grp, param, this.pos);
        SeekKeyEffect.keys[check].forEach(function(e) { e.setled(); });
    }

    that.setled();

    if ( SeekKeyEffect.keys[check] === undefined ) SeekKeyEffect.keys[check] = new Array();
    SeekKeyEffect.keys[check][pos] = that;
    return that;
}
SeekKeyEffect.keys = new Array();

//Define the controller

NLM = new Controller();
NLM.init = function()
{
        NLM.page = 0;
        NLM.shiftstate = false;
        NLM.numofdecks = engine.getValue("[Master]", "num_decks");
        NLM.numofdecks = 2;

        //Init hw
        midi.sendShortMsg(0xb0, 0x0, 0x0);
        //midi.sendShortMsg(0xb0, 0x0, 0x28); //Enable buffer cycling <-- Figure out whats wrong with this

        // select buffer 0
        midi.sendShortMsg(0xb0, 0x68, 3);
        //midi.sendShortMsg(0xb0, 0x0, 0x31);
        //print("=============================");
        //Setup btnstate which is for phy. state
        NLM.btns = new Array();
        for ( page = 0; page < 8 ; page++ ) {
            NLM.btns[page] = new Array();
            for ( x = 0 ; x < 9 ; x++ ) {
                NLM.btns[page][x] = new Array();
                for ( y = 0 ; y < 9 ; y++ ) {
                    var tmp = new Key;
                    if (x === 8) {
                        tmp = PageSelectKey();
                    }
                    NLM.setupBtn(page,x,y, tmp);
                }
            }
        }
        //Set default page led
        NLM.btns[NLM.page][8][0].setColor("hi_amber");
		
          page = 0;
          // ============ CHANNEL 1 ==============
              deck = 1;
              // PLAY
              NLM.setupBtn(page,0,0, PlayKey("Channel", deck));
              // GOTO START btw
			   // NLM.setupBtn(page,1,0, GotoStart("Channel", deck));
              // CUE btw
			  NLM.setupBtn(page,1,0, Cue("Channel", deck));
              // PFL
              NLM.setupBtn(page,0,1, TooglePfl("Channel", deck));
              // SYNC btw
              NLM.setupBtn(page,1,1, Sync("Channel", deck));
              // BEATLOOP btw
              NLM.setupBtn(page,0,5, beatlooptoggle("Channel", deck));
              // RELOOP btw
              NLM.setupBtn(page,1,5, relooptoggle("Channel", deck));
              // FAST REWIND
              NLM.setupBtn(page,0,2, FFBK(deck, "Channel", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,1,2, FFBK(deck, "Channel", "fwd"));
              // LOOP
              NLM.setupBtn(page,0,6, LoopKey(deck, "0.5"));
              NLM.setupBtn(page,1,6, LoopKey(deck, "1"));
              NLM.setupBtn(page,0,7, LoopKey(deck, "4"));
              NLM.setupBtn(page,1,7, LoopKey(deck, "8"));
              // HOT CUE
              NLM.setupBtn(page,0,3, HotCueKey("Channel", deck, 1));
              NLM.setupBtn(page,1,3, HotCueKey("Channel", deck, 2));
              NLM.setupBtn(page,0,4, HotCueKey("Channel", deck, 3));
              NLM.setupBtn(page,1,4, HotCueKey("Channel", deck, 4));

          // =====================================
			  // PROGRESS D1
			  deck = 1;
			  color = "lo_red";
              NLM.setupBtn(page,2,0, SeekKey(deck, 0, color));
              NLM.setupBtn(page,2,1, SeekKey(deck, 2, color));
              NLM.setupBtn(page,2,2, SeekKey(deck, 4, color));
              NLM.setupBtn(page,2,3, SeekKey(deck, 6, color));
              NLM.setupBtn(page,2,4, SeekKey(deck, 8, color));
              NLM.setupBtn(page,2,5, SeekKey(deck, 10, color));
              NLM.setupBtn(page,2,6, SeekKey(deck, 12, color));
              NLM.setupBtn(page,2,7, SeekKey(deck, 14, color));
          // ============ CHANNEL 1 ==============
            deck = 1;
            // VOLUME
            NLM.setupBtn(page,3,7, SeekKey2(deck, 0, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,6, SeekKey2(deck, 1, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,5, SeekKey2(deck, 2, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,4, SeekKey2(deck, 3, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,3, SeekKey2(deck, 4, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,2, SeekKey2(deck, 5, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,1, SeekKey2(deck, 6, 0.14, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,0, SeekKey2(deck, 7, 0.14, "hi_amber", "black", "volume", 9));
          // =====================================
          // ============ CHANNEL 2 ==============
            deck = 2;
            // VOLUME
            NLM.setupBtn(page,4,7, SeekKey2(deck, 0, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,6, SeekKey2(deck, 1, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,5, SeekKey2(deck, 2, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,4, SeekKey2(deck, 3, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,3, SeekKey2(deck, 4, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,2, SeekKey2(deck, 5, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,1, SeekKey2(deck, 6, 0.14, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,0, SeekKey2(deck, 7, 0.14, "hi_amber", "black", "volume", 10));
          // =====================================
			  // PROGRESS D1
			  deck = 2;
			  color = "lo_red";
              NLM.setupBtn(page,5,0, SeekKey(deck, 0, color));
              NLM.setupBtn(page,5,1, SeekKey(deck, 2, color));
              NLM.setupBtn(page,5,2, SeekKey(deck, 4, color));
              NLM.setupBtn(page,5,3, SeekKey(deck, 6, color));
              NLM.setupBtn(page,5,4, SeekKey(deck, 10, color));
              NLM.setupBtn(page,5,5, SeekKey(deck, 12, color));
              NLM.setupBtn(page,5,6, SeekKey(deck, 14, color));
              NLM.setupBtn(page,5,7, SeekKey(deck, 16, color));
        // ==========================================
		  
          // ============ CHANNEL 2 ==============
            deck = 2;
              // PLAY
              NLM.setupBtn(page,6,0, PlayKey("Channel", deck));
              // GOTO START btw
			  // NLM.setupBtn(page,7,0, GotoStart("Channel", deck));
              // CUE btw
			  NLM.setupBtn(page,7,0, Cue("Channel", deck));
              // PFL
              NLM.setupBtn(page,6,1, TooglePfl("Channel", deck));
              // SYNC btw
              NLM.setupBtn(page,7,1, Sync("Channel", deck));
              // BEATLOOP btw
              NLM.setupBtn(page,6,5, beatlooptoggle("Channel", deck));
              // RELOOP btw
              NLM.setupBtn(page,7,5, relooptoggle("Channel", deck));
              // FAST REWIND
              NLM.setupBtn(page,6,2, FFBK(deck, "Channel", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,7,2, FFBK(deck, "Channel", "fwd"));
              // LOOP
              NLM.setupBtn(page,6,6, LoopKey(deck, "0.5"));
              NLM.setupBtn(page,7,6, LoopKey(deck, "1"));
              NLM.setupBtn(page,6,7, LoopKey(deck, "4"));
              NLM.setupBtn(page,7,7, LoopKey(deck, "8"));
              // HOT CUE
              NLM.setupBtn(page,6,3, HotCueKey("Channel", deck, 1));
              NLM.setupBtn(page,7,3, HotCueKey("Channel", deck, 2));
              NLM.setupBtn(page,6,4, HotCueKey("Channel", deck, 3));
              NLM.setupBtn(page,7,4, HotCueKey("Channel", deck, 4));

          // ========================================
          // ============== CONTROLS ===============
			// RATE (BPM)
            NLM.setupBtn(page,0,8, RateKey("+", 1));
            NLM.setupBtn(page,1,8, RateKey("-", 1));
            NLM.setupBtn(page,6,8, RateKey("+", 2));
            NLM.setupBtn(page,7,8, RateKey("-", 2));
            NLM.setupBtn(page,2,8, MasterXfader("crossfader_down", 1));
            NLM.setupBtn(page,5,8, MasterXfader("crossfader_up", 1));
			
            // HeadPhones Split
            NLM.setupBtn(page,3,8, HPhoneSplit());
            // SHIFT
            NLM.setupBtn(page,4,8, ShiftKey());
          // ========================================
        // ==========================================
        // ================ PAGE B ==================
          page = 1;
          // ============ CHANNEL 1 ==============
            deck = 1;
            // SUPERFILTER 
            NLM.setupBtn(page,0,7, SeekKeySF(deck, 0, 0.125, "mi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,6, SeekKeySF(deck, 1, 0.125, "mi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,5, SeekKeySF(deck, 2, 0.125, "mi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,4, SeekKeySF(deck, 3, 0.125, "mi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,3, SeekKeySF(deck, 4, 0.125, "hi_green", "lo_amber", "super1", 1));
            NLM.setupBtn(page,0,2, SeekKeySF(deck, 5, 0.125, "hi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,1, SeekKeySF(deck, 6, 0.125, "hi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,0, SeekKeySF(deck, 7, 0.125, "hi_red", "black", "super1", 1));
            NLM.setupBtn(page,0,8, SeekKeySF(deck, 8, 0.125, "hi_red", "black", "super1", 1));
            // FILTER HIGH
            NLM.setupBtn(page,1,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter3", 2));
            NLM.setupBtn(page,1,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter3", 2));
            NLM.setupBtn(page,1,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter3", 2));
            NLM.setupBtn(page,1,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter3", 2));
            NLM.setupBtn(page,1,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter3", 2));
            NLM.setupBtn(page,1,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter3", 2));
            NLM.setupBtn(page,1,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter3", 2));
            NLM.setupBtn(page,1,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter3", 2));
            NLM.setupBtn(page,1,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter3", 2));
            // FILTER MID
            NLM.setupBtn(page,2,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter2", 3));
            NLM.setupBtn(page,2,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter2", 3));
            NLM.setupBtn(page,2,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter2", 3));
            NLM.setupBtn(page,2,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter2", 3));
            NLM.setupBtn(page,2,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter2", 3));
            NLM.setupBtn(page,2,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter2", 3));
            NLM.setupBtn(page,2,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter2", 3));
            NLM.setupBtn(page,2,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter2", 3));
            NLM.setupBtn(page,2,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter2", 3));
            // FILTER LOW
            NLM.setupBtn(page,3,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter1", 4));
            NLM.setupBtn(page,3,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter1", 4));
            NLM.setupBtn(page,3,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter1", 4));
            NLM.setupBtn(page,3,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter1", 4));
            NLM.setupBtn(page,3,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter1", 4));
            NLM.setupBtn(page,3,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter1", 4));
            NLM.setupBtn(page,3,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter1", 4));
            NLM.setupBtn(page,3,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter1", 4));
            NLM.setupBtn(page,3,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter1", 4));
          // ========================================
          // ============== CHANNEL 2 ===============
            deck = 2;
            // SUPERFILTER
            NLM.setupBtn(page,4,7, SeekKeySF(deck, 0, 0.125, "mi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,6, SeekKeySF(deck, 1, 0.125, "mi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,5, SeekKeySF(deck, 2, 0.125, "mi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,4, SeekKeySF(deck, 3, 0.125, "mi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,3, SeekKeySF(deck, 4, 0.125, "hi_green", "lo_amber", "super1", 13));
            NLM.setupBtn(page,4,2, SeekKeySF(deck, 5, 0.125, "hi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,1, SeekKeySF(deck, 6, 0.125, "hi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,0, SeekKeySF(deck, 7, 0.125, "hi_red", "black", "super1", 13));
            NLM.setupBtn(page,4,8, SeekKeySF(deck, 8, 0.125, "hi_red", "black", "super1", 13));
            // FILTER HIGH
            NLM.setupBtn(page,5,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter3", 6));
            NLM.setupBtn(page,5,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter3", 6));
            NLM.setupBtn(page,5,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter3", 6));
            NLM.setupBtn(page,5,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter3", 6));
            NLM.setupBtn(page,5,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter3", 6));
            NLM.setupBtn(page,5,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter3", 6));
            NLM.setupBtn(page,5,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter3", 6));
            NLM.setupBtn(page,5,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter3", 6));
            NLM.setupBtn(page,5,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter3", 6));
            // FILTER MID
            NLM.setupBtn(page,6,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter2", 7));
            NLM.setupBtn(page,6,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter2", 7));
            NLM.setupBtn(page,6,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter2", 7));
            NLM.setupBtn(page,6,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter2", 7));
            NLM.setupBtn(page,6,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter2", 7));
            NLM.setupBtn(page,6,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter2", 7));
            NLM.setupBtn(page,6,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter2", 7));
            NLM.setupBtn(page,6,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter2", 7));
            NLM.setupBtn(page,6,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter2", 7));
            // FILTER LOW
            NLM.setupBtn(page,7,7, SeekKeyFi(deck, 0, 0.25, "lo_amber", "black", "parameter1", 8));
            NLM.setupBtn(page,7,6, SeekKeyFi(deck, 1, 0.25, "lo_amber", "black", "parameter1", 8));
            NLM.setupBtn(page,7,5, SeekKeyFi(deck, 2, 0.25, "lo_amber", "black", "parameter1", 8));
            NLM.setupBtn(page,7,4, SeekKeyFi(deck, 3, 0.25, "lo_amber", "black", "parameter1", 8));
            NLM.setupBtn(page,7,3, SeekKeyFi(deck, 4, 0.25, "hi_green", "lo_red", "parameter1", 8));
            NLM.setupBtn(page,7,2, SeekKeyFi(deck, 5, 0.25, "hi_yellow", "black", "parameter1", 8));
            NLM.setupBtn(page,7,1, SeekKeyFi(deck, 5, 0.35, "hi_yellow", "black", "parameter1", 8));
            NLM.setupBtn(page,7,0, SeekKeyFi(deck, 6, 0.4166, "hi_yellow", "black", "parameter1", 8));
            NLM.setupBtn(page,7,8, SeekKeyFi(deck, 8, 0.5, "hi_yellow", "black", "parameter1", 8));
          // ========================================
        // ==========================================
        // ================ PAGE C ==================
          page = 2;
          // ============= EFFECTS ===============
            // FX1
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,0,7, SeekKeyEffect(0, 0, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,6, SeekKeyEffect(1, 0.125, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,5, SeekKeyEffect(2, 0.25, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,4, SeekKeyEffect(3, 0.375, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,3, SeekKeyEffect(4, 0.5, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,2, SeekKeyEffect(5, 0.625, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,1, SeekKeyEffect(6, 0.75, "hi_yellow", "black", 1, 1, "meta", 1));
            NLM.setupBtn(page,0,0, SeekKeyEffect(7, 1, "hi_yellow", "black", 1, 1, "meta", 1));
            // Mix FX1
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,1,7, SeekKeyEffect(0, 0, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,6, SeekKeyEffect(1, 0.125, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,5, SeekKeyEffect(2, 0.25, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,4, SeekKeyEffect(3, 0.375, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,3, SeekKeyEffect(4, 0.5, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,2, SeekKeyEffect(5, 0.625, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,1, SeekKeyEffect(6, 0.75, "hi_red", "black", 1, 1, "mix", 2));
            NLM.setupBtn(page,1,0, SeekKeyEffect(7, 1, "hi_red", "black", 1, 1, "mix", 2));
            // FX2
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,2,7, SeekKeyEffect(0, 0, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,6, SeekKeyEffect(1, 0.125, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,5, SeekKeyEffect(2, 0.25, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,4, SeekKeyEffect(3, 0.375, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,3, SeekKeyEffect(4, 0.5, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,2, SeekKeyEffect(5, 0.625, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,1, SeekKeyEffect(6, 0.75, "hi_yellow", "black", 2, 1, "meta", 3));
            NLM.setupBtn(page,2,0, SeekKeyEffect(7, 1, "hi_yellow", "black", 2, 1, "meta", 3));
            // Mix FX2
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,3,7, SeekKeyEffect(0, 0, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,6, SeekKeyEffect(1, 0.125, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,5, SeekKeyEffect(2, 0.25, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,4, SeekKeyEffect(3, 0.375, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,3, SeekKeyEffect(4, 0.5, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,2, SeekKeyEffect(5, 0.625, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,1, SeekKeyEffect(6, 0.75, "hi_red", "black", 2, 1, "mix", 4));
            NLM.setupBtn(page,3,0, SeekKeyEffect(7, 1, "hi_red", "black", 2, 1, "mix", 4));
            // FX3
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,4,7, SeekKeyEffect(0, 0, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,6, SeekKeyEffect(1, 0.125, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,5, SeekKeyEffect(2, 0.25, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,4, SeekKeyEffect(3, 0.375, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,3, SeekKeyEffect(4, 0.5, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,2, SeekKeyEffect(5, 0.625, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,1, SeekKeyEffect(6, 0.75, "hi_yellow", "black", 3, 1, "meta", 5));
            NLM.setupBtn(page,4,0, SeekKeyEffect(7, 1, "hi_yellow", "black", 3, 1, "meta", 5));
            // Mix FX3
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,5,7, SeekKeyEffect(0, 0, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,6, SeekKeyEffect(1, 0.125, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,5, SeekKeyEffect(2, 0.25, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,4, SeekKeyEffect(3, 0.375, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,3, SeekKeyEffect(4, 0.5, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,2, SeekKeyEffect(5, 0.625, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,1, SeekKeyEffect(6, 0.75, "hi_red", "black", 3, 1, "mix", 6));
            NLM.setupBtn(page,5,0, SeekKeyEffect(7, 1, "hi_red", "black", 3, 1, "mix", 6));
            // FX4
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,6,7, SeekKeyEffect(0, 0, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,6, SeekKeyEffect(1, 0.125, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,5, SeekKeyEffect(2, 0.25, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,4, SeekKeyEffect(3, 0.375, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,3, SeekKeyEffect(4, 0.5, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,2, SeekKeyEffect(5, 0.625, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,1, SeekKeyEffect(6, 0.75, "hi_yellow", "black", 4, 1, "meta", 7));
            NLM.setupBtn(page,6,0, SeekKeyEffect(7, 1, "hi_yellow", "black", 4, 1, "meta", 7));
            // Mix FX4
            // pos, value, color1, color2, unit, effect, param, check
            NLM.setupBtn(page,7,7, SeekKeyEffect(0, 0, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,6, SeekKeyEffect(1, 0.125, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,5, SeekKeyEffect(2, 0.25, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,4, SeekKeyEffect(3, 0.375, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,3, SeekKeyEffect(4, 0.5, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,2, SeekKeyEffect(5, 0.625, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,1, SeekKeyEffect(6, 0.75, "hi_red", "black", 4, 1, "mix", 8));
            NLM.setupBtn(page,7,0, SeekKeyEffect(7, 1, "hi_red", "black", 4, 1, "mix", 8));
			
            // Assign FX to Decks
            NLM.setupBtn(page,0,8, FXAssign(1,1));
            NLM.setupBtn(page,1,8, FXAssign(1,2));
            NLM.setupBtn(page,2,8, FXAssign(2,1));
            NLM.setupBtn(page,3,8, FXAssign(2,2));
            NLM.setupBtn(page,4,8, FXAssign(3,1));
            NLM.setupBtn(page,5,8, FXAssign(3,2));
            NLM.setupBtn(page,6,8, FXAssign(4,1));
            NLM.setupBtn(page,7,8, FXAssign(4,2));
			
          // =====================================
        // ==========================================
        // ================ PAGE D ==================
          page = 3;
		   // ============ CHANNEL 1 ==============
            deck = 1;
            // MASTER VOLUME
            NLM.setupBtn(page,0,7, SeekKeyMaster(deck, 0, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,6, SeekKeyMaster(deck, 1, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,5, SeekKeyMaster(deck, 2, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,4, SeekKeyMaster(deck, 3, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,3, SeekKeyMaster(deck, 4, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,2, SeekKeyMaster(deck, 5, 0.2, "lo_yellow", "hi_green", "gain", 11));
            NLM.setupBtn(page,0,1, SeekKeyMaster(deck, 6, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,0,0, SeekKeyMaster(deck, 7, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,7, SeekKeyMaster(deck, 8, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,6, SeekKeyMaster(deck, 9, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,5, SeekKeyMaster(deck, 10, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,4, SeekKeyMaster(deck, 11, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,3, SeekKeyMaster(deck, 12, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,2, SeekKeyMaster(deck, 13, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,1, SeekKeyMaster(deck, 14, 0.2, "lo_red", "black", "gain", 11));
            NLM.setupBtn(page,1,0, SeekKeyMaster(deck, 15, 0.2, "lo_red", "black", "gain", 11));
			
			
            NLM.setupBtn(page,1,8, MasterVol("gain_down_small"));
			NLM.setupBtn(page,0,8, MasterVol("gain_up_small"));
			
          // =====================================
		  // ============== PREGAIN 1 ===============
            deck = 1;
            // 
            NLM.setupBtn(page,2,7, SeekKey2(deck, 0, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,6, SeekKey2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,5, SeekKey2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,4, SeekKey2(deck, 3, 0.33, "hi_yellow", "lo_amber", "pregain", 1));
            NLM.setupBtn(page,2,3, SeekKey2(deck, 4, 0.33, "hi_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,2, SeekKey2(deck, 5, 0.33, "hi_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,1, SeekKey2(deck, 6, 0.33, "hi_green", "black", "pregain", 1));
            NLM.setupBtn(page,2,0, SeekKey2(deck, 7, 0.33, "hi_green", "black", "pregain", 1));
          // ============ CHANNEL 1 ==============
            deck = 1;
            // VOLUME
            NLM.setupBtn(page,3,7, SeekKey2(deck, 0, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,6, SeekKey2(deck, 1, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,5, SeekKey2(deck, 2, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,4, SeekKey2(deck, 3, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,3, SeekKey2(deck, 4, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,2, SeekKey2(deck, 5, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,1, SeekKey2(deck, 6, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,0, SeekKey2(deck, 7, 0.12, "hi_amber", "black", "volume", 9));
            NLM.setupBtn(page,3,8, SeekKey2(deck, 8, 0.12, "hi_yellow", "black", "volume", 9));
          // =====================================
          // ============ CHANNEL 2 ==============
            deck = 2;
            // VOLUME
            NLM.setupBtn(page,4,7, SeekKey2(deck, 0, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,6, SeekKey2(deck, 1, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,5, SeekKey2(deck, 2, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,4, SeekKey2(deck, 3, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,3, SeekKey2(deck, 4, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,2, SeekKey2(deck, 5, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,1, SeekKey2(deck, 6, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,0, SeekKey2(deck, 7, 0.12, "hi_amber", "black", "volume", 10));
            NLM.setupBtn(page,4,8, SeekKey2(deck, 8, 0.12, "hi_yellow", "black", "volume", 10));
          // =====================================
		  // ============== PREGAIN 2 ===============
            deck = 2;
            // 
            NLM.setupBtn(page,5,7, SeekKey2(deck, 0, 0.33, "lo_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,6, SeekKey2(deck, 1, 0.33, "lo_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,5, SeekKey2(deck, 2, 0.33, "lo_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,4, SeekKey2(deck, 3, 0.33, "hi_yellow", "lo_amber", "pregain", 5));
            NLM.setupBtn(page,5,3, SeekKey2(deck, 4, 0.33, "hi_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,2, SeekKey2(deck, 5, 0.33, "hi_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,1, SeekKey2(deck, 6, 0.33, "hi_green", "black", "pregain", 5));
            NLM.setupBtn(page,5,0, SeekKey2(deck, 7, 0.33, "hi_green", "black", "pregain", 5));
        // ==========================================
		   // ============ HEADPHONE VOLUME ==============
            deck = 1;
            // HEADPHONE VOLUME
            NLM.setupBtn(page,6,7, SeekKeyMaster(deck, 0, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,6, SeekKeyMaster(deck, 1, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,5, SeekKeyMaster(deck, 2, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,4, SeekKeyMaster(deck, 3, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,3, SeekKeyMaster(deck, 4, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,2, SeekKeyMaster(deck, 5, 0.2, "lo_yellow", "hi_green", "headGain", 12));
            NLM.setupBtn(page,6,1, SeekKeyMaster(deck, 6, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,6,0, SeekKeyMaster(deck, 7, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,7, SeekKeyMaster(deck, 8, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,6, SeekKeyMaster(deck, 9, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,5, SeekKeyMaster(deck, 10, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,4, SeekKeyMaster(deck, 11, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,3, SeekKeyMaster(deck, 12, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,2, SeekKeyMaster(deck, 13, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,1, SeekKeyMaster(deck, 14, 0.2, "lo_red", "black", "headGain", 12));
            NLM.setupBtn(page,7,0, SeekKeyMaster(deck, 15, 0.2, "lo_red", "black", "headGain", 12));
			
			
            NLM.setupBtn(page,6,8, MasterVol("headGain_down_small"));
			NLM.setupBtn(page,7,8, MasterVol("headGain_up_small"));
			
            // PEAK INDICATORS
            NLM.setupBtn(page,2,8, PeakIndicator(1));
            NLM.setupBtn(page,5,8, PeakIndicator(2));
        // ================ PAGE E ==================
          page = 4;
            // PLAY REPEAT 1-8
            NLM.setupBtn(page, 0, 7, PlayKeyStart("Sampler", 1));
            NLM.setupBtn(page, 1, 7, PlayKeyStart("Sampler", 2));
            NLM.setupBtn(page, 2, 7, PlayKeyStart("Sampler", 3));
            NLM.setupBtn(page, 3, 7, PlayKeyStart("Sampler", 4));
            NLM.setupBtn(page, 4, 7, PlayKeyStart("Sampler", 5));
            NLM.setupBtn(page, 5, 7, PlayKeyStart("Sampler", 6));
            NLM.setupBtn(page, 6, 7, PlayKeyStart("Sampler", 7));
            NLM.setupBtn(page, 7, 7, PlayKeyStart("Sampler", 8));
			//
			deck = 1;
			column = 0;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 2;
			column = 1;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 3;
			column = 2;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 4;
			column = 3;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 5;
			column = 4;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 6;
			column = 5;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 7;
			column = 6;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 8;
			column = 7;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
		  
		  
          // ============== CONTROLOS ===============
            // SHOW SAMPLERS
            NLM.setupBtn(page,0,8, SamplersShow());
            // SAMPLERS Load
            NLM.setupBtn(page,1,8, SamplersBank("LoadSamplerBank"));
          // ========================================
        // ==========================================
        // ==========================================
        // ================ PAGE F ==================
		// =============== Sampler 5-8 ==============
          page = 5;
            // PLAY 9-16
            NLM.setupBtn(page, 0, 7, PlayKeyS("Sampler", 9));
            NLM.setupBtn(page, 1, 7, PlayKeyS("Sampler", 10));
            NLM.setupBtn(page, 2, 7, PlayKeyS("Sampler", 11));
            NLM.setupBtn(page, 3, 7, PlayKeyS("Sampler", 12));
            NLM.setupBtn(page, 4, 7, PlayKeyS("Sampler", 13));
            NLM.setupBtn(page, 5, 7, PlayKeyS("Sampler", 14));
            NLM.setupBtn(page, 6, 7, PlayKeyS("Sampler", 15));
            NLM.setupBtn(page, 7, 7, PlayKeyS("Sampler", 16));
            // 
			deck = 9;
			column = 0;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 10;
			column = 1;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 11;
			column = 2;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 12;
			column = 3;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 13;
			column = 4;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 14;
			column = 5;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 15;
			column = 6;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
			//
			deck = 16;
			column = 7;
            NLM.setupBtn(page,column,6, SeekKeyS2(deck, 0, 0.33, "lo_green", "lo_red", "pregain", 1));
            NLM.setupBtn(page,column,5, SeekKeyS2(deck, 1, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,4, SeekKeyS2(deck, 2, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,3, SeekKeyS2(deck, 3, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,2, SeekKeyS2(deck, 4, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,1, SeekKeyS2(deck, 5, 0.33, "lo_green", "black", "pregain", 1));
            NLM.setupBtn(page,column,0, SeekKeyS2(deck, 6, 0.33, "lo_green", "black", "pregain", 1));
		  
		  
          // ============== CONTROLOS ===============
            // SHOW SAMPLERS
            NLM.setupBtn(page,0,8, SamplersShow());
            // SAMPLERS Load
            NLM.setupBtn(page,1,8, SamplersBank("LoadSamplerBank"));
          // ========================================
        // ================ PAGE G ==================
		// =============== Sampler 1-8 ==============
          page = 6; 
            // =========== SAMPLER 1 ==============
              channel = 1;
			  row = 0;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 2 ==============
              channel = 2;
			  row = 1;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 3 ==============
              channel = 3;
			  row = 2;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 4 ==============
              channel = 4;
			  row = 3;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 5 ==============
              channel = 5;
			  row = 4;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 6 ==============
              channel = 6;
			  row = 5;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 7 ==============
              channel = 7;
			  row = 6;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
            // ====================================
            // =========== SAMPLER 8 ==============
              channel = 8;
			  row = 7;
              // PLAY
              NLM.setupBtn(page, 0, row, PlayKeyStart("Sampler", channel));
              // PFL
              NLM.setupBtn(page,1,row, TooglePfl("Sampler", channel));
              // FAST REWIND
              NLM.setupBtn(page,2,row, FFBK(channel, "Sampler", "back"));
              // FAST FORWARD
              NLM.setupBtn(page,3,row, FFBK(channel, "Sampler", "fwd"));
              // HOT CUE
              NLM.setupBtn(page, 4,row, HotCueKey("Sampler", channel, 1));
              NLM.setupBtn(page, 5,row, HotCueKey("Sampler", channel, 2));
              NLM.setupBtn(page, 6,row, HotCueKey("Sampler", channel, 3));
              NLM.setupBtn(page, 7,row, HotCueKey("Sampler", channel, 3));
          // ============== CONTROLOS ===============
            // SHOW SAMPLERS
            NLM.setupBtn(page,0,8, SamplersShow());
            // SAMPLERS Load
            NLM.setupBtn(page,1,8, SamplersBank("LoadSamplerBank"));
            // SHIFT
            NLM.setupBtn(page,7,8, ShiftKey());
          // ========================================
        // ==========================================
		
       // ==========================================
       // ================ PAGE H ==================
          page = 7;		  
          // ============== CONTROLOS ===============

            // NAVIGATE
            NLM.setupBtn(page,1,0, PushKeyBin("hi_orange", "hi_amber", "[Library]", "ScrollVertical", -1));
            NLM.setupBtn(page,0,0, PushKeyBin("hi_yellow", "hi_amber", "[Library]", "MoveVertical", -1));
            NLM.setupBtn(page,0,1, PushKeyBin("hi_green", "hi_amber", "[Library]", "GoToItem", 1));
            NLM.setupBtn(page,1,1, PushKeyBin("lo_red", "hi_amber", "[Library]", "MoveFocusForward", 1));
            NLM.setupBtn(page,0,2, PushKeyBin("hi_yellow", "hi_amber", "[Library]", "MoveVertical", 1));
            NLM.setupBtn(page,1,2, PushKeyBin("hi_orange", "hi_amber", "[Library]", "ScrollVertical", 1));
			
            // LOAD TRACK
            // AUTODJ
            NLM.setupBtn(page,4,0, PushKeyBinADJ("hi_yellow", "hi_amber", "[Library]", "AutoDjAddTop", 1));
            NLM.setupBtn(page,5,0, PushKeyBinADJ("hi_yellow", "hi_amber", "[Library]", "AutoDjAddBottom", 1));
            NLM.setupBtn(page,6,0, PushKeyBin("hi_green", "hi_green", "[AutoDJ]", "fade_now", 1));
            NLM.setupBtn(page,7,0, PushKeyBin("hi_red", "hi_amber", "[AutoDJ]", "skip_next", 1));
			// DECKS 1 & 2
            NLM.setupBtn(page,4,1, LoadKey("Channel",1, "hi_green", "hi_red"));
            NLM.setupBtn(page,5,1, LoadKey("Channel",2, "hi_red", "hi_red"));
			// SAMPLERS
            NLM.setupBtn(page,4,2, LoadKey2("Sampler",1, "hi_orange", "hi_green"));
            NLM.setupBtn(page,5,2, LoadKey2("Sampler",2, "hi_orange", "hi_green"));
            NLM.setupBtn(page,6,2, LoadKey2("Sampler",3, "hi_orange", "hi_green"));
            NLM.setupBtn(page,7,2, LoadKey2("Sampler",4, "hi_orange", "hi_green"));
            NLM.setupBtn(page,4,3, LoadKey2("Sampler",5, "hi_orange", "hi_green"));
            NLM.setupBtn(page,5,3, LoadKey2("Sampler",6, "hi_orange", "hi_green"));
            NLM.setupBtn(page,6,3, LoadKey2("Sampler",7, "hi_orange", "hi_green"));
            NLM.setupBtn(page,7,3, LoadKey2("Sampler",8, "hi_orange", "hi_green"));
			

              // PROGRESSO D1
			  deck = 1;
			  color = "hi_amber";
              NLM.setupBtn(page,0,4, SeekKey(deck, 0, color));
              NLM.setupBtn(page,1,4, SeekKey(deck, 1, color));
              NLM.setupBtn(page,2,4, SeekKey(deck, 2, color));
              NLM.setupBtn(page,3,4, SeekKey(deck, 3, color));
              NLM.setupBtn(page,0,5, SeekKey(deck, 4, color));
              NLM.setupBtn(page,1,5, SeekKey(deck, 5, color));
              NLM.setupBtn(page,2,5, SeekKey(deck, 6, color));
              NLM.setupBtn(page,3,5, SeekKey(deck, 7, color));
              NLM.setupBtn(page,0,6, SeekKey(deck, 8, color));
              NLM.setupBtn(page,1,6, SeekKey(deck, 9, color));
              NLM.setupBtn(page,2,6, SeekKey(deck, 10, color));
              NLM.setupBtn(page,3,6, SeekKey(deck, 11, color));
              NLM.setupBtn(page,0,7, SeekKey(deck, 12, color));
              NLM.setupBtn(page,1,7, SeekKey(deck, 13, color));
              NLM.setupBtn(page,2,7, SeekKey(deck, 14, color));
              NLM.setupBtn(page,3,7, SeekKey(deck, 15, color));
              // PROGRESSO D2
			  deck = 2;
			  color = "hi_red";
              NLM.setupBtn(page,4,4, SeekKey(deck, 0, color));
              NLM.setupBtn(page,5,4, SeekKey(deck, 1, color));
              NLM.setupBtn(page,6,4, SeekKey(deck, 2, color));
              NLM.setupBtn(page,7,4, SeekKey(deck, 3, color));
              NLM.setupBtn(page,4,5, SeekKey(deck, 4, color));
              NLM.setupBtn(page,5,5, SeekKey(deck, 5, color));
              NLM.setupBtn(page,6,5, SeekKey(deck, 6, color));
              NLM.setupBtn(page,7,5, SeekKey(deck, 7, color));
              NLM.setupBtn(page,4,6, SeekKey(deck, 8, color));
              NLM.setupBtn(page,5,6, SeekKey(deck, 9, color));
              NLM.setupBtn(page,6,6, SeekKey(deck, 10, color));
              NLM.setupBtn(page,7,6, SeekKey(deck, 11, color));
              NLM.setupBtn(page,4,7, SeekKey(deck, 12, color));
              NLM.setupBtn(page,5,7, SeekKey(deck, 13, color));
              NLM.setupBtn(page,6,7, SeekKey(deck, 14, color));
              NLM.setupBtn(page,7,7, SeekKey(deck, 15, color));
			  
            // ZOOM
            NLM.setupBtn(page,0,8, ZoomKey("-"));
            NLM.setupBtn(page,1,8, ZoomKey("+"));
            // 
            NLM.setupBtn(page,2,8, PushKeyBin("hi_green", "hi_amber", "[Library]", "font_size_increment", 1));
            NLM.setupBtn(page,3,8, PushKeyBin("hi_green", "hi_amber", "[Library]", "font_size_decrement", 1));
            NLM.setupBtn(page,4,8, ToogleLibrary("[Master]"));
            NLM.setupBtn(page,6,8, PushKeyBin("hi_orange", "hi_amber", "[Master]", "crossfader", 0));
            NLM.setupBtn(page,7,8, AutoDJ_enable());
        //  =========================================
        //  ===========================================
        this.drawPage();
};

NLM.setupBtn = function(page, x, y, btn)
{
    NLM.btns[page][x][y] = btn;
    NLM.btns[page][x][y].init(page, x, y);
}

NLM.shutdown = function()
{

};

NLM.incomingData = function(channel, control, value, status, group)
{
        //print("Incoming data");
        //print("cha: " + channel);
        //print("con: " + control);
        //print("val: " + value);
        //print("sta: " + status);
        //print("grp: " + group);

        //Just to make life easier

        var pressed = (value === 127);
        //Translate midi btn into index
        var y = Math.floor(control / 16);
        var x = control - y * 16;
        if ( y === 6 && x > 8 ) {
            y = 8;
            x -= 8;
        }
        if ( y === 6 && x === 8 && status === 176 ) {
            y = 8; x = 0;
        }

        print( "COO: " + NLM.page + ":" + x + ":" + y);
        NLM.btns[NLM.page][x][y].pressed = pressed;
        NLM.btns[NLM.page][x][y].callback();
};

NLM.drawPage = function() {
    for ( x = 0 ; x < 9 ; x++ ) {
        for ( y = 0 ; y < 9 ; y++ ) {
            NLM.btns[NLM.page][x][y].draw();
        }
    }
}
