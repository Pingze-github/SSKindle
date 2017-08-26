# image resize script

from PIL import Image
from sys import argv

script,first = argv
img = Image.open(first)
img = img.resize((640,960))
img.save(first)

