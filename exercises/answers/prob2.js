var world = ballworld.worlds['clear']
var obs = ballworld.paths['path2a']
var nsteps = obs.length-1

var VIZ_NOISE = 5
var VELOCITY_RANGE = [-100, 100]
var P_SURPRISE = 0.01

var model = function() {

  // Set what happens and at what times
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
    var obspx = observedPos['position'][0]
    var obspy = observedPos['position'][1]
    observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
    observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
  }
  map2(observationNoise, path, obs)
  
  // Change this return to report your variable of interest
  return {changeTime: changeTime, vel_x: vel_x, vel_y: vel_y, isSurprising: isSurprising}
  
  // Comment the return above and uncomment below to run the animation
//   return path
}

// Run inference and display the posteriors
var post = Infer({method: "MCMC", kernel: "MH", samples: 10000}, model)
viz.marginals(post)

// Comment out the viz.marginals call and uncomment below once `return path` is uncommented
// ballworld.animateByPath(sample(post), world, true)
