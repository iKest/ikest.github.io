
BasicGame.Game = function (game) {};

BasicGame.Game.prototype = {

    init: function () {

        var me = this;

        me.glowColors = [0xFF0000,0x0000FF,0xFFFFFF,0x00FF00,0xFFFF00,0xFF3DFF,0xFF9E3D];
        me.BLOCK = 0;
        me.EMPTY = 1;
        me.TILE = 2;

        me.levelGrid = [[0, 0, 1, 1, 1, 1, 0, 0],
                        [0, 1, 1, 1, 1, 1, 1, 0],
                        [1, 1, 0, 1, 1, 0, 1, 1],
                        [1, 1, 1, 0, 0, 1, 1, 1],
                        [1, 1, 1, 0, 0, 1, 1, 1],
                        [1, 1, 0, 1, 1, 0, 1, 1],
                        [0, 1, 1, 1, 1, 1, 1, 0],
                        [0, 0, 1, 1, 1, 1, 0, 0]];

        me.sizeCol = me.levelGrid.length;
        me.sizeRow = me.levelGrid[0].length;
        me.tileSizeX = 80;
        me.tileSizeY = 80;
        me.stepTileX = 80;
        me.stepTileY = 80;
        me.zeroPointX = 40;
        me.zeroPointY = 40;
        me.isGloved = false;
        me.isDragging = false;
        me.dragDirection = '';
        me.isRelising = false;
        me.seed = Date.now();
        me.random = new Phaser.RandomDataGenerator([me.seed]);
        me.allDownRows = [];

        me.distX = 0;
        me.distY = 0;
        me.movingCol = 0;
        me.movingRow = 0;
        me.step = 15;
        me.isGloved = false;
        me.isFilling = false;
        me.scoreSum = 0;
    },

    create: function () {

        var me = this;

        me.mask = me.game.add.graphics(0,0);
        me.mask.beginFill(0x000000);
        me.mask.alpha = 0;      
        me.mask.drawRect(me.zeroPointX-.5*me.stepTileX, me.zeroPointY-.5*me.stepTileY, me.stepTileX*me.levelGrid[0].length, me.stepTileY*me.levelGrid.length);


        me.tileGrid = [];
        me.theoryGrid = [];
        for(var col = 0; col < me.sizeCol; col++){
            me.tileGrid[col] = [];
            me.theoryGrid[col] = [];
            for(var row = 0; row < me.sizeRow; row++){
                me.theoryGrid[col][row] = {};
                me.theoryGrid[col][row].col = col;
                me.theoryGrid[col][row].row = row;
                me.tileGrid[col][row] = me.add.sprite(me.zeroPointX + row*me.stepTileX, me.zeroPointY+col*me.stepTileY, 'ball');
                me.tileGrid[col][row].isGlow = false;
                me.tileGrid[col][row].anchor.set(0.5, 0.5);
                //me.tileGrid[col][row].blendMode = Phaser.blendModes.ADD;
                me.tileGrid[col][row].mask = me.mask;
                me.tileGrid[col][row].isGlow = false;
                me.tileGrid[col][row].tileType = me.levelGrid[col][row];
                me.tileGrid[col][row].col = col;
                me.tileGrid[col][row].row = row;
                me.glow = me.add.image(0, 0, 'light');
                me.glow.anchor.setTo(0.5, 0.5);
                //me.glow.blendMode = Phaser.blendModes.ADD;
                me.glow.alpha = 0.5;
                me.glow.scale.set(.5,.5);
                me.tileGrid[col][row].addChild(me.glow);
                me.tileGrid[col][row].children[0].visible = false; 
            }
        }

        for(var col = 0; col < me.sizeCol; col++){
            for(var row = 0; row < me.sizeRow; row++){
                if (me.tileGrid[col][row].tileType != me.BLOCK) {
                    me.tileGrid[col][row].tileColor = me.random.integerInRange(0, me.glowColors.length - 1);
                    me.tileGrid[col][row].tint = me.glowColors[me.tileGrid[col][row].tileColor];
                    me.tileGrid[col][row].tileType = me.TILE;
                    while (me.chekGlows(col,row)) {
                        me.tileGrid[col][row].tileColor = me.random.integerInRange(0, me.glowColors.length - 1);
                        me.tileGrid[col][row].tint = me.glowColors[me.tileGrid[col][row].tileColor];
                    } 
                    me.tileGrid[col][row].children[0].tint = me.glowColors[me.tileGrid[col][row].tileColor];    
                } 
                else {me.tileGrid[col][row].visible = false;}
            }
        }

        me.tempSize = Math.max(me.sizeCol, me.sizeRow);
        me.tempTile = [];
        for(var i = 0; i < me.tempSize; i++){
            me.tempTile[i] = me.add.sprite(0,0,'ball');
            me.tempTile[i].anchor.set(0.5, 0.5);
            me.tempTile[i].mask = me.mask;
            //me.tempTile[i].blendMode = Phaser.blendModes.ADD;
            me.glow = me.add.image(0, 0, 'light');
            me.glow.anchor.setTo(0.5, 0.5);
            //me.glow.blendMode = Phaser.blendModes.ADD;
            me.glow.alpha = 0.5;
            me.glow.scale.set(.5,.5);
            me.tempTile[i].addChild(me.glow);
            me.tempTile[i].children[0].visible = false;    
            me.tempTile[i].visible = false;
        }

        for(var col = 0; col < me.sizeCol; col++){
            for(var row = 0; row < me.sizeRow; row++){
                if (me.tileGrid[col][row].tileType == me.BLOCK) {
                    me.add.sprite(me.zeroPointX + row*me.stepTileX, me.zeroPointY+col*me.stepTileY, 'block').anchor.set(.5,.5);    
                } 
            }
        }
       
        me.input.onDown.add(me.pickTile, me);
    },

    update: function () {

        var me = this;
        if(me.isDragging){me.dargging();}
        if(me.isRelising){me.relising();}
        if(me.isFilling){me.filling();}
    },

    render: function () {

        var me = this;

        me.game.debug.text('fps:'+this.game.time.fps || '--', 2, 14, '#00ff00'); 
        me.game.debug.text(me.scoreSum, 2, 34, '#00ff00'); 
    },

    pickTile: function (){

        var me = this;  
        me.startX = me.input.worldX;
        me.startY = me.input.worldY;
        me.movingCol = me.pointCol(me.startY);
        me.movingRow = me.pointRow(me.startX);
        if (me.movingCol >=0 && me.movingCol < me.sizeCol && me.movingRow >=0 && me.movingRow < me.sizeRow && me.tileGrid[me.movingCol][me.movingRow].tileType != me.BLOCK){
            me.isDragging = true;
            me.input.onDown.remove(me.pickTile, me);
            me.input.onUp.add(me.releaseTile, me);
        }   
    },

    releaseTile: function () {

        var me = this;
        

        me.isDragging = false;
        me.input.onUp.remove(me.releaseTile, me);

        switch(me.dragDirection){                    
                case '':
                    me.input.onDown.add(me.pickTile, me);    
            break;             
                case 'horizontal':
                    if (me.isGloved) {
                        me.tileGridColUpdate(me.movingCol);
                        me.distX = me.delta(me.distX, me.stepTileX);
                        me.isRelising = true;
                    }
                    else {me.turnOffGlows(); me.isRelising = true;}
                      
            break;          
                case 'vertical':
                    if (me.isGloved) {
                        me.tileGridRowUpdate(me.movingRow);
                        me.distY = me.delta(me.distY, me.stepTileY);
                        me.isRelising = true;
                    }
                    else {me.turnOffGlows(); me.isRelising = true;}
            break;
        }
    },

    takeDirection: function () {

        var me = this;

        var dist = me.distX*me.distX+me.distY*me.distY;
        if (dist>25) {
            var dragAngle=Math.abs(Math.atan2(me.distY,me.distX));
            if ((dragAngle>Math.PI/4 && dragAngle<3*Math.PI/4)) {
                me.dragDirection='vertical';
                me.startY += me.distY;
            }
            else {
                me.dragDirection='horizontal';
                me.startX += me.distX;
            }
        }
    },

    horizontalMoving: function (movingCol, dist) {
        var me = this;
        var tempArray = [];
        var shiftAmount = Math.ceil(0.5*Math.floor(dist/(0.5*me.stepTileX)));
        var beginGrid = -1;
        var endGrid = me.sizeRow;

        while (beginGrid < me.sizeRow-1 && me.tileGrid[movingCol][beginGrid+1].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[movingCol][endGrid-1].tileType == me.BLOCK) {endGrid--;}

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[movingCol][i].tileType != me.BLOCK){tempArray.push(me.tileGrid[movingCol][i]);}
        }
        tempArray = me.ArrayRotate(tempArray,shiftAmount);
        for (var i=0; i<me.sizeRow; i++) {
            if (me.tileGrid[movingCol][i].tileType == me.BLOCK){tempArray.splice(i, 0, me.tileGrid[movingCol][i])}
        }

        var delta = me.delta(dist,me.stepTileX);

        
        for (var i=beginGrid+1; i<endGrid; i++) {
            tempArray[i].x = me.zeroPointX + i*me.stepTileX + delta;
            me.theoryGrid[movingCol][i].col = tempArray[i].col;
            me.theoryGrid[movingCol][i].row = tempArray[i].row;
        } 
    },

    verticalMoving : function (movingRow, dist, endGrid) {
        var me = this;
        var tempArray = [];
        var shiftAmount = Math.ceil(0.5*Math.floor(dist/(0.5*me.stepTileY)));
        var beginGrid = -1;
        if (endGrid === undefined) { endGrid = me.sizeCol; } 

        while (beginGrid < endGrid && me.tileGrid[beginGrid+1][movingRow].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[endGrid-1][movingRow].tileType == me.BLOCK) {endGrid--;}

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[i][movingRow].tileType != me.BLOCK){tempArray.push(me.tileGrid[i][movingRow]);}
        }
        tempArray = me.ArrayRotate(tempArray,shiftAmount);
        for (var i=0; i<endGrid; i++) {
            if (me.tileGrid[i][movingRow].tileType == me.BLOCK){tempArray.splice(i, 0, me.tileGrid[i][movingRow])}
        }

        var delta = me.delta(dist,me.stepTileX);

        for (var i=beginGrid+1; i<endGrid; i++) {
            tempArray[i].y = me.zeroPointY + i*me.stepTileY + delta;
            me.theoryGrid[i][movingRow].col = tempArray[i].col;
            me.theoryGrid[i][movingRow].row = tempArray[i].row;
        } 
    },

    showTempTilesHorizontal: function(movingCol, dist, endGrid) {
        var me = this;

        var beginGrid = -1;
        var endGrid = me.sizeRow;

        while (beginGrid < me.sizeRow-1 && me.tileGrid[movingCol][beginGrid+1].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[movingCol][endGrid-1].tileType == me.BLOCK) {endGrid--;}

        var delta = me.delta(dist, me.stepTileX);

        me.tempTile[movingCol].visible = false;
        me.tempTile[movingCol].y = me.zeroPointY + movingCol*me.stepTileY;
        me.tempTile[movingCol].children[0].visible = false;
        if (delta > 0) {
                me.tempTile[movingCol].x = me.zeroPointX + beginGrid*me.stepTileX + delta;
                me.tempTile[movingCol].tileColor = me.tileGrid[me.theoryGrid[movingCol][endGrid-1].col][me.theoryGrid[movingCol][endGrid-1].row].tileColor;
                me.tempTile[movingCol].tint = me.glowColors[me.tempTile[movingCol].tileColor]; 
                me.tempTile[movingCol].visible = true;
                me.tempTile[movingCol].children[0].tint = me.glowColors[me.tempTile[movingCol].tileColor];
                me.tempTile[movingCol].children[0].visible = me.tileGrid[me.theoryGrid[movingCol][endGrid-1].col][me.theoryGrid[movingCol][endGrid-1].row].children[0].visible;

        } 
        else if (delta < 0) {
                me.tempTile[movingCol].x = me.zeroPointX + endGrid*me.stepTileX + delta;
                me.tempTile[movingCol].tileColor = me.tileGrid[me.theoryGrid[movingCol][beginGrid+1].col][me.theoryGrid[movingCol][beginGrid+1].row].tileColor;
                me.tempTile[movingCol].tint = me.glowColors[me.tempTile[movingCol].tileColor];
                me.tempTile[movingCol].visible = true;
                me.tempTile[movingCol].children[0].tint = me.glowColors[me.tempTile[movingCol].tileColor];
                me.tempTile[movingCol].children[0].visible = me.tileGrid[me.theoryGrid[movingCol][beginGrid+1].col][me.theoryGrid[movingCol][beginGrid+1].row].children[0].visible;
        }

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[movingCol][i].tileType == me.BLOCK) {
                me.tileGrid[movingCol][i].visible = false;
                me.tileGrid[movingCol][i].children[0].visible = false;

                if (delta > 0 && me.tileGrid[movingCol][i+1].tileType !=me.BLOCK) {
                    var j = i;
                    while (j > 0 && me.tileGrid[movingCol][j-1].tileType == me.BLOCK) {j--;}
                    me.tileGrid[movingCol][i].tileColor = me.tileGrid[me.theoryGrid[movingCol][j-1].col][me.theoryGrid[movingCol][j-1].row].tileColor;
                    me.tileGrid[movingCol][i].tint = me.glowColors[me.tileGrid[movingCol][i].tileColor];
                    me.tileGrid[movingCol][i].visible = true;
                    me.tileGrid[movingCol][i].children[0].tint = me.glowColors[me.tileGrid[movingCol][i].tileColor];
                    me.tileGrid[movingCol][i].children[0].visible = me.tileGrid[me.theoryGrid[movingCol][j-1].col][me.theoryGrid[movingCol][j-1].row].children[0].visible;
                } 
                else if (delta < 0 && me.tileGrid[movingCol][i-1].tileType !=me.BLOCK) {
                    var j = i;
                    while (me.tileGrid[movingCol][j+1].tileType == me.BLOCK) {j++;}
                    me.tileGrid[movingCol][i].tileColor = me.tileGrid[me.theoryGrid[movingCol][j+1].col][me.theoryGrid[movingCol][j+1].row].tileColor;
                    me.tileGrid[movingCol][i].tint = me.glowColors[me.tileGrid[movingCol][i].tileColor];
                    me.tileGrid[movingCol][i].visible = true;
                    me.tileGrid[movingCol][i].children[0].tint = me.glowColors[me.tileGrid[movingCol][i].tileColor];
                    me.tileGrid[movingCol][i].children[0].visible = me.tileGrid[me.theoryGrid[movingCol][j+1].col][me.theoryGrid[movingCol][j+1].row].children[0].visible;
                }   
            }
        }   
    },

    showTempTilesVertical: function(movingRow, dist, endGrid) {
        var me = this;
        var beginGrid = -1;
        if (endGrid === undefined) { endGrid = me.sizeCol; }

        while (beginGrid < endGrid && me.tileGrid[beginGrid+1][movingRow].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[endGrid-1][movingRow].tileType == me.BLOCK) {endGrid--;}

        var delta = me.delta(dist, me.stepTileY);

        me.tempTile[movingRow].visible = false;
        me.tempTile[movingRow].tint = 0;
        me.tempTile[movingRow].x = me.zeroPointX + movingRow*me.stepTileX;
        me.tempTile[movingRow].children[0].visible = false;
        if (delta > 0) {
                me.tempTile[movingRow].y = me.zeroPointY + beginGrid*me.stepTileY + delta;
                me.tempTile[movingRow].tileColor = me.tileGrid[me.theoryGrid[endGrid-1][movingRow].col][me.theoryGrid[endGrid-1][movingRow].row].tileColor;
                me.tempTile[movingRow].tint = me.glowColors[me.tempTile[movingRow].tileColor];
                me.tempTile[movingRow].visible = true;
                me.tempTile[movingRow].children[0].tint = me.glowColors[me.tempTile[movingRow].tileColor];
                me.tempTile[movingRow].children[0].visible = me.tileGrid[me.theoryGrid[endGrid-1][movingRow].col][me.theoryGrid[endGrid-1][movingRow].row].children[0].visible;

        } 
        else if (delta < 0) {
                me.tempTile[movingRow].y = me.zeroPointY + endGrid*me.stepTileY + delta;
                me.tempTile[movingRow].tileColor = me.tileGrid[me.theoryGrid[beginGrid+1][movingRow].col][me.theoryGrid[beginGrid+1][movingRow].row].tileColor;
                me.tempTile[movingRow].tint = me.glowColors[me.tempTile[movingRow].tileColor];
                me.tempTile[movingRow].visible = true;
                me.tempTile[movingRow].children[0].tint = me.glowColors[me.tempTile[movingRow].tileColor];
                me.tempTile[movingRow].children[0].visible = me.tileGrid[me.theoryGrid[beginGrid+1][movingRow].col][me.theoryGrid[beginGrid+1][movingRow].row].children[0].visible; 
        }

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[i][movingRow].tileType == me.BLOCK) {
                me.tileGrid[i][movingRow].visible = false;
                me.tileGrid[i][movingRow].children[0].visible = false;
                if (delta > 0 && me.tileGrid[i+1][movingRow].tileType !=me.BLOCK) {
                    var j = i;
                    while (j > 0 && me.tileGrid[j-1][movingRow].tileType == me.BLOCK) {j--;}
                    me.tileGrid[i][movingRow].tileColor = me.tileGrid[me.theoryGrid[j-1][movingRow].col][me.theoryGrid[j-1][movingRow].row].tileColor;
                    me.tileGrid[i][movingRow].tint = me.glowColors[me.tileGrid[i][movingRow].tileColor];
                    me.tileGrid[i][movingRow].visible = me.tileGrid[me.theoryGrid[j-1][movingRow].col][me.theoryGrid[j-1][movingRow].row].visible;
                    me.tileGrid[i][movingRow].children[0].tint = me.glowColors[me.tileGrid[i][movingRow].tileColor];
                    me.tileGrid[i][movingRow].children[0].visible = me.tileGrid[me.theoryGrid[j-1][movingRow].col][me.theoryGrid[j-1][movingRow].row].children[0].visible;
                } 
                else if (delta < 0 && me.tileGrid[i-1][movingRow].tileType !=me.BLOCK) {
                    var j = i;
                    while (me.tileGrid[j+1][movingRow].tileType == me.BLOCK) {j++;}
                    me.tileGrid[i][movingRow].tileColor = me.tileGrid[me.theoryGrid[j+1][movingRow].col][me.theoryGrid[j+1][movingRow].row].tileColor;
                    me.tileGrid[i][movingRow].tint = me.glowColors[me.tileGrid[i][movingRow].tileColor];
                    me.tileGrid[i][movingRow].visible = me.tileGrid[me.theoryGrid[j+1][movingRow].col][me.theoryGrid[j+1][movingRow].row].visible;
                    me.tileGrid[i][movingRow].children[0].tint = me.glowColors[me.tileGrid[i][movingRow].tileColor];
                    me.tileGrid[i][movingRow].children[0].visible = me.tileGrid[me.theoryGrid[j+1][movingRow].col][me.theoryGrid[j+1][movingRow].row].children[0].visible;
                }   
            }
        } 
    },

    chekGlows: function(i,j) {
        var me = this;
        var temp = 1;
        
        if (me.tileGrid[i][j].tileType != me.BLOCK){
            if (j>0 && me.tileGrid[i][j-1].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i][j-1].col][me.theoryGrid[i][j-1].row].tileColor){
                    temp++;
                    if (i>0 && me.tileGrid[i-1][j-1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-1][j-1].col][me.theoryGrid[i-1][j-1].row].tileColor) {return true;}}
                    if (j>1 && me.tileGrid[i][j-2].tileType !=me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i][j-2].col][me.theoryGrid[i][j-2].row].tileColor) {return true;}}
                    if (i<me.sizeCol-1 && me.tileGrid[i+1][j-1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+1][j-1].col][me.theoryGrid[i+1][j-1].row].tileColor) {return true;}}
                }
            } 
            if (i<me.sizeCol-1 && me.tileGrid[i+1][j].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+1][j].col][me.theoryGrid[i+1][j].row].tileColor){
                    temp++;
                    if (j>0 && me.tileGrid[i+1][j-1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+1][j-1].col][me.theoryGrid[i+1][j-1].row].tileColor) {return true;}}
                    if (i<me.sizeCol-2 && me.tileGrid[i+2][j].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+2][j].col][me.theoryGrid[i+2][j].row].tileColor) {return true;}}
                    if (j<me.sizeRow-1 && me.tileGrid[i+1][j+1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+1][j+1].col][me.theoryGrid[i+1][j+1].row].tileColor) {return true;}}
                }
            } 
            if (j<me.sizeRow-1 && me.tileGrid[i][j+1].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i][j+1].col][me.theoryGrid[i][j+1].row].tileColor){
                    temp++;
                    if (i<me.sizeCol-1 && me.tileGrid[i+1][j+1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i+1][j+1].col][me.theoryGrid[i+1][j+1].row].tileColor) {return true;}}
                    if (j<me.sizeRow-2 && me.tileGrid[i][j+2].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i][j+2].col][me.theoryGrid[i][j+2].row].tileColor) {return true;}}
                    if (i>0 && me.tileGrid[i-1][j+1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-1][j+1].col][me.theoryGrid[i-1][j+1].row].tileColor) {return true;}}
                }
            } 
            if (i>0 && me.tileGrid[i-1][j].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-1][j].col][me.theoryGrid[i-1][j].row].tileColor){
                    temp++;
                    if (j<me.sizeRow-1 && me.tileGrid[i-1][j+1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-1][j+1].col][me.theoryGrid[i-1][j+1].row].tileColor) {return true;}}
                    if (i>1 && me.tileGrid[i-2][j].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-2][j].col][me.theoryGrid[i-2][j].row].tileColor) {return true;}}
                    if (j>0 && me.tileGrid[i-1][j-1].tileType != me.BLOCK) {if (me.tileGrid[me.theoryGrid[i][j].col][me.theoryGrid[i][j].row].tileColor == me.tileGrid[me.theoryGrid[i-1][j-1].col][me.theoryGrid[i-1][j-1].row].tileColor) {return true;}}
                }
            } 
            if (temp>2){return true;}
        }
        return false;
    },

    turnOnGlows: function (showGlows) {
        var me = this;
        var isGloved = false;
        for(var col = 0; col < me.sizeCol; col++) {
            for(var row = 0; row < me.sizeRow; row++) {
                if (me.tileGrid[me.theoryGrid[col][row].col][me.theoryGrid[col][row].row].tileType != me.BLOCK && me.chekGlows(col,row)) {
                    if (showGlows){me.tileGrid[me.theoryGrid[col][row].col][me.theoryGrid[col][row].row].children[0].visible = true;}
                    me.tileGrid[me.theoryGrid[col][row].col][me.theoryGrid[col][row].row].isGlow = true;
                    isGloved = true;
                }
                else {
                    me.tileGrid[me.theoryGrid[col][row].col][me.theoryGrid[col][row].row].children[0].visible = false;
                    me.tileGrid[me.theoryGrid[col][row].col][me.theoryGrid[col][row].row].isGlow = false;
                }
            }
        }
        return isGloved;   
    },

    turnOffGlows: function () {
        var me = this;
        for(var col = 0; col < me.sizeCol; col++) {
            for(var row = 0; row < me.sizeRow; row++) {
                me.tileGrid[col][row].children[0].visible = false;
                me.tileGrid[col][row].isGlow = false;
            }
        }
        for (var col = 0; col < me.tempSize; col++) {
            me.tempTile[col].children[0].visible = false;
        }
    },

    tileGridColUpdate: function (movingCol) {
        var me = this;
        var tempArray = [];
        for(var row = 0; row < me.sizeRow; row++) {
           tempArray[row] = me.tileGrid[movingCol][me.theoryGrid[movingCol][row].row];    
        }
        for(var row = 0; row < me.sizeRow; row++) {
           me.tileGrid[movingCol][row] = tempArray[row];
           me.tileGrid[movingCol][row].row = row;
           me.theoryGrid[movingCol][row].row = row;
        }
    },

    tileGridRowUpdate: function (movingRow) {
        var me = this;
        var tempArray = [];
        for(var col = 0; col < me.sizeCol; col++) {
           tempArray[col] = me.tileGrid[me.theoryGrid[col][movingRow].col][movingRow];    
        }
        for(var col = 0; col < me.sizeCol; col++) {
           me.tileGrid[col][movingRow] = tempArray[col];
           me.tileGrid[col][movingRow].col = col;
           me.theoryGrid[col][movingRow].col = col;
        }
    },

    removeGlowTiles: function () {
        var me = this;
        var score = 0;
        me.isGloved = false;
        for(var col = 0; col < me.sizeCol; col++) {
            for(var row = 0; row < me.sizeRow; row++) {
                if (me.tileGrid[col][row].isGlow) {
                    me.tileGrid[col][row].visible = false;
                    me.tileGrid[col][row].children[0].visible = false;
                    me.tileGrid[col][row].isGlow = false;
                    me.tileGrid[col][row].tileType = me.EMPTY;
                    score++;
                } 
            }
        }
        return score;
    },

    fillDownEmptyInRow: function (movingRow) {
        var me = this;
        var downEmptyPos = -1;
        col = me.sizeCol;
        while (col>0 && me.tileGrid[col-1][movingRow].tileType != me.EMPTY) {col--;}
        if (col>0) {
            me.tileGrid[col-1][movingRow].tileColor = me.random.integerInRange(0, me.glowColors.length - 1);
            me.tileGrid[col-1][movingRow].tint = me.glowColors[me.tileGrid[col-1][movingRow].tileColor]; 
            me.tileGrid[col-1][movingRow].children[0].tint = me.glowColors[me.tileGrid[col-1][movingRow].tileColor];
            me.tileGrid[col-1][movingRow].tileType = me.TILE;
            downEmptyPos = col;
        }
        return downEmptyPos;
    },

    chekDownEmpties: function () {
        var me = this;
        var flag = false;
        for (var row = 0; row<me.sizeRow; row++) {
            me.allDownRows[row] = me.fillDownEmptyInRow(row);
            if (me.allDownRows[row] != -1) {flag = true;}
        }
        if (flag) {me.distY = 0; me.isFilling = true;}
        else {
            me.isGloved = me.turnOnGlows(false);
            if (!me.isGloved){me.input.onDown.add(me.pickTile, me);}
            else {
                me.scoreSum+= me.removeGlowTiles();
                for (var row = 0; row<me.sizeRow; row++) {
                    me.allDownRows[row] = me.fillDownEmptyInRow(row);       
                }
                me.distY = 0; me.isFilling = true;
            }
        }

    },

    delta: function (dist, step) {
        var delta;
        if (dist>=0){var delta = (dist+.5*step)%step - .5*step;}
        else {var delta = (dist-.5*step+1)%step + .5*step;}
        return delta;
    },

    pointCol: function (y) {
        var me = this;
        return Math.floor((y-me.zeroPointY+Math.round(0.5*me.stepTileY))/me.stepTileY);
    },

    pointRow: function (x) {
        var me = this;
        return Math.floor((x-me.zeroPointX+Math.round(0.5*me.stepTileX))/me.stepTileX);
    },

    ArrayRotate: function (a,p) {
        for(var l = a.length, p = (Math.abs(p) >= l && (p %= l), p < 0 && (p += l), p), i, x; p; p = (Math.ceil(l / p) - 1) * p - l + (l = p))
            for(i = l; i > p; x = a[--i], a[i] = a[i - p], a[i - p] = x);
        return a;
    },

    dargging: function () {
        var me = this;
        me.distX = me.input.worldX-me.startX;
        me.distY = me.input.worldY-me.startY;
        switch(me.dragDirection){                    
            case '':
                me.takeDirection();
                       
            break;             
            case 'horizontal':
                me.horizontalMoving(me.movingCol, me.distX);
                me.isGloved = me.turnOnGlows(true);
                me.showTempTilesHorizontal(me.movingCol, me.distX);  
            break;          
            case 'vertical':
                me.verticalMoving(me.movingRow, me.distY);
                me.isGloved = me.turnOnGlows(true);
                me.showTempTilesVertical(me.movingRow, me.distY);
            break;
        }
    },

    relising: function () {
        var me = this;
        switch(me.dragDirection){                                 
            case 'horizontal':
                if (me.distX !=0){
                    me.step = Math.ceil(Math.abs(me.distX/10));
                    if (Math.abs(me.distX)<me.step) {me.distX = 0;}
                    else {
                        if (me.distX > 0) {me.distX -= me.step;} else {me.distX += me.step;}
                    }
                    
                    me.horizontalMoving(me.movingCol, me.distX);
                    me.showTempTilesHorizontal(me.movingCol, me.distX);
                } 
                else {
                    me.isRelising = false;
                    me.dragDirection = '';
                    if (me.isGloved) {me.scoreSum+= me.removeGlowTiles(); me.chekDownEmpties();} 
                    else {me.input.onDown.add(me.pickTile, me);}  
                }  
            break;          
            case 'vertical':
                if (me.distY !=0){
                    me.step = Math.ceil(Math.abs(me.distY/10));
                    if (Math.abs(me.distY)<me.step) {me.distY = 0;}
                    else {
                        if (me.distY > 0) {me.distY -= me.step;} else {me.distY += me.step;}
                    }
                    me.verticalMoving(me.movingRow, me.distY);
                    me.showTempTilesVertical(me.movingRow, me.distY);
                }
                else {
                    me.isRelising = false;
                    me.dragDirection = '';
                    if (me.isGloved) {me.scoreSum+= me.removeGlowTiles(); me.chekDownEmpties();} 
                    else {me.input.onDown.add(me.pickTile, me);}
                }
            break;
        }
    },

    filling: function () {
        var me = this;
        if (me.distY < me.tileSizeY){
            me.distY +=15;
            if (me.distY>me.tileSizeY) {me.distY = me.tileSizeY;}
            for (var row = 0; row < me.sizeRow; row++) {
                if (me.allDownRows[row] !=-1) {
                    me.verticalMoving(row, me.distY, me.allDownRows[row]);
                    me.showTempTilesVertical(row, me.distY, me.allDownRows[row]);
                    if (me.delta(me.distY, me.stepTileY) <= 0) {
                        me.tileGrid[me.allDownRows[row]-1][row].visible = true;
                        me.tempTile[row].visible = false;
                    }
                }
            }
        }
        else {
            me.isFilling = false;
            for (var row = 0; row < me.sizeRow; row++) {
                if (me.allDownRows[row] !=-1) {me.tileGridRowUpdate(row);}
            } 
            me.chekDownEmpties();
        }
    }

};
