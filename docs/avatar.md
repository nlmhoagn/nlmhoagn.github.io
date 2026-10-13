# Rounded layered avatar

The avatar keeps the original `public/models/character.enc` geometry,
round face, eyelid morphs, 68-bone rig and 11 animation clips. The original
clothing, blonde mullet color and four silver hoops are retained.

`layeredHair.ts` creates a single scalp surface with swept relief and pointed
fringe contours. Shared seam normals keep highlights continuous. The blonde
nape uses one waved surface placed outside the original skull.
`customizeCharacter.ts` adds warm skin, brown irises, softly bevelled brows
and larger clear frames. Photographs are reference only; none is embedded
in an asset or copied into the public folder.

The forehead is covered by the scalp itself. Ear backing uses the exact rim
contour with a shallow sculpted cartilage ridge, without a separate floating tube.

## Build and review

```sh
npm run avatar:check
npm run build
npm run preview -- --host 127.0.0.1
```

Open `/avatar-preview.html` for the front, back, three-quarter views, profiles,
turntable and motion controls. The studio uses neutral lighting; the
website retains its purple lighting.

`Export GLB` downloads the complete avatar, including the new hair and
accessories. It includes the five character animation clips. The other
six clips animate keyboard props in the website scene.

Head follow uses elapsed time and runs after the animation mixer. Its
smoothing state is separate from the animated pose. The intro retains
control while playing. Touch, resize and hover listeners are cleaned up
when the scene unmounts.

`avatar:check` checks finite hair and ear geometry, continuous hair surfaces,
the triangle budget, a closed front seam, 158 actual rear skull vertices inside
the nape envelope, four earrings and head follow at 30/60/120 updates per second.
