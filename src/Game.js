



BasicGame.Game = function (game) {};

BasicGame.Game.prototype = {

    init: function () {

        var me = this;
        console.log('init:',me);


        me.glowColors = [0xFFDEAD,0xB0E0E6,0xFFFFFF,0x90EE90,0xFFC0CB,0xFAA460,0xF0E68C];
        me.tileColors = ['fairy1','fairy2','fairy3','fairy4','fairy5','fairy6','fairy7'];
        me.sizeColors = me.glowColors.length;
        me.BLOCK = 0;
        me.EMPTY = 1;
        me.TILE = 2;

        me.NOLOCK = 0;
        me.LOCK = 1;
        me.MOVINGLOCK = 2;


        me.levelGrid = [0, 0, 1, 1, 1, 1, 0, 0,
                        0, 1, 1, 1, 1, 1, 1, 0,
                        1, 1, 1, 0, 0, 1, 1, 1,
                        1, 1, 0, 1, 1, 0, 1, 1,
                        1, 1, 0, 1, 1, 0, 1, 1,
                        1, 1, 1, 0, 0, 1, 1, 1,
                        0, 1, 1, 1, 1, 1, 1, 0,
                        0, 0, 1, 1, 1, 1, 0, 0];


        me.animFairy =[[],[],[],[],[],[],[]];
   
        for (var i = 0; i < 36; i++) {
            me.animFairy[0][i] = i;
            me.animFairy[1][i] = i + 36;
            me.animFairy[2][i] = i + 72;
            me.animFairy[3][i] = i + 108;
            me.animFairy[4][i] = i + 144;
            me.animFairy[5][i] = i + 180;
            me.animFairy[6][i] = i + 216;
        }
        for (var i = 34; i > -1; i--) {
            me.animFairy[0][70-i] = i;
            me.animFairy[1][70-i] = i + 36;
            me.animFairy[2][70-i] = i + 72;
            me.animFairy[3][70-i] = i + 108;
            me.animFairy[4][70-i] = i + 144;
            me.animFairy[5][70-i] = i + 180;
            me.animFairy[6][70-i] = i + 216;
        }

        
        me.sizeRow = 8;
        me.sizeCol = me.levelGrid.length/me.sizeRow;
        me.allLenght = me.levelGrid.length;

        me.tileSizeX = 80;
        me.tileSizeY = 80;
        me.stepTileX = 80;
        me.stepTileY = 80;
        me.zeroPointX = 40;
        me.zeroPointY = 200;
        me.isGloved = false;
        me.isDragging = false;
        me.dragDirection = '';
        me.isRelising = false;
        me.allDownRows = [];
        me.allLocks = 0;
        me.maxLocks = 6;
        me.chanceLock = 70;

        me.distX = 0;
        me.distY = 0;
        me.movingCol = 0;
        me.movingRow = 0;
        me.isGloved = false;
        me.isFilling = false;
        me.scoreSum = 0;
    },

    create: function () {

        var me = this;
         console.log('create:', me);

        me.mask = me.game.add.graphics(0,0);
        me.mask.beginFill(0x000000);
        me.mask.alpha = 0;      
        me.mask.drawRect(me.zeroPointX-.5*me.stepTileX, me.zeroPointY-.5*me.stepTileY, me.stepTileX*me.sizeRow, me.stepTileY*me.sizeCol);

        me.lockRows = [];
        me.lockCols = [];
        var i = me.sizeCol;
        while (i--) {
            me.lockCols[i] = {
                leftShift: 0,
                rightShift: 0,
                locked: false
            };
        }

        var i = me.sizeRow;
        while (i--) {
            me.lockRows[i] = {
                leftShift: 0,
                rightShift: 0,
                locked: false
            };
        }
        me.bg = me.add.image(0, 160, 'bg');
        me.animLockArr = [];
        me.animMovingLockArr = [];
        me.lockanim = ['', 'lock', 'movinglock'];
        me.animLockArr = Phaser.ArrayUtils.numberArrayStep(59, 0, -1);
        me.animMovingLockArr = Phaser.ArrayUtils.numberArrayStep(119, 60, -1);

        me.tileGrid = [];
        me.theoryGrid = [];
        me.theoryGrid = Phaser.ArrayUtils.numberArray(0, me.allLenght-1);
        var i = me.allLenght;
        while(i--){
                me.tileGrid[i] = me.add.sprite(me.zeroPointX + me.Row(i)*me.stepTileX, me.zeroPointY+me.Col(i)*me.stepTileY, 'fairies');
                me.tileGrid[i].anchor.setTo(0.5, 0.5);
                me.tileGrid[i].mask = me.mask;
                me.tileGrid[i].isGlow = false;
                me.tileGrid[i].lockType = me.NOLOCK;
                me.tileGrid[i].tileType = me.levelGrid[i];
                me.tileGrid[i].tileColor = 0;
                me.tileGrid[i].pos = i;
                me.tileGrid[i].animations.add('fairy1', me.animFairy[0], 20, true);
                me.tileGrid[i].animations.add('fairy2', me.animFairy[1], 20, true); 
                me.tileGrid[i].animations.add('fairy3', me.animFairy[2], 20, true); 
                me.tileGrid[i].animations.add('fairy4', me.animFairy[3], 20, true); 
                me.tileGrid[i].animations.add('fairy5', me.animFairy[4], 20, true); 
                me.tileGrid[i].animations.add('fairy6', me.animFairy[5], 20, true); 
                me.tileGrid[i].animations.add('fairy7', me.animFairy[6], 20, true); 
                me.glow = me.add.sprite(0, 0, 'light');
                me.glow.anchor.setTo(0.5, 0.5);
                me.glow.alpha = 0.5;
                me.glow.scale.setTo(.5,.5);
                me.tileGrid[i].addChild(me.glow);
                me.tileGrid[i].children[0].visible = false;
                me.locker = me.add.sprite(0, 0, 'locker');
                me.locker.anchor.setTo(0.5, 0.5);
                me.tileGrid[i].addChild(me.locker);
                me.tileGrid[i].children[1].visible = false;
                me.tileGrid[i].children[1].animations.add('lock', me.animLockArr, 1).onComplete.add(me.removeLock ,me);
                me.tileGrid[i].children[1].animations.add('movinglock', me.animMovingLockArr, 1).onComplete.add(me.removeLock ,me);
        }
        var i = me.allLenght;
        while (i--){
            if (me.tileGrid[i].tileType != me.BLOCK) {
                me.fillEmptyTile(me.tileGrid[i]);
            } 
            else {me.tileGrid[i].visible = false;}
        }

        me.tempSize = Math.max(me.sizeCol, me.sizeRow);
        me.tempTile = [];
        var i = me.tempSize;
        while (i--){
            me.tempTile[i] = me.add.sprite(0,0,'fairies');
            me.tempTile[i].anchor.setTo(0.5, 0.5);
           
            me.tempTile[i].mask = me.mask;
            me.glow = me.add.sprite(0, 0, 'light');
            me.glow.anchor.setTo(0.5, 0.5);
            me.glow.alpha = 0.5;
            me.glow.scale.setTo(.5,.5);
            me.tempTile[i].addChild(me.glow);
            me.tempTile[i].children[0].visible = false;    
            me.tempTile[i].visible = false;
            me.locker = me.add.sprite(0, 0, 'locker');
            me.locker.anchor.setTo(0.5, 0.5);
            me.tempTile[i].addChild(me.locker);
            me.tempTile[i].children[1].visible = false; 
        }
        var i = me.allLenght;
        while (i--){
            if (me.tileGrid[i].tileType == me.BLOCK) {
                me.add.sprite(me.zeroPointX + me.Row(i)*me.stepTileX, me.zeroPointY+me.Col(i)*me.stepTileY, 'block').anchor.setTo(.5,.5);    
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
        if (me.movingCol >=0 && me.movingCol < me.sizeCol && me.movingRow >=0 && me.movingRow < me.sizeRow && me.tileGrid[me.Pos(me.movingCol,me.movingRow)].tileType != me.BLOCK){
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
                        me.distX = me.delta(me.distX, me.stepTileX);
                        me.tileGridColUpdate(me.movingCol);    
                    }
                    else {me.turnOffGlows();}
                    me.isRelising = true;
                      
            break;          
                case 'vertical':
                    if (me.isGloved) {
                        me.distY = me.delta(me.distY, me.stepTileY);
                        me.tileGridRowUpdate(me.movingRow);       
                    }
                    else {me.turnOffGlows();}
                    me.isRelising = true;
            break;
        }
    },

    takeDirection: function () {

        var me = this;
        var pos = 0;

        var dist = me.distX*me.distX+me.distY*me.distY;
        if (dist>25) {
            var dragAngle=Math.abs(Math.atan2(me.distY,me.distX));
            if ((dragAngle>Math.PI/4 && dragAngle < 3*Math.PI/4)) {
                me.dragDirection='vertical';
                me.startY += me.distY;
                me.lockUpdate();
            }
            else {
                me.dragDirection='horizontal';
                me.startX += me.distX;  
                me.lockUpdate();
            }
        }
    },

    horizontalMoving: function (movingCol, dist) {
        var me = this;
        var tempArray = [];
        var shiftAmount = Math.ceil(0.5*Math.floor(dist/(0.5*me.stepTileX)));
        var beginGrid = -1;
        var endGrid = me.sizeRow;

        while (beginGrid < me.sizeRow-1 && me.tileGrid[me.Pos(movingCol,beginGrid+1)].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[me.Pos(movingCol,endGrid-1)].tileType == me.BLOCK) {endGrid--;}

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[me.Pos(movingCol,i)].tileType != me.BLOCK){tempArray.push(me.tileGrid[me.Pos(movingCol,i)]);}
        }
        tempArray = me.arrayRotate(tempArray,shiftAmount);
        for (var i=0; i<me.sizeRow; i++) {
            if (me.tileGrid[me.Pos(movingCol,i)].tileType == me.BLOCK){tempArray.splice(i, 0, me.tileGrid[me.Pos(movingCol,i)])}
        }

        var delta = me.delta(dist,me.stepTileX);

        
        for (var i=beginGrid+1; i<endGrid; i++) {
            tempArray[i].x = me.zeroPointX + i*me.stepTileX + delta;
            me.theoryGrid[me.Pos(movingCol,i)] = tempArray[i].pos;
        } 
    },

    verticalMoving : function (movingRow, dist, endGrid) {
        var me = this;
        var tempArray = [];
        var shiftAmount = Math.ceil(0.5*Math.floor(dist/(0.5*me.stepTileY)));
        var beginGrid = -1;
        if (endGrid === undefined) { endGrid = me.sizeCol; } 

        while (beginGrid < endGrid && me.tileGrid[me.Pos(beginGrid+1,movingRow)].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[me.Pos(endGrid-1,movingRow)].tileType == me.BLOCK) {endGrid--;}

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[me.Pos(i,movingRow)].tileType != me.BLOCK){tempArray.push(me.tileGrid[me.Pos(i,movingRow)]);}
        }
        tempArray = me.arrayRotate(tempArray,shiftAmount);
        for (var i=0; i<endGrid; i++) {
            if (me.tileGrid[me.Pos(i,movingRow)].tileType == me.BLOCK){tempArray.splice(i, 0, me.tileGrid[me.Pos(i,movingRow)])}
        }

        var delta = me.delta(dist,me.stepTileX);

        for (var i=beginGrid+1; i<endGrid; i++) {
            tempArray[i].y = me.zeroPointY + i*me.stepTileY + delta;
            me.theoryGrid[me.Pos(i,movingRow)] = tempArray[i].pos;
        } 
    },

    showTempTilesHorizontal: function(movingCol, dist, endGrid) {
        var me = this;

        var beginGrid = -1;
        var endGrid = me.sizeRow;

        while (beginGrid < me.sizeRow-1 && me.tileGrid[me.Pos(movingCol,beginGrid+1)].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[me.Pos(movingCol,endGrid-1)].tileType == me.BLOCK) {endGrid--;}

        var delta = me.delta(dist, me.stepTileX);

        me.tempTile[movingCol].visible = false;
        me.tempTile[movingCol].y = me.zeroPointY + movingCol*me.stepTileY;
        me.tempTile[movingCol].children[0].visible = false;
        if (delta > 0) {
                me.tempTile[movingCol].x = me.zeroPointX + beginGrid*me.stepTileX + delta;
                me.cloneAfromB(me.tempTile[movingCol], me.tileGrid[me.theoryGrid[me.Pos(movingCol,endGrid-1)]]);
        } 
        else if (delta < 0) {
                me.tempTile[movingCol].x = me.zeroPointX + endGrid*me.stepTileX + delta;
                me.cloneAfromB(me.tempTile[movingCol], me.tileGrid[me.theoryGrid[me.Pos(movingCol,beginGrid+1)]]);
        }

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[me.Pos(movingCol,i)].tileType == me.BLOCK) {
                me.tileGrid[me.Pos(movingCol,i)].visible = false;
                me.tileGrid[me.Pos(movingCol,i)].children[0].visible = false;

                if (delta > 0 && me.tileGrid[me.Pos(movingCol,i+1)].tileType !=me.BLOCK) {
                    var j = i;
                    while (j > 0 && me.tileGrid[me.Pos(movingCol,j-1)].tileType == me.BLOCK) {j--;}
                    me.cloneAfromB(me.tileGrid[me.Pos(movingCol,i)], me.tileGrid[me.theoryGrid[me.Pos(movingCol,j-1)]]);
                } 
                else if (delta < 0 && me.tileGrid[me.Pos(movingCol,i-1)].tileType !=me.BLOCK) {
                    var j = i;
                    while (me.tileGrid[me.Pos(movingCol,j+1)].tileType == me.BLOCK) {j++;}
                    me.cloneAfromB(me.tileGrid[me.Pos(movingCol,i)], me.tileGrid[me.theoryGrid[me.Pos(movingCol,j+1)]]);
                }   
            }
        }   
    },

    showTempTilesVertical: function(movingRow, dist, endGrid) {
        var me = this;
        var beginGrid = -1;
        if (endGrid === undefined) { endGrid = me.sizeCol; }

        while (beginGrid < endGrid && me.tileGrid[me.Pos(beginGrid+1,movingRow)].tileType == me.BLOCK) {beginGrid++;}
        while (endGrid > 0 && me.tileGrid[me.Pos(endGrid-1,movingRow)].tileType == me.BLOCK) {endGrid--;}

        var delta = me.delta(dist, me.stepTileY);

        me.tempTile[movingRow].visible = false;
        me.tempTile[movingRow].x = me.zeroPointX + movingRow*me.stepTileX;
        me.tempTile[movingRow].children[0].visible = false;
        if (delta > 0) {
                me.tempTile[movingRow].y = me.zeroPointY + beginGrid*me.stepTileY + delta;
                me.cloneAfromB(me.tempTile[movingRow], me.tileGrid[me.theoryGrid[me.Pos(endGrid-1,movingRow)]]);

        } 
        else if (delta < 0) {
                me.tempTile[movingRow].y = me.zeroPointY + endGrid*me.stepTileY + delta;
                me.cloneAfromB(me.tempTile[movingRow], me.tileGrid[me.theoryGrid[me.Pos(beginGrid+1,movingRow)]]);
        }

        for (var i=beginGrid+1; i<endGrid; i++) {
            if (me.tileGrid[me.Pos(i,movingRow)].tileType == me.BLOCK) {
                me.tileGrid[me.Pos(i,movingRow)].visible = false;
                me.tileGrid[me.Pos(i,movingRow)].children[0].visible = false;
                if (delta > 0 && me.tileGrid[me.Pos(i+1,movingRow)].tileType !=me.BLOCK) {
                    var j = i;
                    while (j > 0 && me.tileGrid[me.Pos(j-1,movingRow)].tileType == me.BLOCK) {j--;}
                    me.cloneAfromB(me.tileGrid[me.Pos(i,movingRow)], me.tileGrid[me.theoryGrid[me.Pos(j-1,movingRow)]]);
                } 
                else if (delta < 0 && me.tileGrid[me.Pos(i-1,movingRow)].tileType !=me.BLOCK) {
                    var j = i;
                    while (me.tileGrid[me.Pos(j+1,movingRow)].tileType == me.BLOCK) {j++;}
                    me.cloneAfromB(me.tileGrid[me.Pos(i,movingRow)], me.tileGrid[me.theoryGrid[me.Pos(j+1,movingRow)]]);
                }   
            }
        } 
    },

    chekGlows: function(pos) {
        var me = this;
        var temp = 1;
        var i = me.Col(pos);
        var j = me.Row(pos);
        if (me.tileGrid[me.Pos(i,j)].tileType != me.BLOCK){

            if (j>0 && me.tileGrid[me.Pos(i,j-1)].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i,j-1)]].tileColor){
                    temp++;
                    if (i>0 && me.tileGrid[me.Pos(i-1,j-1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-1,j-1)]].tileColor) {return true;}
                    }
                    if (j>1 && me.tileGrid[me.Pos(i,j-2)].tileType !=me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i,j-2)]].tileColor) {return true;}
                    }
                    if (i<me.sizeCol-1 && me.tileGrid[me.Pos(i+1,j-1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+1,j-1)]].tileColor) {return true;}
                    }
                }
            } 
            if (i<me.sizeCol-1 && me.tileGrid[me.Pos(i+1,j)].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+1,j)]].tileColor){
                    temp++;
                    if (j>0 && me.tileGrid[me.Pos(i+1,j-1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+1,j-1)]].tileColor) {return true;}
                    }
                    if (i<me.sizeCol-2 && me.tileGrid[me.Pos(i+2,j)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+2,j)]].tileColor) {return true;}
                    }
                    if (j<me.sizeRow-1 && me.tileGrid[me.Pos(i+1,j+1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+1,j+1)]].tileColor) {return true;}
                    }
                }
            } 
            if (j<me.sizeRow-1 && me.tileGrid[me.Pos(i,j+1)].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i,j+1)]].tileColor){
                    temp++;
                    if (i<me.sizeCol-1 && me.tileGrid[me.Pos(i+1,j+1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i+1,j+1)]].tileColor) {return true;}
                    }
                    if (j<me.sizeRow-2 && me.tileGrid[me.Pos(i,j+2)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i,j+2)]].tileColor) {return true;}
                    }
                    if (i>0 && me.tileGrid[me.Pos(i-1,j+1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-1,j+1)]].tileColor) {return true;}
                    }
                }
            } 
            if (i>0 && me.tileGrid[me.Pos(i-1,j)].tileType != me.BLOCK){
                if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-1,j)]].tileColor){
                    temp++;
                    if (j<me.sizeRow-1 && me.tileGrid[me.Pos(i-1,j+1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-1,j+1)]].tileColor) {return true;}
                    }
                    if (i>1 && me.tileGrid[me.Pos(i-2,j)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-2,j)]].tileColor) {return true;}
                    }
                    if (j>0 && me.tileGrid[me.Pos(i-1,j-1)].tileType != me.BLOCK) {
                        if (me.tileGrid[me.theoryGrid[pos]].tileColor == me.tileGrid[me.theoryGrid[me.Pos(i-1,j-1)]].tileColor) {return true;}
                    }
                }
            } 
            if (temp>2){return true;}
        }
        return false;
    },

    turnOnGlows: function (showGlows) {
        var me = this;
        var isGloved = false;
        for(var i = 0; i < me.allLenght; i++) {
            if (me.tileGrid[me.theoryGrid[i]].tileType != me.BLOCK && me.chekGlows(i)) {
                if (showGlows){me.tileGrid[me.theoryGrid[i]].children[0].visible = true;}
                me.tileGrid[me.theoryGrid[i]].isGlow = true;
                isGloved = true;
            }
            else {
                me.tileGrid[me.theoryGrid[i]].children[0].visible = false;
                me.tileGrid[me.theoryGrid[i]].isGlow = false;
            }
        }
        return isGloved;   
    },

    turnOffGlows: function () {
        var me = this;
        for(var i = 0; i < me.allLenght; i++) {
            me.tileGrid[i].children[0].visible = false;
            me.tileGrid[i].isGlow = false;
        }
        for (var i = 0; i < me.tempSize; i++) {
            me.tempTile[i].children[0].visible = false;
        }
    },

    tileGridColUpdate: function (movingCol) {
        var me = this;
        var tempArray = [];
        for(var row = 0; row < me.sizeRow; row++) {
           tempArray[row] = me.tileGrid[me.theoryGrid[me.Pos(movingCol,row)]];    
        }
        for(var row = 0; row < me.sizeRow; row++) {
           me.tileGrid[me.Pos(movingCol,row)] = tempArray[row];
           me.tileGrid[me.Pos(movingCol,row)].pos = me.Pos(movingCol,row);
           me.theoryGrid[me.Pos(movingCol,row)] = me.Pos(movingCol,row);
        }
    },

    tileGridRowUpdate: function (movingRow) {
        var me = this;
        var tempArray = [];
        for(var col = 0; col < me.sizeCol; col++) {
           tempArray[col] = me.tileGrid[me.theoryGrid[me.Pos(col,movingRow)]];    
        }
        for(var col = 0; col < me.sizeCol; col++) {
           me.tileGrid[me.Pos(col,movingRow)] = tempArray[col];
           me.tileGrid[me.Pos(col,movingRow)].pos = me.Pos(col, movingRow);
           me.theoryGrid[me.Pos(col,movingRow)] = me.Pos(col,movingRow);
        }
    },

    removeGlowTiles: function () {
        var me = this;
        var score = 0;
        me.isGloved = false;
        for(var i = 0; i < me.allLenght; i++) {
            if (me.tileGrid[i].tileType != me.BLOCK && me.tileGrid[i].isGlow) {
                me.tileGrid[i].animations.stop(me.tileColors[me.tileGrid[i].tileColor]);
                me.tileGrid[i].visible = false;
                me.tileGrid[i].children[0].visible = false;
                me.tileGrid[i].isGlow = false;
                me.tileGrid[i].tileType = me.EMPTY;
                score++;
                if (me.tileGrid[i].lockType != me.NOLOCK) {
                    me.tileGrid[i].children[1].animations.stop(me.lockanim[me.tileGrid[i].lockType], true);
                    me.tileGrid[i].lockType = me.NOLOCK;
                    me.tileGrid[i].children[1].visible = false;
                    me.allLocks--;
                }
            }
        }
        return score;
    },

    fillDownEmptyInRow: function (movingRow) {
        var me = this;
        var downEmptyPos = -1;
        col = me.sizeCol;
        while (col>0 && me.tileGrid[me.Pos(col-1,movingRow)].tileType != me.EMPTY) {col--;}
        if (col>0) {
            me.fillEmptyTile(me.tileGrid[me.Pos(col-1,movingRow)]);
            downEmptyPos = col;
        }
        return downEmptyPos;
    },

    chekDownEmpties: function () {
        var me = this;
        var flag = false;
        for (var row = 0; row < me.sizeRow; row++) {
            me.allDownRows[row] = me.fillDownEmptyInRow(row);
            if (me.allDownRows[row] != -1) {flag = true;}
        }
        if (flag) {me.distY = 0; me.isFilling = true;}
        else {
            me.isGloved = me.turnOnGlows(false);
            if (!me.isGloved){
                me.lockUpdate();
                me.setLock();
                me.input.onDown.add(me.pickTile, me);
            }
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

    arrayRotate: function (a,p) {
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
                if (me.lockCols[me.movingCol].locked) {
                    if (me.distX > me.lockCols[me.movingCol].rightShift) {me.distX = me.lockCols[me.movingCol].rightShift;}
                    else if (me.distX < me.lockCols[me.movingCol].leftShift) {me.distX = me.lockCols[me.movingCol].leftShift;}
                }
                me.horizontalMoving(me.movingCol, me.distX); 
                me.isGloved = me.turnOnGlows(true);
                me.showTempTilesHorizontal(me.movingCol, me.distX);
            break;          
            case 'vertical':
                if (me.lockRows[me.movingRow].locked) {
                    if (me.distY > me.lockRows[me.movingRow].rightShift) {me.distY = me.lockRows[me.movingRow].rightShift;}
                    else if (me.distY < me.lockRows[me.movingRow].leftShift) {me.distY = me.lockRows[me.movingRow].leftShift;}
                }  
                me.verticalMoving(me.movingRow, me.distY);
                me.isGloved = me.turnOnGlows(true);
                me.showTempTilesVertical(me.movingRow, me.distY);
            break;
        }
    },

    relising: function () {
        var me = this;
        var step;
        switch(me.dragDirection){                                 
            case 'horizontal':
                if (me.distX !=0){
                    step = Math.ceil(Math.abs(me.distX/10));
                    if (Math.abs(me.distX)<=step) {me.distX = 0;}
                    else {
                        if (me.distX > 0) {me.distX -= step;} else {me.distX += step;}
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
                    step = Math.ceil(Math.abs(me.distY/10));
                    if (Math.abs(me.distY)<=step) {me.distY = 0;}
                    else {
                        if (me.distY > 0) {me.distY -= step;} else {me.distY += step;}
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
            me.distY +=10;
            if (me.distY>me.tileSizeY) {me.distY = me.tileSizeY;}
            for (var row = 0; row < me.sizeRow; row++) {
                if (me.allDownRows[row] !=-1) {
                    me.verticalMoving(row, me.distY, me.allDownRows[row]);
                    me.showTempTilesVertical(row, me.distY, me.allDownRows[row]);
                    if (me.delta(me.distY, me.stepTileY) <= 0) {
                        me.tileGrid[me.Pos(me.allDownRows[row]-1,row)].visible = true;
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
    },

    setLock: function () {
        var me = this;
        if (me.allLocks < me.maxLocks) {
            if(me.chance(me.chanceLock)) {
                var ableTiles = [];
                for (var pos = 0; pos<me.tileGrid.length; pos++){
                    if (me.tileGrid[pos].tileType!=me.BLOCK && !me.tileGrid[pos].lockType != me.NOLOCK  && !me.lockCols[me.Col(pos)].locked && !me.lockRows[me.Row(pos)].locked) {
                        ableTiles.push(pos);
                    }
                }
                if (ableTiles.length > 0) {
                    pos = me.rnd.integerInRange(0, ableTiles.length - 1);
                    me.tileGrid[ableTiles[pos]].lockType = me.rnd.integerInRange(1, 2);
                    me.tileGrid[ableTiles[pos]].children[1].animations.play(me.lockanim[me.tileGrid[ableTiles[pos]].lockType]);
                    me.tileGrid[ableTiles[pos]].children[1].visible = true;
                    me.lockColUpdate(me.Col(ableTiles[pos]));
                    me.lockRowUpdate(me.Row(ableTiles[pos]));
                    me.allLocks++;
                }
            }
        }
    },


    cloneAfromB: function (a,b) {
        var me = this;
        a.tileColor = b.tileColor;
        a.frame = b.frame;
        a.visible = b.visible;
        a.children[0].tint = me.glowColors[a.tileColor];
        a.children[0].visible = b.children[0].visible;
        a.children[1].tint = me.glowColors[a.tileColor];
        a.children[1].frame = b.children[1].frame;
        a.children[1].alpha = b.children[1].alpha;
        a.children[1].visible = b.children[1].visible;
    },

    fillEmptyTile: function (tile) {
        var me = this;
        var tiles = [];
        var temp = me.sizeColors;
        while (temp--) {
            tile.tileColor = temp;
            if (!me.chekGlows(tile.pos)) {tiles.push(temp);}
        }
        if (tiles.length > 0) {tile.tileColor = tiles[me.rnd.integerInRange(0, tiles.length - 1)];}
        else {tile.tileColor = me.rnd.integerInRange(0, me.sizeColors - 1);}
        tile.animations.play(me.tileColors[tile.tileColor]);
        tile.animations.next(me.rnd.integerInRange(0, me.animFairy[tile.tileColor].length-1));
        tile.children[0].tint = me.glowColors[tile.tileColor];
        tile.children[1].tint = me.glowColors[tile.tileColor];
        tile.tileType = me.TILE;
    },


    Row: function (pos) {var me = this;return pos%me.sizeRow;},
    Col: function (pos) {var me = this;return Math.floor(pos/me.sizeRow);},
    Pos: function (col,row) {var me = this;return col*me.sizeRow+row;},

    chance: function (chance) {
        var me = this;
        if (chance === undefined) { chance = 50; }
        return chance > 0 && (me.rnd.integerInRange(0, 100) <= chance);
    },
    
    lockColUpdate: function (col) {
        var me = this;
        var row = me.sizeRow;
        var left = - me.sizeRow+1;
        var right = me.sizeRow-1;
        var temp = 0;
        var pos;
        me.lockCols[col].locked = false;
        me.lockCols[col].dist = 0;
        me.lockCols[col].moving = false;
        
        while (row--) {
            if (me.tileGrid[me.Pos(col,row)].lockType == me.LOCK) {
                me.lockCols[col].locked = true;
                left = 0; 
                right = 0;
                //me.lockCols[col].rightShift = 10; 
            }
            else if (me.tileGrid[me.Pos(col,row)].lockType == me.MOVINGLOCK) {
                me.lockCols[col].locked = true;
                pos = row;
                temp = 0;               
                while (pos-- && me.tileGrid[me.Pos(col,pos)].tileType !==me.BLOCK){temp--;}
                if (temp > left) {left = temp;}
                pos = row;
                temp = 0;                
                while (pos++ < me.sizeRow-1 && me.tileGrid[me.Pos(col,pos)].tileType !==me.BLOCK){temp++;}
                if (temp < right) {right = temp;}
            }
        }
        if (me.lockCols[col].locked){
            me.lockCols[col].leftShift = left*me.stepTileX-7;
            me.lockCols[col].rightShift = right*me.stepTileX+7; 
        }
    },
    
    lockRowUpdate: function (row) {
        var me = this;
        var col = me.sizeCol;
        var left = - me.sizeCol+1;
        var right = me.sizeCol-1;
        var pos;
        me.lockRows[row].locked = false;
        me.lockRows[row].dist = 0;
        me.lockRows[row].moving = false;
        
        while (col--) {
            if (me.tileGrid[me.Pos(col,row)].lockType == me.LOCK) {
                me.lockRows[row].locked = true;
                left = 0; 
                right = 0;
                //me.lockRows[row].rightShift = 5; 
            }
            else if (me.tileGrid[me.Pos(col,row)].lockType == me.MOVINGLOCK) {
                me.lockRows[row].locked = true;
                pos = col;
                temp = 0;               
                while (pos-- && me.tileGrid[me.Pos(pos,row)].tileType !==me.BLOCK){temp--;}
                if (temp > left) {left = temp;}
                pos = col;
                temp = 0;                
                while (pos++ < me.sizeRow-1 && me.tileGrid[me.Pos(pos,row)].tileType !==me.BLOCK){temp++;}
                if (temp < right) {right = temp;}
            }
        }
        if (me.lockRows[row].locked) {
            me.lockRows[row].leftShift = left*me.stepTileY-7; 
            me.lockRows[row].rightShift = right*me.stepTileY+7;
        }
    },
    


    lockUpdate: function () {
        var me = this;
        var i = me.sizeCol;
        while (i--){
            me.lockColUpdate(i);
        }
        var i = me.sizeRow;
        while (i--){
            me.lockRowUpdate(i);
        }
    },

    removeLock: function (tar) {
        var me = this;
        tar.parent.lockType = me.NOLOCK;
        tar.visible = false;
        me.allLocks--;
    }

};
