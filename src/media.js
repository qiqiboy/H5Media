/**
 * @author qiqiboy
 * @github https://github.com/qiqiboy/Media
 */
;
(function(ROOT,struct,undefined){
    "use strict";
    
    if(typeof Function.prototype.bind!='function'){
        Function.prototype.bind=function(obj){
            var self=this;
            return function(){
                return self.apply(obj,arguments)
            }
        }
    }

    struct.fn=struct.prototype={
        constructor:struct,
        bindEvents:function(){
            var self=this,
                media=this.media;
            this.events={};
            media.addEventListener("error", function(){//出错
                self.fire('error');
            }, false);
            media.addEventListener("playing", function(){//播放
                self.playing=true;
                self.fire('play');
            }, false);
            media.addEventListener("pause", function(){//暂停
                self.playing=false;
                self.fire('pause');
            }, false);
            media.addEventListener("ended", function(){//播放结束
                self.playing=false;
                self.fire('end');
            }, false);
            media.addEventListener("canplaythrough", function(){//可以继续播放，这里用canplaythrough取代canplay事件
                self.fire('canplay');
            }, false);
            media.addEventListener("waiting", function(){//等待缓冲
                self.fire('waiting');
            }, false);
            media.addEventListener("stalled", function(){//播放中断
                self.fire('stalled');
            }, false);
            media.addEventListener("loadedmetadata", function(){//视频元数据获取完毕
                self.playing=!this.paused;
                self.muted=this.muted;
                self.length=self.parse(this.duration);
                self.currentTime=self.parse(this.currentTime);
                self.volume=self.parse(this.volume);

                self.fire('ready',self.length);//视频已经准备好
            }, false);
            media.addEventListener("timeupdate", function(){//进度更新
                self.fire('update',self.currentTime=self.parse(this.currentTime));//播放进度更新
            }, false);
            media.addEventListener("volumechange", function(){//音量调节
                self.fire('volumechange',self.volume=self.parse(this.volume));//视频已经准备好
                if(self.muted=this.muted){
                    self.fire('mute');//静音事件
                }
            }, false);
        },
        updateConfig:function(attrs){
            var attr,node=this.media;
            for(attr in attrs){
                if(attrs.hasOwnProperty(attr)){
                    if(attr in node){
                        node[attr]=attrs[attr];
                    }else{
                        node.setAttribute(attr,attrs[attr]);
                    }
                }
            }
        },
        parse:function(num){
            return parseFloat(num).toFixed(2)||0;
        },
        on:function(ev,callback){
            if(typeof ev == 'object'){
                return Object.keys(ev).forEach(function(_e){
                    this.on(_e,ev[_e]);
                }.bind(this));
            }
            if(!this.events[ev]){
                this.events[ev]=[];
            }
            this.events[ev].push(callback);
            return this;
        },
        fire:function(ev){
            var args=[].slice.call(arguments,1);
            (this.events[ev]||[]).forEach(function(callback){
                if(typeof callback == 'function'){
                    callback.apply(this,args);
                }
            }.bind(this));
            return this;
        },
        play:function(){
            this.media.play();
            return this;
        },
        pause:function(){
            this.media.pause();
            return this;
        },
        stop:function(){
            this.pause();
            return this.reset();
        },
        reset:function(){
            return this.go(0);
        },
        skip:function(offset){
            return this.go(this.currentTime+offset);
        },
        go:function(time){
            try{
                this.media.currentTime=this.parse(Math.min(this.length,Math.max(time,0)));
            }catch(e){}
            return this;
        },
        mute:function(type){
            this.media.muted=typeof type=='undefined'?true:!!type;
            return this;
        },
        setVol:function(v){
            try{
                this.media.volume=this.parse(Math.min(1,Math.max(v,0)));
            }catch(e){}
            return this;
        },
        volUp:function(){
            return this.setVol(this.volume+.1);
        },
        volDown:function(){
            return this.setVol(this.volume-.1);
        }
    }

    
    !function(){
        var tv=document.createElement('video'),
            tester={
                mp4:'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
                ogg:'video/ogg; codecs="theora, vorbis"',
                webm:'video/webm; codecs="vp8, vorbis"'
            },fm,sp={};
        if(typeof HTMLVideoElement!='undefined' && tv.canPlayType){
             for(fm in tester){
                sp[fm]=tv.canPlayType(tester[fm]);
             }
        }
        struct.fn.video=sp;
        tv=null;
    }();

    !function(){
        var tv=document.createElement('audio'),
            tester={
                mp3:'audio/mpeg',
                ogg:'audio/ogg; codecs="vorbis"',
                aac:'audio/mp4; codecs="mp4a.40.5"',
                webm:'audio/webm; codecs="vorbis"'
            },fm,sp={};
        if(typeof HTMLAudioElement!='undefined' && tv.canPlayType){
             for(fm in tester){
                sp[fm]=tv.canPlayType(tester[fm]);
             }
        }
        struct.fn.audio=sp;
        tv=null;
    }();

    ROOT.Media=struct;

})(window,function(config,type){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(config,type);
    }
    this.media=document.createElement(type||'video');
    this.bindEvents();
    this.updateConfig(config);
});
