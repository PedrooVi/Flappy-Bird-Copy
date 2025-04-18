function novoElemento (tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//const b = new Barreira(true)
//b.setAltura(100)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreira (altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() *(altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior )   
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = (x) => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

//const b = new ParDeBarreira(700, 300, 600)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreira(altura, abertura, largura),
        new ParDeBarreira(altura, abertura,largura + espaco),
        new ParDeBarreira(altura, abertura, largura + espaco * 2),
        new ParDeBarreira(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // Quando a barreira sair da tela 
            if(par.getX()< -par.getLargura()){
                par.setX(par.getX()+ espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura/2
            const cruzouOMeio= par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
            
        });;
    }
}

function Passaro (alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = '../imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () =>{
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo/2)
}


function Progresso (){
    this.elemento = novoElemento('spam', 'progresso')
    this.atualizaPontos = pontos => {
        this.elemento.innerHTML = pontos
    } 
    this.atualizaPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top  &&b.top + b.height >= a.top
    return horizontal && vertical
}

function colisao(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(ParDeBarreira => {
        const superior = ParDeBarreira.superior.elemento
        const inferior = ParDeBarreira.inferior.elemento

        if (
            estaoSobrepostos(passaro.elemento, superior) ||
            estaoSobrepostos(passaro.elemento, inferior)
        ) {
            colidiu = true
        }
    })

    return colidiu
}


function FlappyBird(){
    let pontos = 0 

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizaPontos(++pontos))

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // Loop do jogo
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()

            if(colisao(passaro, barreiras)){
                clearInterval(temporizador)
            }
        },20)
    }

}
 new FlappyBird().start()


