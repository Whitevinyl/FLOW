
function canvasNoise(w, h, pixelRatio, alpha, element) {
    var cvs = document.createElement('canvas');
    var ct = cvs.getContext('2d');

    var rw = w * pixelRatio;
    var rh = h * pixelRatio;
    cvs.width = rw;
    cvs.height = rh;

    alpha *= pixelRatio;


    for (var j=0; j<rh; j++) { // rows
        for (var i=0; i<rw; i++) { // columns
            var n = Math.round(Math.random() * 255);
            n = Math.round(Math.random()) * 255;
            var a = Math.random();
            ct.fillStyle = 'rgba(' + n + ',' + n + ',' + n + ',' + a + ')';
            ct.globalAlpha = alpha;
            ct.fillRect(i, j, 1, 1);
        }
    }

    var data = cvs.toDataURL();
    var el = document.getElementById(element);
    el.style.backgroundImage = 'url(' + data + ')';
    el.style.backgroundSize = '' + w + 'px ' + h + 'px';

    //document.removeChild(cvs);
}
