window.onload = function () {
    //Largeur et hauteur en pixels
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    //Taille en hauteur et largeur d'un bloc
    const BLOCK_SIZE = 20;
    //Largeur et hauteur en pixels en blocks
    const WIDTH_IN_BLOCKS = CANVAS_WIDTH / BLOCK_SIZE;
    const HEIGHT_IN_BLOCKS = CANVAS_HEIGHT / BLOCK_SIZE;
    //Vitesse min et max du jeu
    const MIN_DELAY = 40;
    const MAX_DELAY = 150;
    //Vitesse du jeu initialisée à la vitesse max
    let delay = MAX_DELAY;
    //Le serpent
    let snake;
    //La pomme
    let apple;
    //Les scores
    let score = 0;
    let highScore = 0;

    let canvas;
    let context;

    init();

    //Initialise le document
    function init(){
        canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.style.border = "1px solid";
        document.body.appendChild(canvas);
        context = canvas.getContext('2d');
        snake = new Snake([[6,4], [5,4], [4,4],[3,4], [2,4]], "right");
        apple = new Apple([10,10]);
        refreshCanvas();
    }
    // Boucle tant que le jeu n'est pas fini
    function refreshCanvas(){
        snake.move();
        //Si le serpent se mord la queue ou touche un bord, GameOver
        if(snake.checkCollision()){
            gameOver();
        }else{
            //Si le serpent mange une pomme
            if(snake.isEatingApple(apple)){
                snake.appleAte = true;
                score+=apple.score;
                if(delay>MIN_DELAY)
                    delay-=5;
                drawScore();
                do {
                    apple.setNewPosition();
                }while(apple.isOnSnake(snake))
            }
            context.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
            snake.draw();
            apple.draw();
            drawScore();
            drawHighScore();
            setTimeout(refreshCanvas,delay);
        }
    }

    //Lorsque le joueur perd la partie
    function gameOver(){
        if(score>highScore)
            highScore=score;
        delay = MAX_DELAY;
        score = 0;
        context.save();
        context.fillText("Game Over", 300, 380);
        context.fillText("Appuyez sur espace pour rejouer", 300, 395);
        context.restore();
    }

    function restart() {
        snake = new Snake([[6,4], [5,4], [4,4],[3,4], [2,4]], "right");
        apple = new Apple([10,10]);
        refreshCanvas();
    }

    //A partir des pixels dessine un bloc
    function drawBlock(context, position){
        let x = position[0] * BLOCK_SIZE;
        let y = position[1] * BLOCK_SIZE;
        context.fillRect(x,y, BLOCK_SIZE, BLOCK_SIZE);
    }

    function drawScore(){
        context.save();
        console.log("Score : " + score.toString());
        context.fillText("Score : " + score.toString(), 5, 30);
        context.restore();
    }

    function drawHighScore(){
        context.save();
        context.fillText("High score : " + highScore.toString(), 5, 15);
        context.restore();
    }

    function Apple(position){
        //Position de la pomme sous forme de tableau [x,y]
        this.position = position;
        this.score = 10;

        //Dessine la pomme
        this.draw = function(){
            context.save();
            context.fillStyle = "#33cc33";
            context.beginPath();
            let radius = BLOCK_SIZE / 2;
            let x = this.position[0]*BLOCK_SIZE + radius;
            let y = this.position[1]*BLOCK_SIZE + radius;
            context.arc(x,y,radius,0, Math.PI*2, true);
            context.fill();
            context.restore();
        };

        //Modifie l'emplacement de la pomme de façon alétoire
        this.setNewPosition = function () {
            let newX = Math.round(Math.random() * (WIDTH_IN_BLOCKS - 1));
            let newY = Math.round(Math.random() * (HEIGHT_IN_BLOCKS - 1));
            this.position = [newX, newY];
        };

        //Vérifie que la pomme n'apparaisse pas sur le serpent
        this.isOnSnake= function (snake) {
            let isOnSnake = false;
            for(i=0; i<snake.body.length; i++){
                if(this.position[0] === snake.body[i][0] && this.position[1] === snake.body[i][1] )
                    isOnSnake = true;
            }
            return isOnSnake;
        };
    }

    //Classe Serpent
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.appleAte = false;
        this.draw = function () {
            context.save();
            context.fillStyle = "#ff0000";
            for (let i = 0; i < this.body.length; i++) {
                drawBlock(context, this.body[i]);
            }
            context.restore();
        };

        //Gestion du déplacement du serpent
        this.move = function () {
            let nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "right":
                    nextPosition[0]++;
                    break;
                case "left":
                    nextPosition[0]--;
                    break;
                case "up":
                    nextPosition[1]--;
                    break;
                case "down":
                    nextPosition[1]++;
                    break;
                default:
                    throw("Invalid direction");
                }
            this.body.unshift(nextPosition);
            if(!this.appleAte)
                this.body.pop();
            else
                this.appleAte = false;
        };

        //On vérifie si la direction utilisée par le joueur est valide, puis on la modifie
        this.setDirection = function(newDirection) {
            let allowedDirections;
            if(this.direction === "left" || this.direction === "right"){
                allowedDirections = ["up", "down"];
            }else if (this.direction === "up" || this.direction === "down"){
                allowedDirections = ["left", "right"];
            }
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };

        //On vérifie que le serpent ne soit pas hors des limites ou qu'il ne se morde pas la queue
        this.checkCollision = function(){
            let wallCollision = false;
            let snakeCollision = false;
            let snakeHead = this.body[0];
            let snakeBody = this.body.slice(1);
            let snakeX = snakeHead[0];
            let snakeY = snakeHead[1];
            let isNotBetweenHorizontalWalls = snakeX < 0 || snakeX > WIDTH_IN_BLOCKS-1;
            let isNotBetweenVerticalWalls = snakeY < 0 || snakeY > HEIGHT_IN_BLOCKS-1;
            if( isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
                wallCollision = true;
            }
            for(let i = 0; i < snakeBody.length; i++){
                if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]){
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };

        //Si le serpent est sur la pomme
        this.isEatingApple = function (appleToEat) {
            const snakeHead = this.body[0];
            return snakeHead[0] === appleToEat.position[0] && snakeHead[1] === appleToEat.position[1];
        };
    }
    // Gère les entrées clavier
    document.onkeydown = function handleKeyDown(e){
        const key = e.keyCode;
        let newDirection;
        switch (key) {
            case 37 :
                newDirection = "left";
                break;
            case 38 :
                newDirection = "up";
                break;
            case 39 :
                newDirection = "right";
                break;
            case 40 :
                newDirection = "down";
                break;
            case 32 :
                restart();
                return;
            default :
                return;
        }
        snake.setDirection(newDirection);
    }
};