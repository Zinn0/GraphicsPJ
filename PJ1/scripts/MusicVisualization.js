function MusicVisualization(obj){
    this.source = null;
    this.count = 0;

    this.analyser = MusicVisualization.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size*2;

    // GainNode控制音量
    this.gainNode = MusicVisualization.ac[MusicVisualization.ac.createGain?"createGain":"createGainNode"]();
    // 调用对象
    this.gainNode.connect(MusicVisualization.ac.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.draw = obj.draw;
    this.visualize();
}

MusicVisualization.ac = new (window.AudioContext || window.webkitAudioContext)();

if(typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
    var resumeAudio = function() {
        if(typeof MusicVisualization.ac == "undefined" || MusicVisualization.ac == null) return;
        if(MusicVisualization.ac.state == "suspended") MusicVisualization.ac.resume();
        document.removeEventListener("click", resumeAudio);
    };
    document.addEventListener("click", resumeAudio);
}

// 导入音乐后进行解码，播放
MusicVisualization.prototype.load = function(url,fun){
    this.xhr.abort();
    this.xhr.open("GET",url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    this.xhr.onload = function(){
        fun(self.xhr.response);
    }
    this.xhr.send();
}

// BaseAudioContext.decodeAudioData()生成AudioBuffer
// AudioBuffer在AudioBufferSourceNode使用，就可以播放音乐
MusicVisualization.prototype.decode = function(arraybuffer,fun){
    MusicVisualization.ac.decodeAudioData(arraybuffer,function(buffer){
        fun(buffer);
    },function(err){
        console.log(err);
    });
}

MusicVisualization.prototype.play = function(path){
    var n = ++this.count;
    var self = this;
    self.source && self.source[self.source.stop ? "stop":"noteOff"](); // 开始前先暂停之前音频的播放，防止多份音频同时播放
    if(path instanceof ArrayBuffer){
        self.decode(path,function(buffer){
            if(n!=self.count) return;
            var bufferSource = MusicVisualization.ac.createBufferSource();
            // 解码成功后的buffer赋值给bufferSource的buffer属性
            bufferSource.buffer = buffer;
            bufferSource.loop = true;
            bufferSource.connect(self.analyser);
            bufferSource[bufferSource.start?"start":"noteOn"](0);
            self.source = bufferSource;
        });
    }
    else{
        self.load(path,function(arraybuffer){
            if(n!=self.count) return;
            self.decode(arraybuffer,function(buffer){
                if(n!=self.count) return;
                var bufferSource = MusicVisualization.ac.createBufferSource();
                // 解码成功后的buffer赋值给bufferSource的buffer属性
                bufferSource.buffer = buffer;
                bufferSource.connect(self.analyser);
                bufferSource[bufferSource.start?"start":"noteOn"](0);
                self.source = bufferSource;
            });
        });
    }

}

MusicVisualization.prototype.changeVolumn = function(percent){
    this.gainNode.gain.value = percent * percent;
}

MusicVisualization.prototype.visualize = function(){
    var self = this;
    var arr = new Uint8Array(self.analyser.frequencyBinCount);
    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitrequestAnimationFrame ||
        window.mozrequestAnimationFrame;
    function fn(){
        self.analyser.getByteFrequencyData(arr);
        self.draw(arr);
        requestAnimationFrame(fn);
    }
    requestAnimationFrame(fn);
}
