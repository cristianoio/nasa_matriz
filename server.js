var http = require('http');

http.createServer(function(req, res){
    res.end(`
    <html>

    <head>
    <script src="helpers.js"></script>
    <script src="index.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
        integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
        <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />
      
        <script>
        function BuscarValorDigitadoPorIDCampo(idCampo) {
            return (idCampo) ? document.getElementById(idCampo).value : 0;
        }
                    
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
        </script>
    </head>
    
    <body style="background-color: black; zoom: 0.8;">
    <div class="container" style="background-color: white; padding-bottom: 100px; padding-top: 50px;">
        <div class="card" style="width: 18rem; margin: 0 auto;">
            <img src="https://www.nasa.gov/sites/default/files/thumbnails/image/nasa-logo-web-rgb.png" class="card-img-top animate__animated animate__backInDown" alt="...">
        </div>
        <div class="container" style="padding-top: 50px;">
            <div class="col-xs-10">
                <form>
                    <div class="form-group col-xs-6">
                        <div class="row">
                            <div class="col">
                              <label for="exampleInputEmail1">Entrada</label>
                              <!-- MRMRMLMLMRMRMLMLMMMLMLMRMRMLMLMRMRMMRMMMM -->
                              <input type="text" class="form-control" id="entrada" name="entrada"
                                  placeholder="MRMRMLMLMRMRMLMLMMMLMLMRMRMLMLMRMRMMRMMMM" aria-label="entrada">
                              <small id="emailHelp" class="form-text text-muted">Digite uma entrada.</small>
                            </div>
                            <div class="col">
                              <label for="exampleInputEmail1">Inicial</label>
                              <!-- 11N -->
                              <input type="text" class="form-control" id="inicial" name="inicial" placeholder="11N"
                                  aria-label="inicial">
                              <small id="emailHelp" class="form-text text-muted">Inicial.</small>
                            </div>
                          </div>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="Validar()">Validar</button>
                </form>
            </div>
        </div>

        <div class="container" style="padding-top: 10px;">
            <div class="col-xs-10">
                <form>
                    <div class="form-group">
                        <label class="">Solo percorrido:</label>
                        <div id="progresSoloPercorrido" class="progress "></div>
                        <label class="">Movimentos Executados:</label>
                        <div id="progressMovimentos" class="progress "></div>
                        <label class="">Perdas:</label>
                        <div id="progressPerdas" class="progress "></div>
                        <label class="">Rotações:</label>
                        <div id="progressRotacoes" class="progress "></div>
                    </div>
            </div>
            </form>
        </div>

        <div style="display: none;">
            <div>Solo percorrido (%): <spam id="percorrido">0</spam>%</div>
            <div>Movimentos executados (%): <spam id="movimentos">0</spam>%</div>
            <div>Movimentos perdidos (%): <spam id="perda">0</spam>%</div>
            <div>Rotações (%): <spam id="melhorCaminho">0</spam>%</div>
        </div>

        <div class="container" style="padding-top: 12px;">
            <div class="col-xs-10">
                <table id="tabela" border="1" class="table table-dark">
                    <tr>
                        <td id="e1">E1</td>
                        <td id="e2">E2</td>
                        <td id="e3">E3</td>
                        <td id="e4">E4</td>
                        <td id="e5">E5</td>
                    </tr>

                    <tr>
                        <td id="d1">D1</td>
                        <td id="d2">D2</td>
                        <td id="d3">D3</td>
                        <td id="d4">D4</td>
                        <td id="d5">D5</td>
                    </tr>

                    <tr>
                        <td id="c1">C1</td>
                        <td id="c2">C2</td>
                        <td id="c3">C3</td>
                        <td id="c4">C4</td>
                        <td id="c5">C5</td>
                    </tr>

                    <tr>
                        <td id="b1">B1</td>
                        <td id="b2">B2</td>
                        <td id="b3">B3</td>
                        <td id="b4">B4</td>
                        <td id="b5">B5</td>
                    </tr>

                    <tr>
                        <td id="a1">A1</td>
                        <td id="a2">A2</td>
                        <td id="a3">A3</td>
                        <td id="a4">A4</td>
                        <td id="a5">A5</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
    
    </html>`


    );
}).listen(8080);
