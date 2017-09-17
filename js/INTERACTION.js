


//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

function setupInteraction() {

    // ADD INTERACTION EVENTS TO THE CANVAS //
    canvas.addEventListener("mousedown", mousePress, false);
    canvas.addEventListener("mouseup", mouseRelease, false);
    canvas.addEventListener("mousemove", mouseMove, false);
}


//-------------------------------------------------------------------------------------------
//  MOUSE EVENTS
//-------------------------------------------------------------------------------------------


// PRESS //
function mousePress() {
    mouseIsDown = true;
    rolloverCheck();
    resetPaint();
}


// RELEASE //
function mouseRelease() {
    mouseIsDown = false;
}


// MOVE //
function mouseMove(event) {
    mouseX = event.pageX * ratio;
    mouseY = event.pageY * ratio;
    rolloverCheck();
}


function rolloverCheck() {
    var test = hitBox(0, 0, width, height);
}
