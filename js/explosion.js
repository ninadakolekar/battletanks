new ParticleExample(
				// The image to use
				["images/particle.png"],

				// Emitter configuration, edit this to change the look
				// of the emitter
				{
					"alpha": {
						"start": 0.8,
						"end": 0.1
					},
					"scale": {
						"start": 1,
						"end": 0.3
					},
					"color": {
						"start": "fd1111",
						"end": "f7a134"
					},
					"speed": {
						"start": 200,
						"end": 200
					},
					"startRotation": {
						"min": 0,
						"max": 0
					},
					"rotationSpeed": {
						"min": 0,
						"max": 0
					},
					"lifetime": {
						"min": 0.5,
						"max": 0.5
					},
					"frequency": 0.1,
					"emitterLifetime": 0.31,
					"maxParticles": 1000,
					"pos": {
						"x": 0,
						"y": 0
					},
					"addAtBack": false,
					"spawnType": "burst",
					"particlesPerWave": 10,
					"particleSpacing": 0,
					"angleStart": 0
				});

$("#trigger").click();
$("#trigger").click();
$("#trigger").click();