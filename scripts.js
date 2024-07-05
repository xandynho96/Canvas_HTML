
const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview')
let image;
let photoName;
//select & preview image

//primeiro estou passando para o botão a função de click e depois a função de selecionar a imagem.
document.getElementById('select-image')
.onclick = function () {
  photoFile.click()
}

window.addEventListener('DOMContentLoaded', () =>{
    photoFile.addEventListener('change', () =>{
      let file = photoFile.files.item(0)
      photoName = file.name;
//ler um arquivo
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function (event) {
          image = new Image ()
          image.src = event.target.result
          image.onload = onLoadImage
      }
    });
})

//selection tool
const selection = document.getElementById('selection-tool');

let startX, startY, relativeStartX, relativeStartY,
endX, endY, relativeEndX, relativeEndY;
let startSelection = false;
const events = {
  mouseover(){
    this.style.cursor = 'crosshair'
  },
  mousedown(){
    const {clientX, clientY, offsetX, offsetY} = event

    startX = clientX
    startY = clientY
    relativeStartX = offsetX
    relativeStartY = offsetY

    startSelection = true
  },
  mousemove(){
      endX = event.clientX
      endY = event.clientY

      if(startSelection) {
        selection.style.display = 'initial';
        selection.style.top = startY + 'px';
        selection.style.left = startX + 'px';

        selection.style.width = (endX - startX) + 'px';
        selection.style.height = (endY - startY) + 'px';

      }
    
  },
  mouseup(){
    startSelection = false

    relativeEndX = event.layerX;
    relativeEndY = event.layerY;

    //mostrar botão de corte 
    cropButton.style.display = 'initial'
  }
}

Object.keys(events)
.forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName])
})

//canvas

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImage() {
  const {width, height} = image
  canvas.width = width
  canvas.height = height

  //limpar o contexto
  ctx.clearRect(0,0, width, height)

  //desenhar imagem no contexto
  ctx.drawImage(image, 0, 0)

  photoPreview.src = canvas.toDataURL()
}

//cortar imagem 

const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
  const {width: imgW, height: imgH} = image
  const {width: previewW, height: previewH} = photoPreview
  const [widthFactor, heightFactor] = [
      +(imgW / previewW),
      +(imgH / previewH)
  ]

  const [selectionWidth, selectionHeight] = [
    +selection.style.width.replace('px',''),
    +selection.style.height.replace('px','')
  ]

  const [croppedwidth, croppedheight] = [
    +(selectionWidth * widthFactor),
    +(selectionHeight * heightFactor)
  ]
  const [actualX, actualY] = [
    +(relativeStartX * widthFactor),
    +(relativeStartY * heightFactor)
  ]
  
  //pegar do context a imagem cortada

  const croppedImage = ctx.getImageData(actualX, actualY, croppedwidth, croppedheight)

  //limpar canvas
  ctx.clearRect(0,0 ,ctx.width,ctx.height)

  //ajuste de propoções 

  image.width = canvas.width = croppedwidth;
  image.height = canvas.height = croppedheight;

  //adicionar imagem cortada ao context do canva
  ctx.putImageData(croppedImage,0 ,0)

  //esconder a ferramento de seleção
  selection.style.display = 'none'
  //atualizar preview da imagem
  photoPreview.src = canvas.toDataURL();

  // mostrar o botão de download
  downloadButton.style.display = 'initial'
}

//download
const downloadButton = document.getElementById('download')
downloadButton.onclick = () => {
  const a = document.createElement('a')
  a.download = photoName + '-cropped_photo';
  a.href = canvas.toDataURL()
  a.click()
}
