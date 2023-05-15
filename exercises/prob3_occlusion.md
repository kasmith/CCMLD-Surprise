# Problem 3: Dealing with occlusion

So far, the path of the ball has been fully observable. Let's check out some cases where the ball moves under an occluder. And maybe something happens. Check out the observations below, along with `path3b` through `path3e`. Then think about what parts of the model need to change to account for this occlusion

```javascript
var world = ballworld.worlds['occluded']
var obs = ballworld.paths['path3a']

ballworld.animateObservation(obs, world)
```

...

...

...

...

...

Well, the dynamics model doesn't need to change at all -- we can assume things will continue to work the same way regardless of whether they are observed or not. The only thing that needs to change is the observation model.

Previously, we ignored the `isOccluded` tag in our observations because, well, it was always visible. But now we need to consider not just when we see or don't see the ball, but also when we should *expect* to see or not see the ball. You can use the following code as a jumping off point for the new observation model, and can fill in each of the conditions below.

NOTE: in one of the conditions there's a slightly tricky helper function needed. If you're running into a problem where you think you know what to do but don't know how, check the hints below

```javascript
// These variables will be useful for the tricky helper function
var occluder = world.occ // defined as [left, top, right, bottom]
var ballRadius = world.rad

var observationNoise = function(expectedPos, observedPos) {
    var expectOcc = ballworld.isPosOccluded(world, expectedPos)
    var observeOcc = observedPos['isOccluded']
    var obspx = observedPos['position'][0]
    var obspy = observedPos['position'][1]
    
    // **************************
    // MAKE CHANGES TO EACH OF THE CONDITIONS
    //
    // Remember: this would be the code used previously for full observability:
    //  observe(Gaussian({mu: expectedPos[0], sigma: VIZ_NOISE}), obspx)
    //  observe(Gaussian({mu: expectedPos[1], sigma: VIZ_NOISE}), obspy)
    // **************************
    if (!expectOcc && !observeOcc) {
      // We see the ball and think we should see it
      
    } else if (!expectOcc && observeOcc) {
      // We don't see the ball but think we should
      
    } else if (expectOcc && !observeOcc) {
      // We see the ball but don't think we should
      
    } else if (expectOcc && observeOcc) {
      // We don't see the ball and don't think we should
      
    }
    
  }
```

Hints:

<details><summary>See the ball and think we should see it</summary>This is the definition of the full observability function</details>

<details><summary>Don't see the ball and think we should</summary>This is the tricky condition! We know where the ball should be, but we don't have any clue where it is. In this case, be optimistic: assume the ball is just out of sight. You'll need a helper function for this.</details>

<details><summary>See the ball and don't think we should</summary>Think about whether there are any differences from the full observability condition. We know where we see the ball, and we know where we think the ball will be...</details>

<details><summary>Don't see the ball and don't think we should</summary>In this case, do we even have an observation at all?</details>

<details><summary>Click to reveal the helper function</summary>
<p>
This helper function takes the occluder and ballRadius and figures out the nearest point within the occluder to the location defined by pt
</p>
<pre><code>
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
</pre></code>
</details>

Once you have your new model, check how it explains each of the observations: `path3a-e`. Pay particular attention to the predicted ball paths for `path3d`... what does your model think is happening here? Does it find `path3e` surprising? Why or why not?

Finally, let's test one final path: `path3f`. You'll can check this one with the following code. This is an example of a ball going under an occluder and the occluder being removed, but due to limitations in the animation schema it's a bit janky: here the grey outline is the border of the occluder, and the ball disappears when occluded then reappears when the occluder is removed.

```javascript
var world = ballworld.worlds['occluded']
var obs = ballworld.paths['path3f']

ballworld.animateObservation(obs, world, true)
```

What would need to change in your model to deal with this observation? How does it differ from `path3d`?

That's all there is to the exercises, but if you're a huge go-getter who's made it here, for the rest of the time you can think about how this general idea might be extended. Note that many of these ideas cannot be easily implemented in WebPPL but there are clear ways of modeling this in Gen!

* How would you handle removing an occluder and the ball being missing?
* How would you handle one ball going into the occluder and two going out? Would this change if the occluder was only put into place after you started observing the scene?
* We made the assumption that the ball "magically" changed trajectories at some point... are there any other plausible explanations for some of the occluded observations? How would you model these?