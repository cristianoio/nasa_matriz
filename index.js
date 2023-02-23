
var Model = {
    entrada: '',
    posInicial: '',
    ini: [0, 0, 'N'],
    cmd: Array(),
    solo: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],//.fill(Array(5)); //x,y = orientation (N,W,S,E)
    qtPerdas: 0,
}

function Validar() {

    //Pega os dados dos inputs
    Model.entrada = BuscarValorDigitadoPorIDCampo("entrada");
    Model.posInicial = BuscarValorDigitadoPorIDCampo("inicial");
    Model.ini[0] = parseInt(Model.posInicial.charAt(0)) - 1;
    Model.ini[1] = parseInt(Model.posInicial.charAt(1)) - 1;
    Model.ini[2] = Model.posInicial.charAt(2);

    switch (Model.ini[2]) {
        case 'N':
            Model.ini[2] = 90;
            break;
        case 'W':
            Model.ini[2] = 180;
            break;
        case 'S':
            Model.ini[2] = 270;
            break;
        case 'E':
            Model.ini[2] = 0;
            break;
    }

    //Desenha a posição de pouso
    Render(Model.ini[0] + 1, Model.ini[1] + 1, Model.ini[2]);

    //Fragmenta as coordenadas de direção
    for (var i = 0; i < Model.entrada.length; i++) {
        Model.cmd[i] = Model.entrada.charAt(i);
    }

    Movimentacao(Model.cmd, Model.ini, Model.entrada);
}

function Movimentacao(cmdParam, inicioParam, entrada) {
    //Marca a posição inicioParamcial
    Model.solo[inicioParam[0]][inicioParam[1]] = 1;

    for (var i = 0; i < cmdParam.length; i++) {
        switch (cmdParam[i]) {
            case 'M': //anda
                switch (inicioParam[2]) {
                    case 90:
                        if (inicioParam[1] >= 5) Model.qtPerdas++;
                        inicioParam[1]++;
                        break;
                    case 180:
                        if (inicioParam[0] <= 0) Model.qtPerdas++;
                        inicioParam[0]--;
                        break;
                    case 270:
                        if (inicioParam[1] <= 0) Model.qtPerdas++;
                        inicioParam[1]--;
                        break;
                    case 0:
                        if (inicioParam[0] >= 5) Model.qtPerdas++;
                        inicioParam[0]++;
                        break;
                }
                break;
            case 'L': //gira sentido anti-horário
                switch (inicioParam[2]) {
                    case 90:
                        inicioParam[2] = 180;
                        break;
                    case 180:
                        inicioParam[2] = 270;
                        break;
                    case 270:
                        inicioParam[2] = 0;
                        break;
                    case 0:
                        inicioParam[2] = 90;
                        break;
                }
                break;
            case 'R': //gira sentido horário
                switch (inicioParam[2]) {
                    case 90:
                        inicioParam[2] = 0;
                        break;
                    case 0:
                        inicioParam[2] = 270;
                        break;
                    case 270:
                        inicioParam[2] = 180;
                        break;
                    case 180:
                        inicioParam[2] = 90;
                        break;
                }
                break;
        }

        //Perda se voltar à posição inicial sem se movimentar
        //ToDo: Poderia ser gravado no banco de dados todas as visitações
        //no solo e depois tirar um relatório com as perdas, pois se em
        //algum momento a nave esteve naquela mesma célula, então houve
        //revisitação e perda de produtividade
        if (i > 1) {
            if (cmdParam[i - 2] == 'R' && cmdParam[i - 1] == 'L' && cmdParam[i] == 'R') Model.qtPerdas++;
            if (cmdParam[i - 2] == 'L' && cmdParam[i - 1] == 'R' && cmdParam[i] == 'L') Model.qtPerdas++;
        }

        if (Model.solo[inicioParam[0]][inicioParam[1]] == 1)
            if (cmdParam[i] == 'M')
                Model.qtPerdas++; //Revisitação

        Model.solo[inicioParam[0]][inicioParam[1]] = 1;

        if (inicioParam[0] < 0) inicioParam[0] = 0;
        if (inicioParam[1] < 0) inicioParam[1] = 0;
        if (inicioParam[0] > 4) inicioParam[0] = 4;
        if (inicioParam[1] > 4) inicioParam[1] = 4;

        const calcRotacoes = (entrada.replaceAll('M', '').length / entrada.length) * 100;

        Render(inicioParam[0] + 1, inicioParam[1] + 1, inicioParam[2]);
        Analise(Model.solo, i, cmdParam.length, Model.qtPerdas);
        document.getElementById('melhorCaminho').innerHTML = calcRotacoes;

        document.getElementById('progressRotacoes').innerHTML = '<div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: '+calcRotacoes+'%;" aria-valuenow="'+calcRotacoes+'" aria-valuemin="0" aria-valuemax="100">'+calcRotacoes+'%</div>';
    }
}

function Analise(solo, movimento, totalMovimento, qtPerdas) {
    var cont = 0;

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            if (solo[i][j] > 0) cont++;
        }
    }

    const soloCalc = (cont / 25) * 100;
    const movimentoCalc = (movimento / totalMovimento) * 100;
    const perdasCalc = (qtPerdas / totalMovimento) * 100;

    document.getElementById('percorrido').innerHTML = soloCalc;
    document.getElementById('movimentos').innerHTML = movimentoCalc;
    document.getElementById('perda').innerHTML = perdasCalc;
    
    
    document.getElementById('progresSoloPercorrido').innerHTML = '<div class="progress-bar" role="progressbar" style="width: '+soloCalc+'%;" aria-valuenow="'+soloCalc+'" aria-valuemin="0" aria-valuemax="100">'+soloCalc+'%</div>';
        document.getElementById('progressMovimentos').innerHTML = '<div class="progress-bar" role="progressbar" style="width: '+movimentoCalc+'%;" aria-valuenow="'+movimentoCalc+'" aria-valuemin="0" aria-valuemax="100">'+movimentoCalc+'%</div>';
    document.getElementById('progressPerdas').innerHTML = '<div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: '+perdasCalc+'%;" aria-valuenow="'+perdasCalc+'" aria-valuemin="0" aria-valuemax="100">'+perdasCalc+'%</div>';
}

function Render(x, y, value) {
    var nave = '<h1>Nave Error</h1>';
    var db = '';
    //Desenha o formato da nave, na direção
    switch (value) {
        case 90:
            nave = '<h1>^</h1>'
            break;
        case 180:
            nave = '<h1><</h1>'
            break;
        case 270:
            nave = '<h1>v</h1>'
            break;
        case 0:
            nave = '<h1>></h1>'
            break;
    }
    
    //Desenha a nave na posição
    switch (y) {
        case 1:
            db = 'A';
            document.getElementById('a' + x).innerHTML = nave;
            break;
        case 2:
            db = 'B';
            document.getElementById('b' + x).innerHTML = nave;
            break;
        case 3:
            document.getElementById('c' + x).innerHTML = nave;
            break;
        case 4:
            document.getElementById('d' + x).innerHTML = nave;
            break;
        case 5:
            document.getElementById('e' + x).innerHTML = nave;
            break;
    }
}

