# Video de la landing (HU20)

Animación propia renderizada cuadro a cuadro (sin material de terceros):

```bash
cd scripts/video
npm i puppeteer-core            # usa el Chrome instalado en el sistema
node render.mjs                 # genera frames/ a 30 fps
ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -movflags +faststart ../../public/videos/gamarra-conecta.mp4
ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libvpx-vp9 -crf 38 -b:v 0 ../../public/videos/gamarra-conecta.webm
```
