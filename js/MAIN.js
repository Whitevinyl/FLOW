

// INIT //
var canvas;
var ctx;
var stats;

// METRICS //
var width = 0;
var height = 0;
var ratio = 1;
var TAU = 2 * Math.PI;


// INTERACTION //
var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;

// TEXTURE //
var textureCol = [new RGBA(0,32,185,1),new RGBA(235,98,216,1),new RGBA(10,200,200,1),new RGBA(255,245,235,1),new RGBA(5,5,5,1),new RGBA(255,160,180,1),new RGBA(255,170,170,1),new RGBA(255,140,90,1),new RGBA(245,25,35,1),new RGBA(10,10,70,1),new RGBA(255,80,100,1),new RGBA(70,0,80,1),new RGBA(120,235,200,1),new RGBA(160,150,170,1),new RGBA(220,20,80,1),new RGBA(210,150,120,1)];
var textureCol2 = [new RGBA(0,0,40,1),new RGBA(0,52,65,1),new RGBA(255,230,140,1),new RGBA(255,80,100,1),new RGBA(255,180,210,1)];
var lastPalette = 0;
var paint;
var imgData;

var addNoise = false;

// 3 white/cream
// 4 dark
// 5 // light pink bubblegum
// 6 // light pink cream
// 7 gold cream
// 8 red
// 9 dark purple
// 10 pink
// 11 purple
// 12 turquoise
// 13 grey
// 14 magenta
// 15 yellow cream

color.lowPass = new RGBA(50,45,25,0);


var palettes = [

    [textureCol2[0], textureCol[10], textureCol2[1]], // dark > pink > grey/green
    [textureCol2[0], textureCol2[3], textureCol[15]], // flesh > gold
    [textureCol2[0], textureCol2[1], textureCol2[2]], // dark green > yellow
    //[textureCol2[0], textureCol[11], textureCol2[2]], // purple > yellow * do i actually like this
    [textureCol[4], textureCol2[1], textureCol[10]], // petrel > pink
    [textureCol[4], textureCol[9], textureCol[11]], // dark > purple
    [textureCol[4], textureCol2[0], textureCol[11]], // extra dark > purple
    [textureCol[4], textureCol[11], textureCol[12]], // purple > turquoise
    [textureCol2[1], textureCol[14], textureCol[10]], // dark > red
    [textureCol[9], textureCol[10], textureCol[12]], // dark purple > flesh  > turquoise
    //[textureCol2[0], textureCol[10], textureCol[12]], // dark > flesh > turquoise * might be bit much
    [textureCol2[1], textureCol[10], textureCol[12]], // dark > flesh > turquoise
    [textureCol[4], textureCol[9], textureCol[14]], // dark purple > magenta
    [textureCol[4], textureCol[9], textureCol[12]], // dark > turquoise
    [textureCol[4], textureCol[9], textureCol[8]], // dark purple > red
    [textureCol2[0], textureCol2[3], textureCol[6]], // pinks
    [textureCol[4], textureCol2[0], textureCol2[3]], // very dark > pink
    [textureCol[4], textureCol2[0], textureCol[7]], // dark > gold
    [textureCol[4], textureCol[9], textureCol[7]], // dark blue > gold
    [textureCol2[0], textureCol2[1], textureCol[10]], // dark blue/green > pink
    [textureCol[4], textureCol2[1], textureCol[14]], // dark green > magenta
    [textureCol2[0], textureCol[13], textureCol[5]], // grey > pink marble
    [textureCol[10], textureCol[13], textureCol[5]], // pink > grey > pink flamingo
    [textureCol2[1], textureCol[13], textureCol[10]], // grey green > coral
    [textureCol[3], textureCol[13], textureCol[10]], // white grey > pink * not sure
    [textureCol[3], textureCol[13], textureCol[9]],  // white grey > dark purple
    [textureCol[4], textureCol[9], textureCol2[1]],  // dark green > blue
    [textureCol[3], textureCol2[0], textureCol[4]],  // white > dark
    //[textureCol[3], textureCol[7], textureCol2[0]],  // white > caramel > dark * not sure
    [textureCol2[0], textureCol2[1], textureCol[7]], // dark green > gold
    //[textureCol[4], textureCol2[1], textureCol[7]], // dark green > gold 2 **
    [textureCol2[0], textureCol[9], textureCol[5]], // navy > bubblegum pink
    [textureCol[6], textureCol[13], textureCol[10]], // pale pink > grey coral
    [textureCol[4], textureCol2[0], textureCol[15]], // dark > cream
    [textureCol[4], textureCol[9], textureCol[13]], // dark blue > pale grey
    [textureCol[4], textureCol[9], textureCol[6]], // dark blue > pale pink
    [textureCol[4], textureCol[9], textureCol[10]], // dark blue > coral pink
    [textureCol2[0], textureCol[0], textureCol[5]], // electric blue > bubblegum
    [textureCol[0], textureCol2[0], textureCol[4]] // dark > electric blue
];




//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------

function init() {

    // SETUP CANVAS //
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    // SET CANVAS & DRAWING POSITIONS //
    metrics();

    // INTERACTION //
    setupInteraction();

    // STATS //
    //initStats();

    // GENERATE NOISE LAYER //
    canvasNoise(200, 200, ratio, 0.025, 'noiseLayer');

    // CSS TRANSITION IN //
    var overlay = document.getElementById('overlay');
    overlay.style.top = '0';
    overlay.style.opacity = '1';

    setTimeout(function() {
        // INIT PAINT //
        resetPaint();

        // START LOOP //
        loop();
    }, 1000);
}

function resetPaint() {

    // choose palette and store memory to prevent repetition //
    var ind = lastPalette;
    while (ind === lastPalette) {
        ind = tombola.range(0, palettes.length - 1);
    }
    var p = palettes[ind];
    lastPalette = ind;
    console.log(ind);

    // p[0], p[1], p[2]
    paint = new Paint(ctx, width, height, tombola.rangeFloat(0.6, 2), p[0], p[1], p[2], 0.05, 0.3);
}


function initStats() {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
}


//-------------------------------------------------------------------------------------------
//  MAIN LOOP
//-------------------------------------------------------------------------------------------


function loop() {
    if (stats) stats.begin();
    update();
    draw();
    if (stats) stats.end();
    requestAnimationFrame(loop);
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

function update() {

}


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------

function draw() {

    paint.draw(4);
}



function Paint(ctx,width,height,scale,col1,col2,col3,contrast,banding) {

    this.i = -1;
    this.j = 0;
    this.completeCols = [];


    this.ctx = ctx;
    this.col1 = col1;
    this.col2 = col2;
    this.col3 = col3;

    this.noiseLevel = 4 * ratio;
    //this.noiseLevel = 255 * ratio;

    this.thickness = 3;

    // generate texture //
    this.simplex = new SimplexNoise();
    this.rowHeight = 135 * scale;
    this.height = Math.ceil(height);
    this.width = Math.ceil(width);


    this.contrast = contrast * 100;
    this.cells = this.width; // necessary?
    this.streakIndex = 0;
    this.rowOffset = 0;


    // make scale relative to canvas size //
    scale *= (Math.max(this.width,this.height)/(255 * ratio));
    this.wobbleHeight = tombola.rangeFloat(17,26) * scale;
    this.driftHeight = 140 * scale;

    // total offset potential //
    this.vertOffset = (this.rowHeight + this.wobbleHeight + this.driftHeight);

    this.banding = (banding || 0.8) * (scale/1);
    this.pScale = this.banding/scale; // scale of chance percentage, color shift
    this.scale = scale * 400;

    // perlin scales //
    this.heightX = this.scale * 1.5;
    this.heightY = this.scale * 2;
    this.wobbleX = this.scale / 2;
    this.wobbleY = this.scale / 1.5;
    this.driftY = this.scale * 1.6;
    this.colorY = this.scale * 2;

    this.rows = this.height + (this.vertOffset * 2);
    this._newRow();
}


Paint.prototype.draw = function(speed) {

    // if there are rows to be drawn //
    if (this.i < this.rows) {
        var ctx = this.ctx;

        // loop through rows * speed //
        var l = this.width * speed;
        for (var h=0; h<l; h++) {

            // perlin noise offset //
            var y = this.simplex.noise(this.j / this.heightX, this.i / this.heightY) * this.rowHeight;
            var w = this.simplex.noise((this.j + 1000) / this.wobbleX, this.i / this.wobbleY) * this.wobbleHeight;
            var d = this.simplex.noise(2000, this.j / this.driftY) * this.driftHeight;
            var pos = this.i - this.vertOffset + (y + w + d);

            // don't render above screen //
            if ((pos + this.thickness) < 0)  {
                this._proceed();
                h--;
                continue;
            }

            // exit draw loop when screen is filled //
            if (this.completeCols.length >= (this.width-2)) {
                this.specks();
                this.i = this.rows;
                setTimeout(function() {
                    resetPaint();
                }, 800);
                return;
            }

            // strike off complete filled columns //
            if (pos >= height)  {
                if (this.completeCols.indexOf(this.j) === -1) {
                    this.completeCols.push(this.j);
                }
                this._proceed();
                continue;
            }

            // color value & contrast //
            var n = this.simplex.noise(this.streakIndex, (this.j + this.rowOffset) / this.colorY);
            n += (Math.sign(n) * 0.01 * this.contrast);
            n = (n + 1) / 2; // normalise to range 0 - 1;

            // set blended fill color //
            var fillCol;
            if (n > 0.5) {
                n = (n - 0.5) * 2;
                fillCol = color.blend2(this.col2, this.col3, n * 100);
            } else {
                n *= 2;
                fillCol = color.blend2(this.col1, this.col2, n * 100);
            }

            // add noise to color //
            if (addNoise) {
                var noise = tombola.rangeFloat(-this.noiseLevel,this.noiseLevel);
                fillCol.R += noise;
                fillCol.G += noise;
                fillCol.B += noise;
            }


            // draw //
            color.fill(ctx, fillCol );
            ctx.fillRect(this.j,pos, 1, this.thickness);

            // done //
            this._proceed();
        }

    }
};

Paint.prototype._proceed = function() {
    this.j ++;
    if (this.j >= this.width) {
        this._newRow();
    }
}

Paint.prototype._newRow = function() {
    this.i ++;
    this.j = 0;

    // progress perlin horizontal index for color //
    this.rowOffset += tombola.rangeFloat(-10,10);

    // progress perlin vertical index for color //
    var sm = 0.6;
    this.streakIndex += tombola.rangeFloat(-0.05 * sm,0.05 * sm);
    if (tombola.percent(1.2 * this.pScale)) {
        this.streakIndex += tombola.rangeFloat(0.2 * sm,0.3 * sm); // larger jump
    }
    else if (tombola.percent(0.7 * this.pScale)) {
        this.streakIndex += tombola.rangeFloat(1 * sm,2 * sm); // larger still
    }
};

Paint.prototype.specks = function() {

    // specks //
    if (tombola.percent(40)) {

        // number of clusters //
        var clusterNo = tombola.weightedNumber([3,2,1,1]);

        // scale //
        var sc = this.scale/(1040/ratio);
        var maxSize = 1.1;

        // color //
        fillCol = color.blend2(this.col1, this.col2, tombola.range(0, 50));
        color.fill(ctx, fillCol);

        // for each cluster of specks //
        for (j=0; j<clusterNo; j++) {

            // number of specks //
            var speckNo = tombola.range(5,11);

            // origin of cluster //
            var cx = tombola.range(0,this.cells);
            var cy = tombola.range(this.vertOffset,this.rows - this.vertOffset);

            // for each speck within this cluster //
            for (i = 0; i < speckNo; i++) {

                // size //
                var s = tombola.rangeFloat(0.1 * sc, 0.6 * sc);
                if (tombola.percent(10)) s = tombola.rangeFloat(0.6 * sc, 0.9 * sc);
                if (tombola.percent(2)) s = tombola.rangeFloat(0.9 * sc, maxSize * sc);


                // location //
                var sm = (maxSize * sc) / s;
                var w = 23 * sm;
                var h = 4 * sm;
                var sx = cx + tombola.range(-w, w);
                var sy = cy + tombola.range(-h, h);

                // perlin offset matrix //
                var y = this.simplex.noise(sx / this.heightX, sy / this.heightY) * this.rowHeight;
                var w = this.simplex.noise((sx + 1000) / this.wobbleX, sy / this.wobbleY) * this.wobbleHeight;
                var d = this.simplex.noise(2000, sx / this.driftY) * this.driftHeight;
                sy += (y + w + d) - this.vertOffset;

                ctx.beginPath();
                ctx.arc(sx, sy, s, 0, TAU);
                ctx.fill();
            }
        }
    }
};
