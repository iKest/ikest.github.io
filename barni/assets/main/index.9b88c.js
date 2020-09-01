window.__require=function e(t,n,o){function i(a,s){if(!n[a]){if(!t[a]){var l=a.split("/");if(l=l[l.length-1],!t[l]){var r="function"==typeof __require&&__require;if(!s&&r)return r(l,!0);if(c)return c(l,!0);throw new Error("Cannot find module '"+a+"'")}a=l}var u=n[a]={exports:{}};t[a][0].call(u.exports,function(e){return i(t[a][1][e]||e)},u,u.exports,e,t,n,o)}return n[a].exports}for(var c="function"==typeof __require&&__require,a=0;a<o.length;a++)i(o[a]);return i}({Level1GameplayLogic:[function(e,t,n){"use strict";cc._RF.push(t,"13c44Bed6FC9at3by0LwLZG","Level1GameplayLogic"),cc.Class({extends:cc.Component,properties:{clickableNodesContainer:{default:null,type:cc.Node},backgroundNode:{default:null,type:cc.Node},amendmentPopup:{default:null,type:cc.Node},textPanel:{default:null,type:cc.Node},textLabelPrefab:{default:null,type:cc.Prefab},wrongPrefab:{default:null,type:cc.Prefab},boingStarPrefab:{default:null,type:cc.Prefab},fireWorksPrefab:{default:null,type:cc.Prefab},animNode:{default:null,type:cc.Node},particleNode:{default:null,type:cc.Node},rightAudio:{default:null,type:cc.AudioClip},wrongAudio:{default:null,type:cc.AudioClip},winAudio:{default:null,type:cc.AudioClip},helpButton:{default:null,type:cc.Button},helpNode:{default:null,type:cc.Node}},start:function(){SceneTransitions.in(this.node)},onLoad:function(){this.backgroundNode.on("touchstart",this.onTouchStart,this),this.amendmentPopup.active=!1,this.fillPanel()},onDestroy:function(){this.backgroundNode.off("touchstart",this.onTouchStart,this)},getClickable:function(e){var t;return this.clickableNodesContainer.children.forEach(function(n){if(!n.disableCollide){var o=n.convertToNodeSpaceAR(e.getLocation()),i=n.getComponent(cc.PolygonCollider),c=n.getComponent(cc.CircleCollider),a=n.getComponent(cc.BoxCollider);if(i&&i.enabled)cc.Intersection.pointInPolygon(o,i.world.points)&&(t=n);else if(c&&c.enabled){Math.sqrt(Math.pow(o.x-c.offset.x,2)+Math.pow(o.y-c.offset.y,2))<=c.radius&&(t=n)}else if(a&&a.enabled){var s=o.x>=a.offset.x-a.size.width/2&&o.x<=a.offset.x+a.size.width/2,l=o.y>=a.offset.y-a.size.height/2&&o.y<=a.offset.y+a.size.height/2;s&&l&&(t=n)}}}),t},disableClickable:function(e){e.removeComponent(cc.PolygonCollider),e.removeComponent(cc.CircleCollider),e.removeComponent(cc.BoxCollider),e.disableCollide=!0},animateClickable:function(e){var t=this;this.inputLocked=!0,this.helpButton.interactable=!1,this.disableClickable(e),this.animNode.setPosition(e.getPosition()),this.animNode.active=!0,this.animNode.opacity=255,this.particleNode.setPosition(this.animNode.getPosition()),this.particleNode.active=!0,this.particleNode.getComponent(cc.ParticleSystem).resetSystem();var n=cc.bezierTo(1,[cc.v2(e.x,e.y),cc.v2(e.x<0?600:-600,0),cc.v2(this.textPanel.x+this.textPanel.width/2,this.textPanel.y+this.textPanel.height/2)]),o=300*Math.random()-600;this.animNode.runAction(cc.sequence(cc.spawn(n,cc.fadeTo(1,200),cc.rotateBy(1,o)),cc.callFunc(function(){return t.showPopup(e)})))},fillPanel:function(){var e=this;this.clickableNodesContainer.children.forEach(function(t){var n=cc.instantiate(e.textLabelPrefab);n.getComponent(cc.Label).string=t.name,n.clickableName=t.name,e.textPanel.addChild(n)})},removeTextLabel:function(e){this.textPanel.children.forEach(function(t){t.clickableName===e.name&&(t.active=!1)})},checkWin:function(){var e=!0;this.textPanel.children.forEach(function(t){t.active&&(e=!1)}),e&&this.win()},win:function(){var e=this;cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume/3),cc.audioEngine.play(this.winAudio,!1,.5),this.schedule(function(){SceneTransitions.out(e.node,function(){cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume),cc.director.loadScene("level1Win")})},2)},showPopup:function(e){var t=e.getComponent("amendment");t&&(this.removeTextLabel(e),this.animNode.active=!1,this.particleNode.active=!1,this.particleNode.getComponent(cc.ParticleSystem).stopSystem(),this.popupShown=!0,e.children[0].active=!0,cc.find("Content/Title",this.amendmentPopup).getComponent(cc.Label).string=t.title.toUpperCase(),cc.find("Content/Text1",this.amendmentPopup).getComponent(cc.Label).string=t.text1,cc.find("Content/Image",this.amendmentPopup).getComponent(cc.Sprite).spriteFrame=t.image1,cc.Tween.stopAllByTarget(this.amendmentPopup),cc.tween(this.amendmentPopup).set({opacity:0,scale:0,active:!0}).to(.6,{opacity:255,scale:1},{easing:"backOut"}).start())},closePopup:function(){this.inputLocked&&(cc.Tween.stopAllByTarget(this.amendmentPopup),cc.tween(this.amendmentPopup).to(.4,{opacity:0,scale:0},{easing:"backIn"}).call(this._closePopup,this).start())},_closePopup:function(){this.amendmentPopup.active=!1,this.popupShown=!1,this.inputLocked=!1,this.helpButton.interactable=!0,this.checkWin()},showWrong:function(e){var t=cc.instantiate(this.wrongPrefab),n=this.node.convertToNodeSpaceAR(e.getLocation());t.setPosition(n),cc.tween(t).set({opacity:0,scale:0}).to(.2,{opacity:255,scale:.5}).to(.3,{opacity:0,scale:0}).call(t.destroy,t).start(),this.node.addChild(t)},showBoingStar:function(e){var t=cc.instantiate(this.boingStarPrefab),n=this.node.convertToNodeSpaceAR(e.getLocation());t.setPosition(n),this.node.addChild(t)},showFireWorks:function(e){var t=cc.instantiate(this.fireWorksPrefab),n=this.node.convertToNodeSpaceAR(e.getLocation());t.setPosition(n),this.node.addChild(t)},musicButtonPressed:function(e){var t=cc.find("Background/On",e.target),n=cc.find("Background/Off",e.target);cc.audioEngine.getVolume(GlobalData.musicId)<GlobalData.musicVolume?(cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume),t.active=!0):(cc.audioEngine.setVolume(GlobalData.musicId,0),t.active=!1),n.active=!t.active},helpButtonPressed:function(){var e=this.clickableNodesContainer.children.filter(function(e){return!e.disableCollide});if(!(e.length<1)){e=e[0];var t=300*Math.random()-600;cc.Tween.stopAllByTarget(this.helpNode),cc.tween(this.helpNode).set({opacity:200,x:this.helpButton.node.x,y:this.helpButton.node.y,scale:.3,angle:0}).to(1.75,{x:e.x,y:e.y,scale:.4,angle:t},{easing:"elasticOut"}).to(.3,{opacity:0,scale:1.5}).start()}},onTouchStart:function(e){if(!this.inputLocked){var t=this.getClickable(e);t?(cc.audioEngine.play(this.rightAudio),this.showFireWorks(e),this.animateClickable(t)):(cc.audioEngine.play(this.wrongAudio),this.showBoingStar(e),this.showWrong(e))}},update:function(){this.helpButton.node.y=this.textPanel.y+this.textPanel.height+this.helpButton.node.height/2,this.particleNode.active&&this.particleNode.setPosition(this.animNode.getPosition())}}),cc._RF.pop()},{}],Level1MenuLogic:[function(e,t,n){"use strict";cc._RF.push(t,"f7a9a9c4VdCdJ6wmq/AXkFs","Level1MenuLogic"),cc.Class({extends:cc.Component,properties:{music:{default:null,type:cc.AudioClip}},start:function(){SceneTransitions.in(this.node)},startButtonPressed:function(){GlobalData.musicId=cc.audioEngine.play(this.music,!0,GlobalData.musicVolume),SceneTransitions.out(this.node,function(){return cc.director.loadScene("level1Gameplay")})}}),cc._RF.pop()},{}],Level1WinLogic:[function(e,t,n){"use strict";cc._RF.push(t,"21620p3gtJNmpHRlPxB+zNb","Level1WinLogic"),cc.Class({extends:cc.Component,properties:{confetti0Node:{default:null,type:cc.Node},confetti1Node:{default:null,type:cc.Node},confetti2Node:{default:null,type:cc.Node},confetti3Node:{default:null,type:cc.Node},confetti4Node:{default:null,type:cc.Node},confetti5Node:{default:null,type:cc.Node},confetti6Node:{default:null,type:cc.Node},confetti7Node:{default:null,type:cc.Node},confetti8Node:{default:null,type:cc.Node}},start:function(){SceneTransitions.in(this.node);var e=cc.view.getCanvasSize().height+200,t=cc.view.getCanvasSize().width;this.confetti0Node.y=e,this.confetti0Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti1Node.y=e,this.confetti1Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti2Node.y=e,this.confetti2Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti3Node.y=e,this.confetti3Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti4Node.y=e,this.confetti4Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti5Node.y=e,this.confetti5Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti6Node.y=e,this.confetti6Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti7Node.y=e,this.confetti7Node.getComponent(cc.ParticleSystem).posVar.x=t,this.confetti8Node.y=e,this.confetti8Node.getComponent(cc.ParticleSystem).posVar.x=t},restartButtonPressed:function(){SceneTransitions.out(this.node,function(){return cc.director.loadScene("level2Menu")})},shareButtonPressed:function(){VkSupport.share()}}),cc._RF.pop()},{}],amendment:[function(e,t,n){"use strict";cc._RF.push(t,"44459KVTbpIBIiuqACPqhG+","amendment"),cc.Class({extends:cc.Component,properties:{title:"\u041f\u043e\u043f\u0440\u0430\u0432\u043a\u0430 \u0425",image1:{default:null,type:cc.SpriteFrame},text1:{default:"",multiline:!0}}}),cc._RF.pop()},{}],customResolution:[function(e,t,n){"use strict";cc._RF.push(t,"fc0be5gKA1Am5rfbong5Jkt","customResolution"),cc.Class({extends:cc.Component,properties:{},onLoad:function(){this.canvas=cc.find("Canvas"),this.canvasWidget=this.canvas.getComponent(cc.Widget),this.designSize=cc.view.getDesignResolutionSize(),cc.view.setDesignResolutionSize(this.designSize.width,this.designSize.height,new cc.ResolutionPolicy(cc.ContainerStrategy.EQUAL_TO_FRAME,new o))},hideAddressBar:function(){setTimeout(function(){window.scrollTo(0,"Android"===cc.sys.os?1:0)},0)}});var o=cc.Class({extends:cc.ContentStrategy,apply:function(e,t){var n,o,i=cc.game.canvas.width,c=cc.game.canvas.height,a=t.width,s=t.height,l=i/a,r=c/s,u=0,d=c/i,p=s/a;return l<r?(u=l,n=i,o=a*Math.max(d,p)*u):(n=a*(u=r),o=c),this._buildResult(i,c,n,o,u,u)}});cc._RF.pop()},{}],disableOnClick:[function(e,t,n){"use strict";cc._RF.push(t,"3599dvMY9NILakJB2+3rB5F","disableOnClick"),cc.Class({extends:cc.Component,properties:{},start:function(){this.node.on("click",function(e){e.interactable=!1,document.body.style.cursor="auto"})}}),cc._RF.pop()},{}],hoverCursor:[function(e,t,n){"use strict";cc._RF.push(t,"88d5dy/LHFP7oRB7gMYAJim","hoverCursor"),cc.Class({extends:cc.Component,properties:{},start:function(){this.node.on("mouseenter",function(e){return document.body.style.cursor="pointer"}),this.node.on("mouseleave",function(e){return document.body.style.cursor="auto"})}}),cc._RF.pop()},{}],level2GameplayLogic:[function(e,t,n){"use strict";cc._RF.push(t,"6fab3YOYHxIWJXdSbOE/5Pl","level2GameplayLogic"),cc.Class({extends:cc.Component,properties:{clickableNodesContainer:{default:null,type:cc.Node},backgroundNode:{default:null,type:cc.Node},amendmentPopup:{default:null,type:cc.Node},textPanel:{default:null,type:cc.Node},textLabelPrefab:{default:null,type:cc.Prefab},wrongPrefab:{default:null,type:cc.Prefab},animNode:{default:null,type:cc.Node},rightAudio:{default:null,type:cc.AudioClip},wrongAudio:{default:null,type:cc.AudioClip},winAudio:{default:null,type:cc.AudioClip},helpButton:{default:null,type:cc.Button},helpNode:{default:null,type:cc.Node}},start:function(){SceneTransitions.in(this.node)},onLoad:function(){this.backgroundNode.on("touchstart",this.onTouchStart,this),this.amendmentPopup.active=!1,this.fillPanel()},onDestroy:function(){this.backgroundNode.off("touchstart",this.onTouchStart,this)},getClickable:function(e){var t;return this.clickableNodesContainer.children.forEach(function(n){if(!n.disableCollide){var o=n.convertToNodeSpaceAR(e.getLocation()),i=n.getComponent(cc.PolygonCollider),c=n.getComponent(cc.CircleCollider),a=n.getComponent(cc.BoxCollider);if(i&&i.enabled)cc.Intersection.pointInPolygon(o,i.world.points)&&(t=n);else if(c&&c.enabled){Math.sqrt(Math.pow(o.x-c.offset.x,2)+Math.pow(o.y-c.offset.y,2))<=c.radius&&(t=n)}else if(a&&a.enabled){var s=o.x>=a.offset.x-a.size.width/2&&o.x<=a.offset.x+a.size.width/2,l=o.y>=a.offset.y-a.size.height/2&&o.y<=a.offset.y+a.size.height/2;s&&l&&(t=n)}}}),t},disableClickable:function(e){e.removeComponent(cc.PolygonCollider),e.removeComponent(cc.CircleCollider),e.removeComponent(cc.BoxCollider),e.disableCollide=!0},animateClickable:function(e){var t=this;this.inputLocked=!0,this.helpButton.interactable=!1,this.disableClickable(e),this.animNode.setPosition(e.getPosition()),this.animNode.active=!0,this.animNode.opacity=255;var n=cc.bezierTo(1,[cc.v2(e.x,e.y),cc.v2(e.x<0?600:-600,0),cc.v2(this.textPanel.x+this.textPanel.width/2,this.textPanel.y+this.textPanel.height/2)]),o=300*Math.random()-600;this.animNode.runAction(cc.sequence(cc.spawn(n,cc.fadeTo(1,200),cc.rotateBy(1,o)),cc.callFunc(function(){return t.showPopup(e)})))},fillPanel:function(){var e=this;this.clickableNodesContainer.children.forEach(function(t){var n=cc.instantiate(e.textLabelPrefab);n.getComponent(cc.Label).string=t.name,n.clickableName=t.name,e.textPanel.addChild(n)})},removeTextLabel:function(e){this.textPanel.children.forEach(function(t){t.clickableName===e.name&&(t.active=!1)})},checkWin:function(){var e=!0;this.textPanel.children.forEach(function(t){t.active&&(e=!1)}),e&&this.win()},win:function(){var e=this;cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume/3),cc.audioEngine.play(this.winAudio,!1,.5),this.schedule(function(){SceneTransitions.out(e.node,function(){cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume),cc.director.loadScene("level2Win")})},2)},showPopup:function(e){var t=e.getComponent("amendment");t&&(this.removeTextLabel(e),this.animNode.active=!1,this.popupShown=!0,e.children[0].active=!0,cc.find("Content/Title",this.amendmentPopup).getComponent(cc.Label).string=t.title.toUpperCase(),cc.find("Content/Text1",this.amendmentPopup).getComponent(cc.Label).string=t.text1,cc.find("Content/Image",this.amendmentPopup).getComponent(cc.Sprite).spriteFrame=t.image1,cc.Tween.stopAllByTarget(this.amendmentPopup),cc.tween(this.amendmentPopup).set({opacity:0,scale:0,active:!0}).to(.6,{opacity:255,scale:1},{easing:"backOut"}).start())},closePopup:function(){this.inputLocked&&(cc.Tween.stopAllByTarget(this.amendmentPopup),cc.tween(this.amendmentPopup).to(.4,{opacity:0,scale:0},{easing:"backIn"}).call(this._closePopup,this).start())},_closePopup:function(){this.amendmentPopup.active=!1,this.popupShown=!1,this.inputLocked=!1,this.helpButton.interactable=!0,this.checkWin()},showWrong:function(e){var t=cc.instantiate(this.wrongPrefab),n=this.node.convertToNodeSpaceAR(e.getLocation());t.setPosition(n),cc.tween(t).set({opacity:0,scale:0}).to(.2,{opacity:255,scale:.5}).to(.3,{opacity:0,scale:0}).call(t.destroy,t).start(),this.node.addChild(t)},musicButtonPressed:function(e){var t=cc.find("Background/On",e.target),n=cc.find("Background/Off",e.target);cc.audioEngine.getVolume(GlobalData.musicId)<GlobalData.musicVolume?(cc.audioEngine.setVolume(GlobalData.musicId,GlobalData.musicVolume),t.active=!0):(cc.audioEngine.setVolume(GlobalData.musicId,0),t.active=!1),n.active=!t.active},helpButtonPressed:function(){var e=this.clickableNodesContainer.children.filter(function(e){return!e.disableCollide});if(!(e.length<1)){e=e[0];var t=300*Math.random()-600;cc.Tween.stopAllByTarget(this.helpNode),cc.tween(this.helpNode).set({opacity:200,x:this.helpButton.node.x,y:this.helpButton.node.y,scale:.3,angle:0}).to(1.75,{x:e.x,y:e.y,scale:.4,angle:t},{easing:"elasticOut"}).to(.3,{opacity:0,scale:1.5}).start()}},onTouchStart:function(e){if(!this.inputLocked){var t=this.getClickable(e);t?(cc.audioEngine.play(this.rightAudio),this.animateClickable(t)):(cc.audioEngine.play(this.wrongAudio),this.showWrong(e))}},update:function(){this.helpButton.node.y=this.textPanel.y+this.textPanel.height+this.helpButton.node.height/2}}),cc._RF.pop()},{}],level2MenuLogic:[function(e,t,n){"use strict";cc._RF.push(t,"37fe0bFI3dFoJ3FaXeM59tU","level2MenuLogic"),cc.Class({extends:cc.Component,start:function(){SceneTransitions.in(this.node)},startButtonPressed:function(){SceneTransitions.out(this.node,function(){return cc.director.loadScene("level2Gameplay")})}}),cc._RF.pop()},{}],level2WinLogic:[function(e,t,n){"use strict";cc._RF.push(t,"664dfeHeC9Bdr1wT00WRtjK","level2WinLogic"),cc.Class({extends:cc.Component,properties:{},start:function(){SceneTransitions.in(this.node)},restartButtonPressed:function(){SceneTransitions.out(this.node,function(){return cc.director.loadScene("level1Gameplay")})},shareButtonPressed:function(){VkSupport.share()}}),cc._RF.pop()},{}],scenePreloader:[function(e,t,n){"use strict";function o(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=i(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var o=0;return function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(n=e[Symbol.iterator]()).next.bind(n)}function i(e,t){if(e){if("string"==typeof e)return c(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?c(e,t):void 0}}function c(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}cc._RF.push(t,"4fd7cggK15F1rl1gxc/fYYH","scenePreloader"),cc.Class({extends:cc.Component,properties:{sceneNames:[cc.String]},start:function(){for(var e,t=function(){var t=e.value;cc.director.preloadScene(t,function(){return cc.log("Scene preloaded: "+t)})},n=o(this.sceneNames);!(e=n()).done;)t()}}),cc._RF.pop()},{}],"soundOnClick - 001":[function(e,t,n){"use strict";cc._RF.push(t,"ca4d8qCPVJIgroEmvoae8Ck","soundOnClick - 001"),cc.Class({extends:cc.Component,properties:{audio:{default:null,type:cc.AudioClip},loop:!1,volume:1},start:function(){var e=this;this.node.on("click",function(t){cc.audioEngine.play(e.audio,e.loop,e.volume)})}}),cc._RF.pop()},{}]},{},["Level1GameplayLogic","Level1MenuLogic","Level1WinLogic","level2GameplayLogic","level2MenuLogic","level2WinLogic","amendment","customResolution","disableOnClick","hoverCursor","scenePreloader","soundOnClick - 001"]);