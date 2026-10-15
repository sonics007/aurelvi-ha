"""Build gallery and Studio previews from the tested app captures."""
from pathlib import Path
from PIL import Image
import json
source=Path('custom_components/aurelvi/frontend/skins.js').read_text()
skins=json.loads(source[source.index('['):source.rindex(']')+1])
assert len(skins)==80
atlas=Image.new('RGB',(3200,2560))
for index,skin in enumerate(skins):
    im=Image.open(Path('material-captures')/(skin['id']+'.png')).convert('RGB')
    atlas.paste(im.resize((320,320),Image.Resampling.LANCZOS),((index%10)*320,(index//10)*320))
for target in ['website/assets/theme-atlas.webp','custom_components/aurelvi/frontend/theme-atlas.webp']:
    atlas.save(target,quality=86)
for name in ['empire-emerald','stereo-silver','walnut-amplifier','glacier-glass','kyoto-oak','tokyo-pulse','pearl-ceramic','gatsby-midnight']:
    im=Image.open(Path('material-captures')/(name+'.png')).convert('RGB')
    im.save(Path('website/assets')/(name+'.webp'),quality=89)
print('Saved all 80 actual app previews and eight feature captures')
