function $(s){
    return document.querySelectorAll(s);
}

var size = 128;  //定义音频数组长度

var box = $('.right')[0];
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var line;  //处理的渐变色变量
box.appendChild(canvas);
var height,width;
var Dots = [];  //存放点对象数组,点的坐标和颜色等信息
var list = $("#list li");

var mv = new MusicVisualization({
    size:size,
    draw:draw
});


function getRandom(m,n){
    return Math.round(Math.random()*(n-m)+m);
}
function getDots(){
    Dots = [];
    for(var i=0;i<size;i++){
        var DotX = getRandom(0,width);
        var DotY = getRandom(0,height);
        // rgba用来增加透明度  最边缘透明度为0
        var DotColor = "rgba("+getRandom(0,255)+","+getRandom(0,255)+","+getRandom(0,255)+",0)";
        Dots.push({
            x:DotX,
            y:DotY,
            color:DotColor,
            dx:getRandom(1,2)
        });
    }
}

//resize 根据窗口大小改变canvas画布大小
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.width = width;
    canvas.height = height;

    // 设置渐变色
    line = ctx.createLinearGradient(0,0,0,height);  //线性渐变
    line.addColorStop(0,"navajowhite");
    line.addColorStop(1,"sandybrown");
    getDots();
}
resize();
window.onresize = resize;


var vol = $("#volume")[0];
vol.onchange = function(){
    mv.changeVolumn(this.value/this.max);
}
mv.changeVolumn(0.8);  //初始化

function draw(arr){
    ctx.clearRect(0,0,width,height);  //清空上次画布内容
    ctx.fillStyle = line;
    var rectWidth = width/size;
    var cw = rectWidth*0.6;  // rectWidth*0.6的目的是保证矩形之间有间隙
    for(var i=0;i<size;i++){
        var o = Dots[i];
        var rectHeight = arr[i]/256*height;  //数据最大值为256
        // 小矩形（x,y,width,height）;
        ctx.fillRect(rectWidth*i,height-rectHeight,cw,rectHeight);
    }
}

$("#add")[0].onclick = function(){
    $("#loadfile")[0].click();
}

$("#loadfile")[0].onchange = function(){
    var file = this.files[0];
    var fr = new FileReader();

    fr.onload = function(e){
        // 重写play方法  e.target.result由ajax路径读入变为arraybuffer对象类型，
        mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);
}
