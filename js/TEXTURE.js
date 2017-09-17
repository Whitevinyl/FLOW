
// generates a selection of canvas/bitmap textures

//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

function Texture(width, height,repeat) {
    this.setSize(width, height);
    this.setRepeat(repeat);
}
var proto = Texture.prototype;

proto.setSize = function(width, height) {
    this.width = (width || 256);
    this.height = (height || 256);
    this.size = this.width; // temp, converting from square
};

proto.setRepeat = function(repeat) {
    this.repeat = repeat || false;
};


//-------------------------------------------------------------------------------------------
//  CREATE CANVAS
//-------------------------------------------------------------------------------------------


proto.newCanvas = function() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    return this.canvasObj(canvas);
};

proto.canvasObj = function(canvas) {
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d')
    }
};


//-------------------------------------------------------------------------------------------
//  GENERATE
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  NOISE
//-------------------------------------------------------------------------------------------


proto.noise = function(scale,col,alpha,colorShift,erode) {
    var canvas = this.newCanvas();
    return this.drawNoise(canvas,scale,col,alpha,colorShift,erode);
};


proto.drawNoise = function(canvas,scale,col,alpha,colorShift,erode) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    var cells = Math.ceil( this.size / scale );
    var width = Math.ceil( this.width / scale );
    var height = Math.ceil( this.height / scale );
    var r, g, b, a;
    r = g = b = a = 1; // uniformity scale
    colorShift = 1 - colorShift;

    for (var i=0; i<width; i++) {  // columns //

        for (var j=0; j<height; j++) { // rows //

            if (colorShift<1) {
                r = tombola.rangeFloat(colorShift,1);
                g = tombola.rangeFloat(colorShift,1);
                b = tombola.rangeFloat(colorShift,1);
            }
            a = 1;
            if (tombola.percent(erode * 100)) {
                a = tombola.rangeFloat(0,1);
            }

            color.fillRGBA(ctx, col.R * r, col.G * g, col.B * b, col.A * a );
            ctx.globalAlpha = tombola.rangeFloat(0,alpha);
            ctx.fillRect(i * scale, j * scale, scale, scale);

        }
    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  CLOUD
//-------------------------------------------------------------------------------------------


proto.cloud = function(scale,col,alpha,dither,mode,col2) {
    var canvas = this.newCanvas();
    return this.drawCloud(canvas,scale,col,alpha,dither,mode,col2);
};


proto.drawCloud = function(canvas,scale,col,alpha,dither,mode,col2) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    var simplex = new SimplexNoise();
    var cells = Math.ceil( this.size );
    scale *= 200;
    dither = dither || 0;
    dither *= 100;
    var r, g, b, a;
    r = g = b = a = 1;
    ctx.globalAlpha = alpha;

    for (var i=0; i<cells; i++) {  // columns //

        for (var j = 0; j < cells; j++) { // rows //

            var d = dither;
            if (tombola.percent(10)) {
                d *= 2;
            }

            var xOff = tombola.rangeFloat(-d,d);
            var yOff = tombola.rangeFloat(-d,d);
            var n = (simplex.noise((j + xOff) / scale, (i + yOff) / scale) + 1) / 2;

            a = 0;
            if (mode) {
                switch (mode) {
                    case 'red':
                        r = 0;
                        a = 1;
                        break;
                    case 'green':
                        g = 0;
                        a = 1;
                        break;
                    case 'blue':
                        b = 0;
                        a = 1;
                        break;
                    case 'alpha':
                        a = 0;
                        break;
                }
            }

            if (!col2) {
                col2 = new RGBA(col.R * r, col.G * g, col.B * b, col.A * a);
            }


            var fillCol = color.blend(col2, col, n * 100);

            color.fill(ctx, fillCol );
            ctx.fillRect(i, j, 1, 1);
        }

    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  FLECKS
//-------------------------------------------------------------------------------------------


proto.flecks = function(scale,density,col,alpha) {
    var canvas = this.newCanvas();
    return this.drawFlecks(canvas,scale,density,col,alpha);
};


proto.drawFlecks = function(canvas,scale,density,col,alpha) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    density = Math.ceil((this.size * 10) * density);
    ctx.globalAlpha = alpha;


    color.stroke(ctx, col);

    for (var i=0; i<density; i++) {  // flecks //

        var x = Math.random() * this.size;
        var y = Math.random() * this.size;
        var fleck = scale * tombola.rangeFloat(1,2.5);

        ctx.lineWidth = tombola.rangeFloat(scale/10,scale);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x + tombola.range(-fleck,fleck), y + tombola.range(-fleck,fleck));
        ctx.stroke();
    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  DUST
//-------------------------------------------------------------------------------------------


proto.dust = function(scale,density,col,alpha) {
    var canvas = this.newCanvas();
    return this.drawDust(canvas,scale,density,col,alpha);
};


proto.drawDust = function(canvas,scale,density,col,alpha) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    density = Math.ceil((this.size * 10) * density);
    color.fill(ctx, col );
    color.stroke(ctx, col );
    var simplex = new SimplexNoise();


    for (var i=0; i<density; i++) {  // particles //

        ctx.globalAlpha = alpha;
        var x = Math.random() * this.width;
        var y = Math.random() * this.height;
        var fleck = scale * tombola.rangeFloat(1,2.5);
        var r = fleck * tombola.rangeFloat(0.2,0.8);
        //r = fleck * tombola.rangeFloat(6,10);


        // hairs //
        if (tombola.percent(0.2)) {
            var l = tombola.range(5,32);
            var xs = tombola.range(-fleck,fleck);
            var ys = tombola.range(-fleck,fleck);

            ctx.lineWidth = tombola.rangeFloat(scale * 0.3,scale * 1.2);
            ctx.beginPath();
            ctx.moveTo(x,y);
            for (var j=0; j<l; j++) {
                xs += tombola.rangeFloat(-r,r);
                ys += tombola.rangeFloat(-r,r);
                x += xs;
                y += ys;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // flecks //
        else if (tombola.percent(6)) {
            fleck = scale * tombola.rangeFloat(1.5,3);
            ctx.lineWidth = tombola.rangeFloat(scale * 0.75,scale * 2);
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x + tombola.range(-fleck,fleck), y + tombola.range(-fleck,fleck));
            ctx.stroke();
        }


        // grains //
        else if (tombola.percent(0.3)) {
            fleck = scale * tombola.rangeFloat(1.2,2);
            ctx.globalAlpha = tombola.rangeFloat(alpha/2,alpha);
            ctx.beginPath();
            ctx.arc(x,y,fleck,0,TAU);
            ctx.closePath();
            ctx.fill();
        }


        // specks //
        else {
            fleck = scale * tombola.rangeFloat(0.3,1.2);
            var nScale = density/20;
            var n = ((simplex.noise(x / nScale, y / nScale) + 1) / 2) + tombola.rangeFloat(-0.6,0.6);
            if (n > 1) n = 1;
            if (n < 0) n = 0;
            ctx.globalAlpha = n * alpha;
            ctx.fillRect(x, y, fleck, fleck);
        }
    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  GRAIN
//-------------------------------------------------------------------------------------------


proto.grain = function(scale,col,alpha) {
    var canvas = this.newCanvas();
    return this.drawGrain(canvas,scale,col,alpha);
};


proto.drawGrain = function(canvas,scale,col,alpha) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    var cells = Math.ceil( this.size );
    var r, g, b, a;
    r = g = b = a = 1;
    ctx.globalAlpha = alpha;

    for (var i=0; i<cells; i++) {  // columns //

        for (var j = 0; j < cells; j++) { // rows //

            color.fillRGBA(ctx, col.R * r, col.G * g, col.B * b, col.A * a );
            ctx.fillRect(i, j, 1, 1);
        }

    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  PAINT
//-------------------------------------------------------------------------------------------


proto.dirt = function(scale,col,alpha) {
    var canvas = this.newCanvas();
    return this.drawDirt(canvas,scale,col,alpha);
};


proto.drawDirt = function(canvas,scale,col,alpha) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    var simplex = new SimplexNoise();
    color.fill(ctx, col );


    var n = 500;
    var t = 1000;
    var r = 0.1 * scale;
    var s = 10 * scale;

    for (var i=0; i<n; i++) {  // particles //
        var p = new PaintParticle(tombola.range(0,this.size), tombola.range(0,this.size));


        for (var j=0; j<t; j++) {  // time //

            // draw //
            ctx.globalAlpha = 0.25 * alpha;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            // move //
            var xOff = simplex.noise(p.x / r, p.y / r) * s;
            var yOff = simplex.noise(p.x / r, -p.y / r) * s;
            p.move(xOff,yOff);

        }

    }


    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  PAINT
//-------------------------------------------------------------------------------------------


proto.paint = function(scale,col1,col2,col3,alpha,contrast,banding) {
    var canvas = this.newCanvas();
    return this.drawPaint(canvas,scale,col1,col2,col3,alpha,contrast,banding);
};



proto.drawPaint = function(ctx,scale,col1,col2,col3,contrast,banding) {

    // generate texture //
    var simplex = new SimplexNoise();
    var height = 135 * scale; // what is this?
    var realHeight = Math.ceil(this.height); // this is the worst, change these
    var width = Math.ceil(this.width);



    contrast *= 100;
    var cells = Math.ceil( this.width );
    var streakIndex = 0;
    var rowOffset = 0;


    // make scale relative to canvas size //
    scale = Math.max(width,realHeight)/(255 * ratio);
    var wobbleHeight = 15 * scale;
    var driftHeight = 130 * scale;

    banding = (banding || 0.8) * (scale/1);


    var pScale = banding/scale; // make adjustable
    scale *= 400;

    var rows = realHeight + (height * 2) + (wobbleHeight * 2) + (driftHeight * 2);
    for (var i=0; i<rows; i++) {  // rows //

        rowOffset += tombola.rangeFloat(-10,10);

        // progress vertical index for perlin //
        var sm = 0.6;
        streakIndex += tombola.rangeFloat(-0.05 * sm,0.05 * sm);
        if (tombola.percent(1.2 * pScale)) {
            streakIndex += tombola.rangeFloat(0.2 * sm,0.3 * sm);
        }

        else if (tombola.percent(0.7 * pScale)) {
            streakIndex += tombola.rangeFloat(1 * sm,2 * sm);
        }

        for (var j = 0; j < width; j++) { // columns //

            var y = simplex.noise(j / (scale * 1.5), i / (scale * 2.5));
            y *= height;

            var w = simplex.noise((j + 1000) / (scale /2), i / (scale /2));
            w *= wobbleHeight;
            var d = simplex.noise(2000, j / (scale * 2)) * driftHeight;


            // color value & contrast //
            var n = simplex.noise(streakIndex, (j + rowOffset) / (scale*2));

            if (n > 0) { n += ((1/100) * contrast); }
            else { n += ((-1/100) * contrast); }
            n = (n + 1) / 2;


            // set blended fill color //
            var fillCol;
            if (n > 0.5) {
                n = (n - 0.5) * 2;
                fillCol = color.blend2(col2, col3, n * 100);
            } else {
                n *= 2;
                fillCol = color.blend2(col1, col2, n * 100);
            }

            // draw //
            color.fill(ctx, fillCol );
            ctx.fillRect(j,i + y + w + d - height - wobbleHeight - driftHeight, 1, 50);
        }

    }


    // specks //
    if (tombola.percent(50)) {

        var clusterNo = tombola.weightedNumber([3,2,1,1]);
        var r = 12;
        scale /= 400;

        for (j=0; j<clusterNo; j++) {

            var speckNo = tombola.range(3,7);
            var cx = tombola.range(0,this.size);
            var cy = tombola.range(0,this.size);

            for (i = 0; i < speckNo; i++) {
                fillCol = color.blend2(col1, col2, tombola.range(0, 20));
                color.fill(ctx, fillCol);

                var s = tombola.rangeFloat(0.2 * scale, 1.1 * scale);
                if (tombola.percent(9)) {
                    s = tombola.rangeFloat(1.1 * scale, 2 * scale);
                }


                ctx.beginPath();
                ctx.arc(cx + tombola.range(-(r * 2.5), (r * 2.5)), cy + tombola.range(-r, r), s, 0, TAU);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
};



//-------------------------------------------------------------------------------------------
//  GRADIENT
//-------------------------------------------------------------------------------------------


proto.gradient = function(scale,col1,col2,col3,alpha,contrast) {
    var canvas = this.newCanvas();
    return this.drawGradient(canvas,scale,col1,col2,col3,alpha,contrast);
};



proto.drawGradient = function(canvas,scale,col1,col2,col3,alpha) {

    // set context //
    var ctx = canvas.ctx;


    // generate texture //
    var x1 = tombola.range(0,this.size);
    var x2 = tombola.range(0,this.size);
    var y1 = 0;
    var y2 = this.size;
    y1 = tombola.range(0,this.size);
    y2 = tombola.range(0,this.size);

    var range = pointDistance(x1,y1,x2,y2);
    var a1 = vectorAngle(x1,y1,x2,y2);

    var simplex = new SimplexNoise();
    scale *= 800;
    var cells = Math.ceil( this.size );
    ctx.globalAlpha = alpha;
    var r = 0.04;
    var perlin = 0.3;



    for (var i=0; i<cells; i++) {  // rows //



        for (var j = 0; j < cells; j++) { // columns //

            // interpolate //
            // use trig to get a linear position //
            var h = pointDistance(x1,y1,j,i);
            var a2 = vectorAngle(x1,y1,j,i);

            var a = a2 - a1;
            var o = Math.sin(-a) * h;
            var c = (TAU/4) + a;

            var ip = lastPoint(j,i,a1 - a + c,o);
            var ipa = vectorAngle(x1,y1,ip[0],ip[1]);
            if ((ipa - a1) > (TAU/4) || (ipa - a1) < -(TAU/4)) {
                ip[0] = x1;
                ip[1] = y1;
            }

            var distance = pointDistance(x1,y1,ip[0],ip[1]);
            var int = distance / range;
            if (int < 0) int = 0;
            if (int > 1) int = 1;
            var b = int;



            // add white noise //
            var n = tombola.rangeFloat(-r,r);
            b += n;


            // add simplex noise //
            var p = ((simplex.noise(j / (scale), i / (scale)) + 1) / 2) * perlin;
            p += (n * perlin);



            // set blended fill color //
            var fillCol = color.blend2(col1, col2, b * 100);
            fillCol = color.blend(fillCol,col3, p * 100);

            // draw //
            color.fill(ctx, fillCol );
            ctx.fillRect(j,i, 1, 1);
        }

    }


    /*color.stroke(ctx,textCol);
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();*/

    // return texture //
    return canvas.canvas;
};


//-------------------------------------------------------------------------------------------
//  EFFECTS
//-------------------------------------------------------------------------------------------

proto.fxDisplace = function(canvas,chance,amount,alpha) {

    // set context //
    var ctx = canvas.ctx;
    ctx.globalAlpha = alpha;


    // generate texture //
    var cells = Math.ceil( this.size );

    for (var i=0; i<cells; i++) {  // columns //

        for (var j=0; j<cells; j++) { // rows //

            if (tombola.percent(chance)) {
                var x = i + tombola.range(-amount,amount);
                var y = j + tombola.range(-amount,amount);

                if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
                    var p = ctx.getImageData(x, y, 1, 1).data;
                    //color.fillRGBA(ctx, p[0],p[1],p[2],1);
                    ctx.fillStyle = 'rgba('+p[0]+','+p[1]+','+p[2]+',255)';
                    ctx.fillRect(i,j,1,1);
                }
            }
        }
    }

    return canvas.canvas;
};


proto.fxNoise = function(canvas,amount,mode) {

    // set context //
    var ctx = canvas.ctx;
    ctx.globalAlpha = 1;


    // generate texture //
    var cells = Math.ceil( this.size );

    for (var i=0; i<cells; i++) {  // columns //

        for (var j=0; j<cells; j++) { // rows //

            var n, r, g, b;
            var p = ctx.getImageData(i, j, 1, 1).data;
            switch (mode) {
                default:
                case 0:
                    n = Math.round(tombola.range(-125,125) * amount);
                    ctx.fillStyle = 'rgba('+(p[0] + n)+','+(p[1] + n)+','+(p[2] + n)+',255)';
                    break;


                case 1:
                    n = 1 + (tombola.range(-1,1) * amount);
                    r = Math.round(p[0] * n);
                    g = Math.round(p[1] * n);
                    b = Math.round(p[2] * n);
                    if (r > 255) r = 255;
                    if (g > 255) g = 255;
                    if (b > 255) b = 255;
                    if (r < 0) r = 0;
                    if (g < 0) g = 0;
                    if (b < 0) b = 0;

                    ctx.fillStyle = 'rgba('+r+','+g+','+b+',255)';
                    break;


                case 2:
                    n = (255 - ((255 - p[0]) * amount)) / 255;
                    r = Math.round(p[0] * n);
                    n = (255 - ((255 - p[1]) * amount)) / 255;
                    g = Math.round(p[1] * n);
                    n = (255 - ((255 - p[2]) * amount)) / 255;
                    b = Math.round(p[2] * n);
                    if (r > 255) r = 255;
                    if (g > 255) g = 255;
                    if (b > 255) b = 255;
                    if (r < 0) r = 0;
                    if (g < 0) g = 0;
                    if (b < 0) b = 0;

                    ctx.fillStyle = 'rgba('+r+','+g+','+b+',255)';
                    //color.fillRGBA(ctx,r,g,b,1);
                    break;
            }

            ctx.fillRect(i,j,1,1);
        }
    }

    return canvas.canvas;
};


proto.fxGlitch = function(canvas,scale,amount,length,depth,angle) {

    // set context //
    var ctx = canvas.ctx;
    ctx.globalAlpha = 1;

    var canvas2 = this.newCanvas();
    var ctx2 = canvas2.ctx;
    //ctx2.globalAlpha = 0.1;

    // angle //
    if (angle==undefined || angle==null || angle!==angle) {
        angle = tombola.range(0,360);
    }
    var a = degToRad(angle);
    var v = vectorFromAngle(a);

    console.log(angle);
    console.log(v);

    var simplex = new SimplexNoise();
    scale *= 180;
    length *= this.size;

    var ts = 1;
    var x = tombola.range(0,this.size);
    var y = tombola.range(0,this.size);
    var xs = tombola.rangeFloat(-ts * v.y,ts * v.y);
    var ys = tombola.rangeFloat(-ts * v.x,ts * v.x);


    var tl = 20000 * amount;
    var l = Math.floor(50 * depth);

    for (var t=0; t<tl; t++) {  // time //

        // move origin //
        if (tombola.percent(0.2)) {
            x = tombola.range(0,this.size);
            y = tombola.range(0,this.size);
        }
        x += xs;
        y += ys;
        var acc = 0.2;
        xs += tombola.rangeFloat(-acc,acc);
        ys += tombola.rangeFloat(-acc,acc);

        // top speed //
        if (xs > ts) xs = ts;
        if (xs < -ts) xs = -ts;
        if (ys > ts) ys = ts;
        if (ys < -ts) ys = -ts;

        // boundaries //
        if (x > this.size || x < 0 || y > this.size || y < 0) {
            x = tombola.range(0,this.size);
            y = tombola.range(0,this.size);
        }


        // noise length //
        var n = length * tombola.rangeFloat(0.5,1);
        if (tombola.percent(10)) {
            n *= tombola.rangeFloat(1.15,2);
        }
        var s = (simplex.noise(x / (scale), 0 / (scale)) + 1) / 2;


        for (var i=0; i<=l; i++) {  // points //

            // point origin //
            var r = l;
            var m = (i/l);
            var xOff = tombola.range(-r,r);
            xOff = ((-l*2) * m) * v.x;
            var yOff = tombola.range(-r,r);
            yOff = ((-l*2) * m) * v.y;

            var px = x + xOff;
            var py = y + yOff;
            if (px < 0) px = 0;
            if (py < 0) py = 0;
            if (px >= this.size) px = this.size-1;
            if (py >= this.size) py = this.size-1;


            // get color at point //
            var p = ctx.getImageData(px, py, 1, 1).data;
            ctx2.strokeStyle = 'rgb(' + (p[0]) + ',' + (p[1]) + ',' + (p[2]) + ')';



            // draw //
            var mag = (n * s * s * (1-m));
            ctx2.lineWidth = tombola.rangeFloat(0.5,1.2);

            ctx2.beginPath();
            ctx2.moveTo(px,py);
            ctx2.lineTo(px + (v.x * mag), py + (v.y * mag));
            ctx2.stroke();

        }
    }

    ctx.drawImage(canvas2.canvas,0,0);

    return canvas.canvas;
};



proto.drawImage = function(canvas,src,callback) {

    // set context //
    var ctx = canvas.ctx;
    ctx.globalAlpha = 1;

    var img = new Image();
    var size = this.size;
    img.onload = function () {

        var w = img.width;
        var h = img.height;

        var mult = (Math.min(w,h) / size);

        ctx.drawImage(img, 0, 0, w/mult, h/mult);
        callback();
    };
    img.src = src;


    return canvas.canvas;
};

//-------------------------------------------------------------------------------------------
//  PARTICLE
//-------------------------------------------------------------------------------------------



function PaintParticle(x,y) {
    this.x = x;
    this.y = y;
    this.xs = 0;
    this.ys = 0;
    this.lx = x;
    this.ly = y;
    this.size = tombola.rangeFloat(0.3,1);
}
proto = PaintParticle.prototype;

proto.move = function(xs,ys) {
    this.lx = this.x;
    this.ly = this.y;
    this.x += xs;
    this.y += ys;
};

proto.accelerate = function(xs,ys) {
    this.xs = xs;
    this.ys = ys;
};


function pointDistance(x1,y1,x2,y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt( (a*a) + (b*b) );
}

function vectorAngle(x1,y1,x2,y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function vectorFromAngle(angle) {
    return new Vector(Math.cos(angle),Math.sin(angle));
}

function degToRad(deg) {
    return deg * (Math.PI/180);
}

function lastPoint(x, y, angle, length) {
    //length = typeof length !== 'undefined' ? length : 10;
    //angle = angle * Math.PI / 180; // if you're using degrees instead of radians
    return [length * Math.cos(angle) + x, length * Math.sin(angle) + y];
}




function waveShaper(input,amount,curve) {
    //curve = utils.arg(curve,0);
    var out = input;
    var t,s;

    switch (curve) {

        case 0:
            // hard mulispike peaks //
            var k = 2*amount/(1-amount);
            out = (1+k)*out/(1+k*Math.abs(out));
            break;


        case 1:
            // sine peaks //
            out = 1.5 * out - 0.5 * out * out * out;
            break;


        case 2:
            // stepped wave staggering (the Batman) //
            t = amount * sign(out);
            s = 1; // 1 = hard, 20 = soft
            out = out + ( (( (t + (1-t)) - (out * sign(out))) / s) * (out % t) ) ;
            break;


        case 3:
            // stepped screamer (Machu Picchu) //
            t = amount * sign(out);
            s = 1; // 1 = hard, 20 = soft
            out = out - ( (((t + (1-t)) - (out * sign(out))) / s) * (out % t) );
            break;


        case 4:
            // robotic //
            t = amount * sign(out);
            s = 8; // should prob stay around 8
            out = out - ( (((t + (1-t)) - (-out * sign(out))) / s) * (out % t) );
            break;


        case 5:
            // square peaks //
            t = amount * sign(out);
            s = 0.9; // 0 - 1
            out = out - ( ((out - t) / (2-s)) * (Math.abs(out) > amount) );
            var r = 1 - ((1-amount) / (2-s));
            out *= (r/(r*r));
            break;

    }

    return out;
}


function sign(x) {
    if (x > 0) { return 1; }
    else { return -1; }
}
