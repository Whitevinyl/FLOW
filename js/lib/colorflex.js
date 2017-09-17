//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------


//var RGBA = require('./rgba');

function Color() {
    this.master = new RGBA(0,0,0,0);
    this.highPass = new RGBA(0,0,0,0);
    this.lowPass = new RGBA(0,0,0,0);
}
var color = new Color();



//-------------------------------------------------------------------------------------------
//  PUBLIC FUNCTIONS
//-------------------------------------------------------------------------------------------

Color.prototype.fill = function(ctx,col) {
    ctx.fillStyle = this.processRGBA(col);
};

Color.prototype.stroke = function(ctx,col) {
    ctx.strokeStyle = this.processRGBA(col);
};

Color.prototype.fillRGBA = function(ctx,r,g,b,a) {
    ctx.fillStyle = this.processRGBA(new RGBA(r,g,b,a));
};

Color.prototype.strokeRGBA = function(ctx,r,g,b,a) {
    ctx.strokeStyle = this.processRGBA(new RGBA(r,g,b,a));
};

Color.prototype.string = function(col) {
    return this.processRGBA(col);
};

Color.prototype.stringRGBA = function(r,g,b,a) {
    return this.processRGBA(new RGBA(r,g,b,a));
};

Color.prototype.blend = function(col1,col2,percent) {
    var r = col1.R + Math.round((col2.R - col1.R) * (percent/100));
    var g = col1.G + Math.round((col2.G - col1.G) * (percent/100));
    var b = col1.B + Math.round((col2.B - col1.B) * (percent/100));
    var a = col1.A + ((col2.A - col1.A) * (percent/100));
    return new RGBA(r,g,b,a);
};

Color.prototype.blend2 = function(col1,col2,percent) {
    var p = percent/100;
    var r = Math.floor(col1.R * (1-p)) + Math.ceil(col2.R * p);
    var g = Math.floor(col1.G * (1-p)) + Math.ceil(col2.G * p);
    var b = Math.floor(col1.B * (1-p)) + Math.ceil(col2.B * p);
    var a = (col1.A * (1-p)) + (col2.A * p);
    return new RGBA(r,g,b,a);
};

Color.prototype.darkerColor = function(col,darkness) {
    var r = this.valueInRange(col.R - darkness,0,255);
    var g = this.valueInRange(col.G - darkness,0,255);
    var b = this.valueInRange(col.B - darkness,0,255);
    return new RGBA(r,g,b,col.A);
};

Color.prototype.lighterColor = function(col,lightness) {
    var r = this.valueInRange(col.R + lightness,0,255);
    var g = this.valueInRange(col.G + lightness,0,255);
    var b = this.valueInRange(col.B + lightness,0,255);
    return new RGBA(r,g,b,col.A);
};

//-------------------------------------------------------------------------------------------
//  PROCESSING / NORMALISING
//-------------------------------------------------------------------------------------------


// PASS R G B A //
Color.prototype.processRGBA = function(col,object) {

    // master color filter //
    var red = Math.round(col.R + this.master.R);
    var green = Math.round(col.G + this.master.G);
    var blue = Math.round(col.B + this.master.B);
    var alpha = col.A + this.master.A;

    // high & low pass color filters //
    var av = ((red + green + blue) / 3);
    var hp = av/255;
    var lp = 1 - (av/255);
    red += Math.round((this.highPass.R*hp) + (this.lowPass.R*lp));
    green += Math.round((this.highPass.G*hp) + (this.lowPass.G*lp));
    blue += Math.round((this.highPass.B*hp) + (this.lowPass.B*lp));


    // RANGE //
    red = this.valueInRange(red,0,255);
    green = this.valueInRange(green,0,255);
    blue = this.valueInRange(blue,0,255);
    alpha = this.valueInRange(alpha,0,1);

    if (object) {
        return new RGBA(red,green,blue,alpha);
    } else {
        // set to string //
        return this.buildColour(red,green,blue,alpha);
    }

};


Color.prototype.buildColour = function(red,green,blue,alpha) {
    return "rgba("+red+","+green+","+blue+","+alpha+")";
};


//-------------------------------------------------------------------------------------------
//  MATHS
//-------------------------------------------------------------------------------------------


Color.prototype.valueInRange = function(value,floor,ceiling) {
    if (value < floor) {
        value = floor;
    }
    if (value> ceiling) {
        value = ceiling;
    }
    return value;
};

Color.prototype.getLuminosity = function(col) {
    return ((0.299*col.R + 0.587*col.G + 0.114*col.B));
};

//-------------------------------------------------------------------------------------------
//  RGBA
//-------------------------------------------------------------------------------------------

function RGBA( r, g, b, a ) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = a;
}
RGBA.prototype.clone = function() {
    return new RGBA(this.R,this.G,this.B,this.A);
};

//module.exports = Color;
