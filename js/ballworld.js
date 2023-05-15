var fps = 60
var obsps = 10
var mspf = 1000/obsps

if (!requestAnimationFrame) {
    requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, mspf - (currTime - lastTime));  //run twice as fast...
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    }
  
    cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  
  };

var requestId;

function stopAnim() {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  }
}

var worldWidth = 600;
var worldHeight = 400;

function drawWorld(world, canvas, emptyOcc) {
    ctx = canvas.getContext("2d")
    //background
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fill()
    // ball
    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.arc(world.pos[0], world.pos[1], world.rad, 0, 2*Math.PI)
    ctx.fill()
    // occluder
    ctx.fillStyle = 'grey'
    ctx.strokeStyle = 'grey'
    ctx.beginPath()
    var o = world.occ
    ctx.rect(o[0], o[1], o[2] - o[0], o[3] - o[1])
    if (emptyOcc) {
        ctx.stroke()
    } else {
        ctx.fill()
    }
}

var ballworld = {}

ballworld.initialize = function(position, radius, velocity, occluder) {
    var b_world = {}
    b_world.pos = position
    b_world.rad = radius
    b_world.vel = velocity
    b_world.occ = occluder

    b_world.vizocc = [
        occluder[0] + radius,
        occluder[1] + radius,
        occluder[2] - radius,
        occluder[3] - radius
    ]
    b_world.time = 0
    return b_world
}

ballworld.getPosition = function(world) {
    return world.pos
}

ballworld.getVelocity = function(world) {
    return world.vel
}

ballworld.copyWorld = function(world) {
    return JSON.parse(JSON.stringify(world))
}

ballworld.setPosition = function(world, position) {
    var newworld = ballworld.copyWorld(world)
    newworld.pos = position
    return newworld
}

ballworld.setVelocity = function(world, velocity) {
    var newworld = ballworld.copyWorld(world)
    newworld.vel = velocity
    return newworld
}

ballworld.getTime = function(world) {
    return world.time
}

ballworld.step = function(world, dt) {
    dt = typeof(dt) !== 'undefined' ? dt : 1/obsps
    var newpos = [
        world.pos[0] + world.vel[0] * dt,
        world.pos[1] + world.vel[1] * dt
    ]
    var newworld = ballworld.setPosition(world, newpos)
    newworld.time = world.time + dt
    return newworld
}


ballworld.isOccluded = function(world) {
    var p = world.pos
    return (p[0] >= world.vizocc[0] && p[0] <= world.vizocc[2] && 
        p[1] >= world.vizocc[1] && p[1] <= world.vizocc[3])
}

ballworld.isPosOccluded = function(world, pos) {
    return (pos[0] >= world.vizocc[0] && pos[0] <= world.vizocc[2] && 
        pos[1] >= world.vizocc[1] && pos[1] <= world.vizocc[3])
}

ballworld.observe = function(world) {
    var occ = ballworld.isOccluded(world)
    var pos
    if (occ) {
        pos = [-1, -1]
    } else {
        pos = world.pos
    }
    return {'isOccluded': occ, 'position': pos}
}

ballworld.animate = function(steps, world, emptyOcc) {
    emptyOcc = typeof(emptyOcc) !== 'undefined' ? emptyOcc : false
    function simulate(canvas, steps) {
        drawWorld(world, canvas[0], emptyOcc)
        function update(stepsSoFar) {
            stepsSoFar++;
            var currTime = new Date().getTime();
            requestId = requestAnimationFrame(function(time) {
                    update(stepsSoFar);});
            if (stepsSoFar < steps) {
                world = ballworld.step(world)
            }
            drawWorld(world, canvas[0], emptyOcc)
        }
        requestId = requestAnimationFrame(function() {update(0);});
    }
    
    var container = wpEditor.makeResultContainer();

    stopAnim(); //stop previous update thread..
    setTimeout(stopAnim, mspf); //make absolutely sure previous update thread is stopped
    var $physicsDiv = $("<div>").appendTo($(container));


    var $canvas = $("<canvas/>").appendTo($physicsDiv);
    $canvas.attr("width", worldWidth)
        .attr("style", "background-color:#333333;")
        .attr("height", worldHeight);

    $physicsDiv.append("<br/>");
    //var initializeStep = true;
    //simulate($canvas, 0, initializeStep);
    simulate($canvas, 0);
    //initializeStep = false;
    var $button = $("<button>Simulate</button>").appendTo($physicsDiv);
    $button.click(function() {
        //simulate($canvas, steps, initializeStep);

        stopAnim(); //stop previous update thread..
        simulate($canvas, steps);   
        //initializeStep = true;
    });
    var $clearButton = $("<button>Delete Animation Window</button>")
    $clearButton.appendTo($physicsDiv);
    $clearButton.click(function() {
        $physicsDiv.remove();
    });
}

ballworld.animateByPath = function(path, world, emptyOcc) {
    emptyOcc = typeof(emptyOcc) !== 'undefined' ? emptyOcc : false
    function simulate(canvas, path) {
        drawWorld(world, canvas[0], emptyOcc)
        function update(stepsSoFar) {
            stepsSoFar++;
            var currTime = new Date().getTime();
            requestId = requestAnimationFrame(function(time) {
                    update(stepsSoFar);});
            if (stepsSoFar < path.length) {
                world = ballworld.setPosition(world, path[stepsSoFar])
            }
            drawWorld(world, canvas[0], emptyOcc)
        }
        requestId = requestAnimationFrame(function() {update(0);});
    }
    
    var container = wpEditor.makeResultContainer();

    stopAnim(); //stop previous update thread..
    setTimeout(stopAnim, mspf); //make absolutely sure previous update thread is stopped
    var $physicsDiv = $("<div>").appendTo($(container));


    var $canvas = $("<canvas/>").appendTo($physicsDiv);
    $canvas.attr("width", worldWidth)
        .attr("style", "background-color:#333333;")
        .attr("height", worldHeight);

    $physicsDiv.append("<br/>");
    //var initializeStep = true;
    //simulate($canvas, 0, initializeStep);
    simulate($canvas, []);
    //initializeStep = false;
    var $button = $("<button>Simulate</button>").appendTo($physicsDiv);
    $button.click(function() {
        //simulate($canvas, steps, initializeStep);

        stopAnim(); //stop previous update thread..
        simulate($canvas, path);   
        //initializeStep = true;
    });
    var $clearButton = $("<button>Delete Animation Window</button>")
    $clearButton.appendTo($physicsDiv);
    $clearButton.click(function() {
        $physicsDiv.remove();
    });
}

ballworld.animateObservation = function(observation, world, emptyOcc) {
    emptyOcc = typeof(emptyOcc) !== 'undefined' ? emptyOcc : false
    function simulate(canvas, observation) {
        drawWorld(world, canvas[0], emptyOcc)
        function update(stepsSoFar) {
            stepsSoFar++;
            var currTime = new Date().getTime();
            requestId = requestAnimationFrame(function(time) {
                    update(stepsSoFar);});
            if (stepsSoFar < observation.length) {
                var obs = observation[stepsSoFar]
                if (obs['isOccluded']) {
                    world = ballworld.setPosition(world, [-100, -100])
                } else {
                    world = ballworld.setPosition(world, observation[stepsSoFar]['position'])
                }
                
            }
            drawWorld(world, canvas[0], emptyOcc)
        }
        requestId = requestAnimationFrame(function() {update(0);});
    }
    
    var container = wpEditor.makeResultContainer();

    stopAnim(); //stop previous update thread..
    setTimeout(stopAnim, mspf); //make absolutely sure previous update thread is stopped
    var $physicsDiv = $("<div>").appendTo($(container));


    var $canvas = $("<canvas/>").appendTo($physicsDiv);
    $canvas.attr("width", worldWidth)
        .attr("style", "background-color:#333333;")
        .attr("height", worldHeight);

    $physicsDiv.append("<br/>");
    //var initializeStep = true;
    //simulate($canvas, 0, initializeStep);
    simulate($canvas, []);
    //initializeStep = false;
    //drawWorld(world, $canvas[0], emptyOcc)
    var $button = $("<button>Simulate</button>").appendTo($physicsDiv);
    $button.click(function() {
        //simulate($canvas, steps, initializeStep);

        stopAnim(); //stop previous update thread..
        simulate($canvas, observation);   
        //initializeStep = true;
    });
    var $clearButton = $("<button>Delete Animation Window</button>")
    $clearButton.appendTo($physicsDiv);
    $clearButton.click(function() {
        $physicsDiv.remove();
    });
}

ballworld.paths = {}
// Straight line
ballworld.paths['path1'] = [{"isOccluded":false,"position":[58,200]},{"isOccluded":false,"position":[66,200]},{"isOccluded":false,"position":[74,200]},{"isOccluded":false,"position":[82,200]},{"isOccluded":false,"position":[90,200]},{"isOccluded":false,"position":[98,200]},{"isOccluded":false,"position":[106,200]},{"isOccluded":false,"position":[114,200]},{"isOccluded":false,"position":[122,200]},{"isOccluded":false,"position":[130,200]},{"isOccluded":false,"position":[138,200]},{"isOccluded":false,"position":[146,200]},{"isOccluded":false,"position":[154,200]},{"isOccluded":false,"position":[162,200]},{"isOccluded":false,"position":[170,200]},{"isOccluded":false,"position":[178,200]},{"isOccluded":false,"position":[186,200]},{"isOccluded":false,"position":[194,200]},{"isOccluded":false,"position":[202,200]},{"isOccluded":false,"position":[210,200]},{"isOccluded":false,"position":[218,200]},{"isOccluded":false,"position":[226,200]},{"isOccluded":false,"position":[234,200]},{"isOccluded":false,"position":[242,200]},{"isOccluded":false,"position":[250,200]},{"isOccluded":false,"position":[258,200]},{"isOccluded":false,"position":[266,200]},{"isOccluded":false,"position":[274,200]},{"isOccluded":false,"position":[282,200]},{"isOccluded":false,"position":[290,200]},{"isOccluded":false,"position":[298,200]},{"isOccluded":false,"position":[306,200]},{"isOccluded":false,"position":[314,200]},{"isOccluded":false,"position":[322,200]},{"isOccluded":false,"position":[330,200]},{"isOccluded":false,"position":[338,200]},{"isOccluded":false,"position":[346,200]},{"isOccluded":false,"position":[354,200]},{"isOccluded":false,"position":[362,200]},{"isOccluded":false,"position":[370,200]},{"isOccluded":false,"position":[378,200]},{"isOccluded":false,"position":[386,200]},{"isOccluded":false,"position":[394,200]},{"isOccluded":false,"position":[402,200]},{"isOccluded":false,"position":[410,200]},{"isOccluded":false,"position":[418,200]},{"isOccluded":false,"position":[426,200]},{"isOccluded":false,"position":[434,200]},{"isOccluded":false,"position":[442,200]},{"isOccluded":false,"position":[450,200]},{"isOccluded":false,"position":[458,200]},{"isOccluded":false,"position":[466,200]},{"isOccluded":false,"position":[474,200]},{"isOccluded":false,"position":[482,200]},{"isOccluded":false,"position":[490,200]},{"isOccluded":false,"position":[498,200]},{"isOccluded":false,"position":[506,200]},{"isOccluded":false,"position":[514,200]},{"isOccluded":false,"position":[522,200]},{"isOccluded":false,"position":[530,200]},{"isOccluded":false,"position":[538,200]},{"isOccluded":false,"position":[546,200]}]
// Change direction
ballworld.paths['path2'] =  [{"isOccluded":false,"position":[58,200]},{"isOccluded":false,"position":[66,200]},{"isOccluded":false,"position":[74,200]},{"isOccluded":false,"position":[82,200]},{"isOccluded":false,"position":[90,200]},{"isOccluded":false,"position":[98,200]},{"isOccluded":false,"position":[106,200]},{"isOccluded":false,"position":[114,200]},{"isOccluded":false,"position":[122,200]},{"isOccluded":false,"position":[130,200]},{"isOccluded":false,"position":[138,200]},{"isOccluded":false,"position":[146,200]},{"isOccluded":false,"position":[154,200]},{"isOccluded":false,"position":[162,200]},{"isOccluded":false,"position":[170,200]},{"isOccluded":false,"position":[178,200]},{"isOccluded":false,"position":[186,200]},{"isOccluded":false,"position":[194,200]},{"isOccluded":false,"position":[202,200]},{"isOccluded":false,"position":[210,200]},{"isOccluded":false,"position":[218,200]},{"isOccluded":false,"position":[224,204]},{"isOccluded":false,"position":[230,208]},{"isOccluded":false,"position":[236,212]},{"isOccluded":false,"position":[242,216]},{"isOccluded":false,"position":[248,220]},{"isOccluded":false,"position":[254,224]},{"isOccluded":false,"position":[260,228]},{"isOccluded":false,"position":[266,232]},{"isOccluded":false,"position":[272,236]},{"isOccluded":false,"position":[278,240]},{"isOccluded":false,"position":[284,244]},{"isOccluded":false,"position":[290,248]},{"isOccluded":false,"position":[296,252]},{"isOccluded":false,"position":[302,256]},{"isOccluded":false,"position":[308,260]},{"isOccluded":false,"position":[314,264]},{"isOccluded":false,"position":[320,268]},{"isOccluded":false,"position":[326,272]},{"isOccluded":false,"position":[332,276]},{"isOccluded":false,"position":[338,280]},{"isOccluded":false,"position":[344,284]},{"isOccluded":false,"position":[350,288]},{"isOccluded":false,"position":[356,292]},{"isOccluded":false,"position":[362,296]},{"isOccluded":false,"position":[368,300]},{"isOccluded":false,"position":[374,304]},{"isOccluded":false,"position":[380,308]},{"isOccluded":false,"position":[386,312]},{"isOccluded":false,"position":[392,316]},{"isOccluded":false,"position":[398,320]},{"isOccluded":false,"position":[404,324]},{"isOccluded":false,"position":[410,328]},{"isOccluded":false,"position":[416,332]},{"isOccluded":false,"position":[422,336]},{"isOccluded":false,"position":[428,340]},{"isOccluded":false,"position":[434,344]},{"isOccluded":false,"position":[440,348]},{"isOccluded":false,"position":[446,352]},{"isOccluded":false,"position":[452,356]},{"isOccluded":false,"position":[458,360]},{"isOccluded":false,"position":[464,364]}]
// Occluded straight line
ballworld.paths['path3'] = [{"isOccluded":false,"position":[58,200]},{"isOccluded":false,"position":[66,200]},{"isOccluded":false,"position":[74,200]},{"isOccluded":false,"position":[82,200]},{"isOccluded":false,"position":[90,200]},{"isOccluded":false,"position":[98,200]},{"isOccluded":false,"position":[106,200]},{"isOccluded":false,"position":[114,200]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":false,"position":[386,200]},{"isOccluded":false,"position":[394,200]},{"isOccluded":false,"position":[402,200]},{"isOccluded":false,"position":[410,200]},{"isOccluded":false,"position":[418,200]},{"isOccluded":false,"position":[426,200]},{"isOccluded":false,"position":[434,200]},{"isOccluded":false,"position":[442,200]},{"isOccluded":false,"position":[450,200]},{"isOccluded":false,"position":[458,200]},{"isOccluded":false,"position":[466,200]},{"isOccluded":false,"position":[474,200]},{"isOccluded":false,"position":[482,200]},{"isOccluded":false,"position":[490,200]},{"isOccluded":false,"position":[498,200]},{"isOccluded":false,"position":[506,200]},{"isOccluded":false,"position":[514,200]},{"isOccluded":false,"position":[522,200]},{"isOccluded":false,"position":[530,200]},{"isOccluded":false,"position":[538,200]},{"isOccluded":false,"position":[546,200]}]
// Occluded change
ballworld.paths['path4'] = [{"isOccluded":false,"position":[58,200]},{"isOccluded":false,"position":[66,200]},{"isOccluded":false,"position":[74,200]},{"isOccluded":false,"position":[82,200]},{"isOccluded":false,"position":[90,200]},{"isOccluded":false,"position":[98,200]},{"isOccluded":false,"position":[106,200]},{"isOccluded":false,"position":[114,200]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":false,"position":[328,116]},{"isOccluded":false,"position":[333,110]},{"isOccluded":false,"position":[338,104]},{"isOccluded":false,"position":[343,98]},{"isOccluded":false,"position":[348,92]},{"isOccluded":false,"position":[353,86]},{"isOccluded":false,"position":[358,80]},{"isOccluded":false,"position":[363,74]},{"isOccluded":false,"position":[368,68]},{"isOccluded":false,"position":[373,62]},{"isOccluded":false,"position":[378,56]},{"isOccluded":false,"position":[383,50]},{"isOccluded":false,"position":[388,44]},{"isOccluded":false,"position":[393,38]},{"isOccluded":false,"position":[398,32]},{"isOccluded":false,"position":[403,26]},{"isOccluded":false,"position":[408,20]},{"isOccluded":false,"position":[413,14]},{"isOccluded":false,"position":[418,8]},{"isOccluded":false,"position":[423,2]},{"isOccluded":false,"position":[428,-4]},{"isOccluded":false,"position":[433,-10]},{"isOccluded":false,"position":[438,-16]}]
// Occluded stop
ballworld.paths['path5'] = [{"isOccluded":false,"position":[58,200]},{"isOccluded":false,"position":[66,200]},{"isOccluded":false,"position":[74,200]},{"isOccluded":false,"position":[82,200]},{"isOccluded":false,"position":[90,200]},{"isOccluded":false,"position":[98,200]},{"isOccluded":false,"position":[106,200]},{"isOccluded":false,"position":[114,200]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]},{"isOccluded":true,"position":[-1,-1]}]

ballworld.worlds = {
    'clear': ballworld.initialize([50, 200], 20, [80, 0], [-10, -10, -5, -5]),
    'occluded': ballworld.initialize([50, 200], 20, [80, 0], [100, 100, 400, 300])
}