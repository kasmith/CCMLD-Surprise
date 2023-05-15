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

You can explore what your model thinks is happening for each path by commenting out the original return statement and the `viz.marginals(post)` call, and uncommenting the `return path` line as well as the final `ballworld.animateByPath` call. This will pull a random path from the model's posterior and animate it. Note that even though it's a random sample, it can only pick one at a time -- you'll need to rerun the model to get a new sample.

In case you're stuck, some hints can be found by clicking below:

<details><summary>Setting the velocity</summary>Remember how you set `vel_x` in the last problem? Wouldn't it work for x and y here?</details>

<details><summary>Setting the changeTime</summary>In theory, a change could happen at any physics step. The maximum number of steps is already set to the variable nsteps, so you just need to pick a time index from that range</details>

<details><summary>Defining the change function</summary>The only change you need to care about is a change in velocity. And you used a function to do that in the last exercise...</details>

<details><summary>Setting the doChange switch</summary>You already should have set the timestep when the change function should be applied in the `changeTime` variable, and internal to the doStep function the current timestep is stored in the `stepn` variable</details>

If your model is correct, you should find that most of your posterior belief is centered around `changeTime` being close to 20, and the new velocity being close to `[60, 40]`.

So if you've got that, let's move on to the next step. Those changes to the model will make it assume that a change will **always** happen. Try changing the `obs` variable at the top of the script back to `'path1'` -- where we know there wasn't a change -- and see what happens.

Instead our model should reflect the fact that the world might not change... in fact, it usually won't! So we can define our expectations that a surprising scene will only happen 1% of the time, and then we will want to know our posterior belief that something surprising in fact did happen in the scene. To do so, we'll first add `var P_SURPRISE = 0.01` to the script around where `VIZ_NOISE` and `VELOCITY_RANGE` are defined. Then you'll need to do two things:

1. Within the model, you'll need to define `var isSurprising = ???` which should be set to `true` if this is a scene where you expect a change to occur, and `false` if not. You'll also need to adapt the return statement to return the posterior over this variable:

> return {changeTime: changeTime, vel_x: vel_x, vel_y: vel_y, isSurprising: isSurprising}

2. You'll need to use that `isSurprising` variable somewhere within the model to make sure that the velocity only changes for surprising scenes

If you're stuck, hints below:

<details><summary>Setting `isSurprising` variable</summary>You have the probability that it should be true from P_SURPRISE, and there was a function discussed in the tutorial lecture that returns true with a certain probability</details>

<details><summary>Using `isSurprising`</summary>You already have a variable that defines whether a change should occur. Now you just have an extra condition that needs to be met.</details>

Now when you run this new model on obs `path2a`, you should get a relatively similar result to the prior model, but also with most of its posterior belief set that `isSurprising` is `true`. But now check out a new observation:

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path2b']

ballworld.animateObservation(obs, world)
```

What does your model think is happening with this observation? Why do you think that is?