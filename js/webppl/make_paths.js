// CODE TO MAKE THE PATHS

var occworld = ballworld.worlds['occluded']
var clearworld = ballworld.worlds['clear']


var makeObs = function(initworld, stepchange, newvel) {
    var doStep = function(stepn, world, maxstep) {
      var newworld = ballworld.step(world)
      if (stepn >= maxstep) {
        return [newworld, [ballworld.observe(newworld)]]
      } else {
        var r = doStep(stepn + 1, newworld, maxstep)
        return [r[0], [ballworld.observe(newworld)].concat(r[1])]
      }
    }
    var part1 = doStep(0, initworld, stepchange)
    var midworld = ballworld.setVelocity(part1[0], newvel)
    var part2 = doStep(0, midworld, 60-stepchange)
    var obs = part1[1].concat(part2[1])
    return obs
  }

  var makeObs4 = function() {
    var doStep = function(stepn, world, maxstep) {
      var newworld = ballworld.step(world)
      if (stepn >= maxstep) {
        return [newworld, [ballworld.observe(newworld)]]
      } else {
        var r = doStep(stepn + 1, newworld, maxstep)
        return [r[0], [ballworld.observe(newworld)].concat(r[1])]
      }
    }
    var part1 = doStep(0, occworld, 25)
    var midworld = ballworld.setVelocity(part1[0], [0,0])
    var part2 = doStep(0, midworld, 25)
    var finworld = ballworld.initialize(ballworld.getPosition(midworld),
                                        20, [0,0], [-10, -10, -5, -5])
    var part3 = doStep(0, finworld, 10)
    var obs = part1[1].concat(part2[1]).concat(part3[1])
    return obs
  }
  

var p1 = makeObs(clearworld, 0, [80, 0])
var p2a = makeObs(clearworld, 20, [60, 40])
var p2b = makeObs(clearworld, 22, [75, 15])
var p3a = makeObs(occworld, 0, [80, 0])
var p3b = makeObs(occworld, 25, [50, -60])
var p3c = makeObs(occworld, 22, [90, -24])
var p3d = makeObs(occworld, 25, [0,0])
var p3e = makeObs(occworld, 28, [78, 4])
var p4 = makeObs4()