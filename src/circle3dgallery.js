/*
The MIT License (MIT)
Copyright (c) 2016 Grzegorz Gorczyca

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software
and to permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/


var circle3DGallery = function() {

    var idPrefix = 'c3dg_';
    var animation;

    var galleryEl;
    var gallerySize = {
        width: 0,
        height: 0
    };

    var radius = 3;
    var zoom = 6;
    var dephModificator = 1000;
    var imagesRatio = 1;

    var images = [];

    var mouseX = 0;
    var mouseY = 0;
    var xSensitivity = 0.00007;
    var ySensitivity = 0.05;

    var xShift = 0
    var yShift = 0;

    var _setup = function(config) {
        if(typeof config !== "object" || config.constructor.name !== "Object") {
            throw 'Wrong config format.'
        }
        galleryEl = document.querySelector(config.gallerySelector);
        if(typeof galleryEl === "undefined") {
            throw 'Gallery element was not found.'
        }

        var tmpXSensitivity = parseInt(config.xSensitivity);
        if(tmpXSensitivity > 0) {
            xSensitivity *= tmpXSensitivity;
        }

        var tmpYSensitivity = parseInt(config.ySensitivity);
        if(tmpYSensitivity > 0) {
            ySensitivity *= tmpYSensitivity;
        }

        var tmpZoom = parseInt(config.zoom);
        if(tmpZoom > 0) {
            zoom *= tmpZoom;
        }
    }

    var _updateGallerySizeAndOffset = function() {
        /*sprawdzić dlaczego jest połowa rozmiaru*/
        gallerySize.width = ~~(galleryEl.offsetWidth / 2);
        gallerySize.height = ~~(galleryEl.offsetHeight / 2);
    }

    var _updateBaseSizeModificator = function() {
        for (var i = 0; i <= images.length; i++) {
            images[i].baseSizeModificatorX = img.startPositionX * (gallerySize.width / zoom );
            images[i].baseSizeModificatorZ = img.startPositionZ * (gallerySize.width / zoom);
        }
    }

    var _getImages = function(config) {
        if(typeof config.images === "object") {
            for(var i in config.images) {
                if(typeof config.images[i] === "string") {
                    images.push({'src': config.images[i]});
                }
            }
        }
        if(config.imagesContainerSelector) {
            var tmpImages = document.querySelectorAll(config.imagesContainerSelector + ' img');
            var imagesCount = tmpImages.length;
            for(var i = 0; i < imagesCount; i++) {
                images.push({'src': tmpImages[i].getAttribute('src')});
            }
        }
    }

    var _createGallery = function() {
        var galleryContent = '';
        var spaceBetweenImages = (2 * Math.PI) / images.length;
        var rawImg = document.createElement('IMG');
        for (var i = 0; i < images.length; i++) {
            var cos = Math.cos(spaceBetweenImages * i);
            var sin = Math.sin(spaceBetweenImages * i);

            images[i].startPositionX = cos * radius;
            images[i].startPositionZ = sin * radius;

            images[i].baseSizeModificatorX = images[i].startPositionX * (gallerySize.width / zoom);
            images[i].baseSizeModificatorZ = images[i].startPositionZ * (gallerySize.width / zoom);

            var clonedImg = rawImg.cloneNode(false);
            clonedImg.setAttribute('src', images[i].src);
            clonedImg.setAttribute('id', idPrefix + i);

            images[i].handler = clonedImg;
            galleryEl.appendChild(clonedImg);
        }
    }

    var _bindEvents = function() {
        window.addEventListener("resize", circle3DGallery.getGallerySizeAndOffset, false);
        window.addEventListener("mousemove", circle3DGallery.mouseMove, false);
    }

    var _mouseMove  = function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        return false;
    }

    var _startAnimation  = function(config) {
        animation = setInterval(_draw, config.interval);
    }

    var _draw = function() {
        galleryEl.style.display = 'none';
        xShift += (mouseX - gallerySize.width) * xSensitivity;
        yShift += ((mouseY - gallerySize.height) - yShift) * ySensitivity;

        var cos = Math.cos(xShift);
        var sin = Math.sin(xShift);

        var img = null;
        var horizontalPositionModificator,
        perspectiveModificator,
        widthModificator,
        halfOfNewWidth,
        width,
        height,
        left,
        top,
        i;
var tmp = '';
        for (i = 0; img = images[i]; i++) {
            horizontalPositionModificator = sin * img.baseSizeModificatorX + cos * img.baseSizeModificatorZ;
            perspectiveModificator = sin * img.baseSizeModificatorZ - cos * img.baseSizeModificatorX;
            widthModificator = dephModificator / (dephModificator + perspectiveModificator);

            width = widthModificator * gallerySize.width / zoom;

            halfOfNewWidth =  width / 2;
            left = ~~(horizontalPositionModificator * widthModificator + gallerySize.width - halfOfNewWidth);
            top = ~~(yShift * widthModificator + gallerySize.height - halfOfNewWidth);

            width = Math.max(2, ~~width);
            height = Math.max(6, ~~(width * imagesRatio));

            if (width < 5) {
                width = 0;
                height = 0;
            }
            //tmp += '<img src="'+img.src+'" style="width:'+width+'px; height:'+height+'px; left:'+left+'px; top:'+top+'px; z-index:'+width+'">';
            img.handler.style.cssText = 'width:'+width+'px; height:'+height+'px; left:'+left+'px; top:'+top+'px; z-index:'+width;
        }
        //galleryEl.innerHTML = tmp;
galleryEl.style.display = 'block';
    }

    return {
        init: function(config) {
            _setup(config);
            _bindEvents();
            _updateGallerySizeAndOffset();
            xShift = gallerySize.width;
            yShift = gallerySize.height;
            _getImages(config);
            _createGallery();
            _startAnimation(config);
        },
        updateGallerySizeAndOffset: function() {
            _updateGallerySizeAndOffset();
            _updateBaseSizeModificator();
        },
        mouseMove: function(e) {
            _mouseMove(e);
        },
    };
}();
