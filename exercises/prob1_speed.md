# Problem 1: How fast is it going?

For the first problem, we're going to start by watching a ball travel and answer a simple question: given some observation noise, how fast do you think the ball is going?

First, we can watch the ball travel with the code below:

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path1']

ballworld.animateObservation(obs, world)
```

Not too exciting, huh? This uses the `ballworld` library that is custom to the version of WebPPL in this repository to instantiate a world without an occluder, and pull out a specific path that has the ball moving in a straight line. Finally, it uses the `animateObservation` function to visualize that observation.

Now let's ask, can we estimate the balls speed? Well, we can do things like look at the `world` object where this is set, or calculate it directly from the `obs` observations, but let's pretend for the moment that our observations are noisy, so we need to take that noise into account.

Let's first build a dynamics model. This function takes in two arguments: the number of "steps" of the physics engine to take, and the initial world to simulate. It runs the physics engine through recursion (because remember we can't use loops in WebPPL!) and concatenates the position that it expects the ball to be for each step together into an array that tracks the position over time:

```javascript
var run = function(steps, initworld) {
    var doStep = function(stepn, world) {
        var newworld = ballworld.step(world)
        if (stepn >= steps) {
            return [ballworld.getPosition(newworld)]
        } else {
            return [ballworld.getPosition(newworld)].concat(doStep(stepn + 1, newworld))
        }
    }
    return doStep(0, initworld)
}
```

Next we'll look at the observations. Run the following code:

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path1']

obs
```

Note that this is an array of dictionaries that consist of two items: `isOccluded` which tells us whether we are observing the ball at all (always `false` here) and `position` that tells us the position we observed the ball at.

So now we need an observation model that matches our expectations and observations. Since we have a sequence of each of these, we can define a function that matches them up assuming isotropic Gaussian noise with a standard deviation of `VIZ_NOISE` as below. Note that we use our conditioning statements of `observe` within this function: at each time step we are conditioning our expectations on our observations both in the x and y directions:

```javascript
var observationNoise = function(expectedPos, observedPos) {
    var obspx = observedPos['position'][0]
    var obspy = observedPos['position'][1]
    observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
    observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
}
```

Of course, this function only considers a single time point, so assuming we have an expected `path` output by the `run` simulations, and our `obs` observations, we can map this function across these arrays with the `map2` function. This works like `map` but for functions that take two arguments across two arrays:

```javascript
map2(observationNoise, path, obs)
```

Finally, let's put this together into a model. We'll first define a couple parameters that represent our visual observation noise (`VIZ_NOISE`) and expected velocities (`VELOCITY_RANGE`), then build a model around the code above, and finally run inference on the model reporting the posterior over the velocity in the x direction(`vel_x`).

You can copy the code below into the WebPPL window, but it's incomplete... you'll need to figure out how to write the code to set the velocity appropriately in order to infer the initial speed at the point marked in the code below. Note that you'll need to use the function `ballworld.setVelocity(world, [vx, vy])` which takes in a world object and velocity (as `[vx, vy]`) then returns a new world object that can be provided to the run function.

```javascript
var world = ballworld.worlds['clear']
var obs = ballworld.paths['path1']
var nsteps = obs.length-1

var VIZ_NOISE = 5
var VELOCITY_RANGE = [-100, 100]

var model = function() {
    // **************************
    // MAKE CHANGES TO SET THE VARIABLES BELOW
    // **************************
    var vel_x = 0
    var velworld = world

    // Simulate the ball's path recursively
    var run = function(steps, initworld) {
        var doStep = function(stepn, world) {
            var newworld = ballworld.step(world)
            if (stepn >= steps) {
                return [ballworld.getPosition(newworld)]
            } else {
                return [ballworld.getPosition(newworld)].concat(doStep(stepn + 1, newworld))
            }
        }
        return doStep(0, initworld)
    }

    // Run the simulation
    var path = run(nsteps, velworld)
    
    // Conditioning on 2d Gaussian observation
    var observationNoise = function(expectedPos, observedPos) {
        var obspx = observedPos['position'][0]
        var obspy = observedPos['position'][1]
        observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
        observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
    }
    map2(observationNoise, path, obs)
    
    return vel_x
}

// Run inference and observe the posterior velocity
var post = Infer({method: "MCMC", samples: 10000}, model)
viz(post)
```

If you're getting a posterior of the velocity focused around 80, you're doing this right and can move on to the next problem!