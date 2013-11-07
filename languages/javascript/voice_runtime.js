// Music Routines
function Voice(){
    console.log("Message");
    this.on = false;
    this.osc;
    this.amp;
    context = new webkitAudioContext();
    var vco = context.createOscillator();
    vco.type = vco.SINE;
    vco.frequency.value = 400;
    var vca = context.createGain();
    vca.gain.value = 0.3;
    vco.connect(vca);
    vca.connect(context.destination);
    this.osc = vco;
    this.amp = vca;
};

Voice.prototype.toggle = function(boolean){
    this.on = boolean;
    if (boolean) 
        this.osc.start(0);
    else
        this.osc.stop(0);
    return true;
};
