var world = ballworld.worlds['clear']
var obs = ballworld.paths['path1']
var nsteps = obs.length-1

var VIZ_NOISE = 5
var VELOCITY_RANGE = [-100, 100]

var model = function() {
    // Add noise to the x-velocity of the ball
    var newvel = uniform(VELOCITY_RANGE[0], VELOCITY_RANGE[1])
    var velworld = ballworld.setVelocity(world, [newvel, 0])

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
    var conditioning = map2(observationNoise, path, obs)
    
    return newvel
}

// Run inference and observe the posterior velocity
var post = Infer({method: "MCMC", samples: 10000}, model)
viz(post)
