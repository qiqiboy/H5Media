/**
 * @author qiqiboy
 * @github https://github.com/qiqiboy/Media
 */
;
(function(ROOT,struct,undefined){
    "use strict";

    struct.prototype={
        constructor:struct,
        bindEvents:function(){
            this.events={};
            this.on({
                'ended volumechange':null,
                loadedmetadata:function(){
                    this.isReady=true;
                    this._muted=this.muted;
                }
            });

            if(!isNaN(this.length)){
                this.fire('loadedmetadata');
            }
        },
        updateConfig:function(attrs){
            var attr,type,srcs,node=this.media;
            for(attr in attrs){
                if(attrs.hasOwnProperty(attr)){
                    if(attr=='src' && typeof (srcs=attrs[attr])=='object'){
                        for(type in srcs){
                            if(srcs.hasOwnProperty(type) && struct[this.type][type]){
                                this.updateConfig({src:srcs[type]});
                                break;
                            }
                        }
                        continue;
                    }
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
                    this.fire('ready',this.length);
                    break;
                case 'volumechange':
                    if(this._muted!==this.muted){
                        this.fire(this.muted?'mute':'unmute');
                        this._muted=this.muted;
                    }
                    break;
            }
        },
        getBuffer:function(type){
            var buffered=this.media[type||'buffered'],
                i=0,len=buffered.length,
                ret=[];
            for(;i<len;i++){
                ret.push([buffered.start(i),buffered.end(i)]);
            }
            return ret;
        },
        on:function(evs,callback){
            var self=this;
            if(typeof evs == 'object'){
                Object.keys(evs).forEach(function(ev){
                    self.on(ev,evs[ev]);
                });
            }else{
                evs.split(/\s+/g).forEach(function(ev){
                    if(!self.events[ev]){
                        self.events[ev]=[];
                        self.media.addEventListener(ev,self,false);
                    }
                    typeof callback=='function' && self.events[ev].push(callback) && self.special(ev);
                });
            }
            return this;
        },
        off:function(evs,calback){
            var self=this,events;
            evs.split(/\s+/g).forEach(function(ev){
                if(events=this.events[ev]){
                    if(typeof callback=='function'){
                        events.splice(events.indexOf(callback),1);
                    }else{
                        events.length=0;
                    }

                    if(events.length==0){
                        delete self.events[ev];
                        self.media.removeEventListener(ev,self,false);
                    }
                }
            });
            return this;
        },
        special:function(ev){
            if(ev=='ready' && this.isReady){
                this.events[ev].slice(-1)[0].call(this,this.media,this.length);
            }
        },
        fire:function(ev){
            var args=[].slice.call(arguments,1),
                self=this;
            args.unshift(this.media);
            (this.events[ev]||[]).forEach(function(callback){
                if(typeof callback == 'function'){
                    callback.apply(self,args);
                }
            });
            return this;
        },
        ready:function(callback){
            return this.on('ready',callback);
        },
        play:function(){
            this.playing=true;
            return this;
        },
        pause:function(){
            this.playing=false;
            return this;
        },
        stop:function(){
            return this.pause().reset().fire('stop');
        },
        finish:function(){
            return this.go(this.length);
        },
        toggle:function(){
            this.playing=!this.playing;
            return this;
        },
        reset:function(){
            return this.go(0);
        },
        skip:function(offset){
            this.currentTime+=(offset||1);
            return this;
        },
        go:function(time){
            try{
                this.currentTime=time;
            }catch(e){}
            return this;
        },
        mute:function(){
            this.muted=true;
            return this;
        },
        unmute:function(){
            this.muted=false;
            return this;
        },
        muteToggle:function(){
            this.muted=!this.muted;
            return this;
        },
        setVol:function(v){
            try{
                this.volume=v;
            }catch(e){}
            return this;
        },
        volUp:function(){
            this.volume+=.1;
            return this;
        },
        volDown:function(){
            this.volume-=.1;
            return this;
        },
        load:function(url){
            this.src=url;
            return this;
        },
        canPlayType:function(mime){
            return this.media.canPlayType(mime);
        }
    }

    if(typeof Object.defineProperties=='function'){
        /* 特性检测避免低版本浏览器报错
         */ 

        "paused currentTime duration muted volume ended playbackRate src seeking loop poster preload autoplay controls height width".split(" ").forEach(function(prop){
            Object.defineProperty(struct.prototype,prop,{
                get:function(){
                    return this.media[prop];
                },
                set:function(value){
                    this.media[prop]=value;
                },
                enumerable:true
            });
        });

        Object.defineProperties(struct.prototype,{
            length:{
                get:function(){
                    return this.duration;
                },
                enumerable:true
            },
            playing:{
                get:function(){
                    return !this.ended && !this.paused;
                },
                set:function(value){
                    this.media[!!value?'play':'pause']();
                },
                enumerable:true
            },
            buffered:{
                get:function(){
                    return this.getBuffer();
                },
                enumerable:true
            },
            played:{
                get:function(){
                    return this.getBuffer('played');
                },
                enumerable:true
            }
        });

    }

    
    !function(){
        var tv=document.createElement('video'),
            tester={
                mp4:'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
                ogg:'video/ogg; codecs="theora, vorbis"',
                webm:'video/webm; codecs="vp8, vp9, vorbis"',
                flv:'video/x-flv',
                m3u:'video/mpegurl'
            },fm,sp;
        if(typeof HTMLVideoElement!='undefined' && tv.canPlayType){
            sp={};
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
                wav:'audio/wav; codecs="1"',
                mp3:'audio/mpeg',
                m4a:'audio/x-m4a',
                flac:'audio/x-flac',
                flv:'audio/x-flv',
                m3u:'audio/mpegurl',
                ogg:'audio/ogg; codecs="vorbis, opus"',
                aac:'audio/mp4; codecs="mp4a.40.2, mp4a.40.5"',
                webm:'audio/webm; codecs="vorbis"'
            },fm,sp;
        if(typeof HTMLAudioElement!='undefined' && tv.canPlayType){
            sp={};
            for(fm in tester){
                sp[fm]=tv.canPlayType(tester[fm]);
            }
        }
        struct.audio=sp;
        tv=null;
    }();

    ROOT.H5Media=struct;

})(window,function(config){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(config);
    }
    config=config||{};
    if(1==config.nodeType){
        this.media=config;
    }else{
        this.media=document.createElement(this.type=(config.type||'video'));
        this.updateConfig(config);
    }

    this.bindEvents();
});
