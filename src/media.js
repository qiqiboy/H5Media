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

    struct.prototype={
        constructor:struct,
        bindEvents:function(){
            var media=this.media;
            this.events={};
            this.on({
                'play pause ended':function(){
                    this.playing=!media.paused;
                    this.ended=media.ended;
                },
                loadedmetadata:function(){
                    this.playing=!media.paused;
                    this.muted=media.muted;
                    this.length=this.parse(media.duration);
                    this.currentTime=this.parse(media.currentTime);
                    this.volume=this.parse(media.volume);
                },
                timeupdate:function(){
                    this.currentTime=this.parse(media.currentTime);
                },
                volumechange:function(){
                    this.volume=this.parse(media.volume);
                    this.muted=media.muted;
                }
            });
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
        handleEvent:function(ev){
            var type=ev.type.toLowerCase();
            this.fire(type);

            switch(type){
                case 'ended':
                    this.fire('end');
                    break;
                case 'loadedmetadata':
                    this.fire('ready');
                    break;
                case 'timeupdate':
                    this.fire('update');
                    break;
                case 'volumechange':
                    if(this.muted){
                        this.fire('mute');
                    }
                    break;
            }
        },
        parse:function(num){
            return parseFloat(num.toFixed(2))||0;
        },
        on:function(ev,callback){
            if(typeof ev == 'object'){
                return Object.keys(ev).forEach(function(_e){
                    this.on(_e,ev[_e]);
                }.bind(this));
            }
            var evs=ev.split(/\s+/g);
            if(evs.length>1){
                return evs.forEach(function(_e){
                    this.on(_e,callback);
                }.bind(this));
            }
            if(!this.events[ev]){
                this.events[ev]=[];
                this.media.addEventListener(ev,this,false);
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
        toggle:function(){
            return this.playing?this.pause():this.play();
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
        },
        canPlayType:function(mime){
            return this.media.canPlayType(mime);
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
        struct.video=sp;
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
        struct.audio=sp;
        tv=null;
    }();

    ROOT.Media=struct;

})(window,function(config){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(config);
    }
    config=config||{};
    if(1==config.nodeType){
        this.media=config;
    }else{
        this.media=document.createElement(config.type||'video');
    }
    this.bindEvents();
    this.updateConfig(config);
});
