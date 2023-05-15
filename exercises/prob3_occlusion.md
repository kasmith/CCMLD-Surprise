# Problem 3: Dealing with occlusion

So far, the path of the ball has been fully observable. 

```javascript
var world = ballworld.worlds['occluded']
var obs = ballworld.paths['path3a']

ballworld.animateObservation(obs, world)
```


<details><summary>Click to reveal the code</summary>
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
