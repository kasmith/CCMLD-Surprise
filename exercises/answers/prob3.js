var world = ballworld.worlds['occluded']
var obs = ballworld.paths['path3a']
var nsteps = obs.length-1

// These variables will be helpful
var occluder = world.occ // defined as [left, top, right, bottom]
var ballRadius = world.rad

var VIZ_NOISE = 5
var VELOCITY_RANGE = [-100, 100]
var P_SURPRISE = 0.01

// A function to get the nearest point under the occluder that's unseen
var nearestUnobservedPoint = function(pt) {
  var redOcc = [occluder[0] + ballRadius,
                occluder[1] + ballRadius,
                occluder[2] - ballRadius,
                occluder[3] - ballRadius
               ]
  var nearx = pt[0] < redOcc[0] ? redOcc[0] :
              pt[0] > redOcc[2] ? redOcc[2] : pt[0]
  var neary = pt[1] < redOcc[1] ? redOcc[1] :
              pt[1] > redOcc[3] ? redOcc[3] : pt[1]
  return [nearx, neary]
}



var model = function() {

  // Set what happens when
  var changeTime = randomInteger(nsteps)
  var vel_x = uniform(VELOCITY_RANGE[0], VELOCITY_RANGE[1])
  var vel_y = uniform(VELOCITY_RANGE[0], VELOCITY_RANGE[1])
  
  // Now add a node that suggests that things only change rarely
  var isSurprising = flip(P_SURPRISE)

  // What changes about the world?
  var change = function(w) {
    // The change is a change to velocity
    return ballworld.setVelocity(w, [vel_x, vel_y])
  }
      
  // Simulate the ball's path recursively
  var noisyRun = function(steps, initworld) {
    var doStep = function(stepn, world) {
      var stepworld = ballworld.step(world)
      // Only do the change if it's a surprising event AND we're on the right timestep
      var doChange = isSurprising && stepn === changeTime
      var newworld = doChange ? change(stepworld) : stepworld
      if (stepn >= steps) {
        return [ballworld.getPosition(newworld)]
      } else {
        var ds = doStep(stepn + 1, newworld)
        return [ballworld.getPosition(newworld)].concat(ds)
      }
    }
    return doStep(0, initworld)
  }

  // Run physics
  var path = noisyRun(nsteps, world)
  
  // Conditioning on 2d Gaussian observation
  var observationNoise = function(expectedPos, observedPos) {
    var expectOcc = ballworld.isPosOccluded(world, expectedPos)
    var observeOcc = observedPos['isOccluded']
    var obspx = observedPos['position'][0]
    var obspy = observedPos['position'][1]
    
    if (!expectOcc && !observeOcc) {
      // We see the ball and think we should see it
      observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
      observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
    } else if (!expectOcc && observeOcc) {
      // We don't see the ball but think we should
      
      // Let's be optimistic -- assume it's just barely not visible
      var nearestpt = nearestUnobservedPoint(expectedPos)
      observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), nearestpt[0])
      observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), nearestpt[1])
    } else if (expectOcc && !observeOcc) {
      // We see the ball but don't think we should
      
      // In this case we know our expectations and have our observations...
      // so we treat this the same as full observability
      observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
      observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
    } else if (expectOcc && observeOcc) {
      // We don't see the ball and don't think we should
      
      // Now we have no expectations! Just pass here
    }
    
  }
  map2(observationNoise, path, obs)
  
  // Change this return to report your variable of interest
  return {changeTime: changeTime, vel_x: vel_x, vel_y: vel_y, isSurprising: isSurprising}
  
  // Comment the return above and uncomment below to run the animation
//   return path
}

// Run inference and parse out / display the posteriors
var post = Infer({method: "MCMC", samples: 10000}, model)
viz.marginals(post)

// Comment out the viz.marginals call and uncomment below once `return path` is uncommented
// ballworld.animateByPath(sample(post), world, true)
