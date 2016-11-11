var png = document.createElement('img');

$('#a').each(function () {
    var ctx = this.getContext("2d");
  var centerX = this.width / 2;
  var centerY = this.height / 2;
  var radius = 15;
  var x = 0;
  var y = 0
  for(; y < this.width; y=y+2) {                           // walk x/y grid
    for(x = 0; x < this.width; x=x+2) {
        ctx.fillStyle = getRndColor();          // set random color
        ctx.fillRect(x, y, 2, 2);               // draw a pixel
    }
}

var gradient = ctx.createRadialGradient(radius,radius,radius+5,radius,radius,radius-8);
gradient.addColorStop(0,"black");
gradient.addColorStop(1,"green");
ctx.globalCompositeOperation = "screen";
ctx.fillStyle = gradient;
ctx.fillRect(0,0,this.width,this.width);
 ctx.restore();

ctx.globalCompositeOperation = 'destination-in'; 
ctx.arc(radius, radius, radius, 0, 2*Math.PI);
ctx.fill();


// reset
ctx.globalCompositeOperation = 'source-over';
    
    png.src = this.toDataURL('image/png');
  function getRndColor() {
    var h = 260*Math.random()|80,
        s = 80*Math.random()|60,
       l = 60*Math.random()|30;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}  
    
});



$('#b').each(function () {
    var ctx = this.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(png, 0, 0, png.width*4, png.height*4);
});
