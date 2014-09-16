Media
=====

html5音频audio和视频video封装组件

## 使用方法及接口说明
```javascript

/* 
 * 实例化一个Media对象，有两种方式
 */
var media=new Media({src:'',type:'video'}); //其一，指定媒体文件的地址、类型等
var media=new Media(document.getElementById('video')); //其二，获取对页面上 video#video 的引用封装

/* 查询媒体文件格式支持情况 */
Media.video //mp4 ogg webm flv
Media.audio //mp3 wav m4a ogg aac webm

/* 媒体准备就绪（可以获取到媒体长度等信息，及对应loadedmetadata事件） 
 * media.ready(callback);
 */
media.ready(function(){
    console.log(this.length);  
});

/* 播放 */
media.playing=true;
media.play();

/* 暂停 */
media.playing=false;
media.pause();

/* 停止 */
media.stop();

/* 回到开头 */
media.reset();

/* 回到结尾 */
media.finish();

/* 反向切换播放状态 */
media.toggle();

/* 快进（推） */
media.skip(number);

/* 跳转到指定时间 */
media.go(number);

/* 设置声音大小0-1 */
media.setVol(number);

/* 调大声音 */
media.volUp();

/* 调小声音 */
media.volDown();

/* 静音 */
media.muted=true;
media.mute();

/* 取消静音 */
media.muted=false;
media.unmute();

/* 缓存情况 */
media.buffered; // [[0,11.0]]

/* 已播放片段情况 */
media.played; // [[0,11.0]]



/* 事件绑定，支持所有的MediaElement级事件 
 * media.on(event_name, callback);
 */
media.on('playing',function(){
    console.log('正在播放');        
});
media.on('pause',function(){
    console.log('暂停播放');        
});

````

## DEMO 
http://u.boy.im/media
