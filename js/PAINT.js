
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
                var noiseLvl = tombola.rangeFloat(-this.noiseLevel,this.noiseLevel);
                fillCol.R += noiseLvl;
                fillCol.G += noiseLvl;
                fillCol.B += noiseLvl;
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
