# Problem 2: What changed?

Now let's move on to another example where something... odd happens. Check out the following observation:

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path2a']

ballworld.animateObservation(obs, world)
```

How do we explain this? It looks like the ball changed its trajectory at some point in the middle, so we can ask what is our posterior belief about (a) when that happened, and (b) what the new velocity is. But in order to do so, we need a new generative model that allows for non-physical changes to happen. So we replace the `run` function in our generative model with a `noisyRun` function that allows something about the world to arbitraritly change at certain points, by calling a `change` function on the world. So our framework (with gaps) would look like the following:

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path2a']
var nsteps = obs.length-1

var VIZ_NOISE = 5
var VELOCITY_RANGE = [-100, 100]

var model = function() {

  // **************************
  // MAKE CHANGES TO SET WHAT HAPPENS AND AT WHAT TIMES
  // **************************
  var changeTime = 0
  var vel_x = 0
  var vel_y = 0

  // What changes about the world?
  var change = function(w) {
    // **************************
    // MAKE CHANGES TO DEFINE THE FUNCTION BELOW
    // **************************
    return w
  }
  
  // Simulate the ball's path recursively
  var noisyRun = function(steps, initworld) {
    var doStep = function(stepn, world) {
      var stepworld = ballworld.step(world)
      // **************************
      // MAKE CHANGES TO SET THE doChange VARIABLE BELOW
      // **************************
      var doChange = false
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
  var conditioning = map2(observationNoise, path, obs)
  
  // Change this return to report your variable of interest
  return {changeTime: changeTime, vel_x: vel_x, vel_y: vel_y}
  
  // Comment the return above and uncomment below to run the animation
//   return path
}

// Run inference and display the posteriors
var post = Infer({method: "MCMC", samples: 10000}, model)
viz.marginals(post)

// Comment out the viz.marginals call and uncomment below once `return path` is uncommented
// ballworld.animateByPath(sample(post), world, true)

```

Your first task is to fix up this code so that it explains the strange trajectory. For simplicities sake:

1) Let's assume that only one change can ever occur within a scenario. We will store the time that change happens in the variable `changeTime`
2) We want to know what the new velocity of the ball is -- we can store the x and y velocities in `vel_x` and `vel_y`

In case you're stuck, some hints are below:

* <details><summary>Setting the velocity</summary>Remember how you set `vel_x` in the last problem? Wouldn't it work for x and y here?</details>
