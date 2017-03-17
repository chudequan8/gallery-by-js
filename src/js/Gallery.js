// 画廊应用的构造函数
var Gallery = function(){
	window.Gallery = this;
}

// 1.翻面控制
Gallery.prototype.turn = function(){
	var _this = this;
	var _wrap = _this.wrap;
	var _photoList = _this.photoList;
	var _dot = _this.dotList;
	for (var i = 0; i < _photoList.length; i++) {
		
		_photoList[i].onclick = (function(i){
			return function(e){
				turnBack(this, _dot[i], i, _this);
				e.preventDefault();
				e.stopPropagation();
			};
		})(i);

		_dot[i].onclick = (function(i){
			return function(e){
				turnBack(_photoList[i], this, i, _this);
				e.preventDefault();
				e.stopPropagation();
			};
		})(i);
	}
}

// 2.初始化，将图片数据和控制条写入模板
Gallery.prototype.init = function(options){

	this.options = options ? options : 'random';
	this.wrap = document.getElementById("wrap");

	// 获取图片数据
	var req = new XMLHttpRequest();
	req.open("GET", "dist/data/data.json");
	req.send();
	req.onreadystatechange = function(){
		if(req.readyState === 4){
			if(req.status === 200){
				var res = JSON.parse(req.responseText);
				addPhoto(this, res);	// 把获得的图片信息放入模板并执行一次排序
			}
			else {
				alert("发生错误" + req.status);
			}
		}
	}.bind(this);

	// 当屏幕大小发生改变时重新对图片进行排序
	var resizeTimer = null; 
	window.onresize = function(){
	    if( resizeTimer == null) {
	        resizeTimer = setTimeout(function(){
				this.sort(random([0, this.photoList.length]));
			    resizeTimer = null;
	        }.bind(this), 2000);
	    } 
	}.bind(this);

	document.addEventListener('touchmove', function(event) {
	    // 判断默认行为是否可以被禁用
	    if (event.cancelable) {
	        // 判断默认行为是否已经被禁用
	        if (!event.defaultPrevented) {
	            event.preventDefault();
	        }
	    }
	}, false);
}

// 3.图片排序（一张居中显示，其他随机排放）
Gallery.prototype.sort = function(n){
	this.photoList = document.getElementsByClassName('photo');
	this.dotList = document.getElementsByClassName('dot');

	var _wrap = this.wrap;
	var _photoList = this.photoList;
	var _dot = this.dotList;
	var centerPhoto = _photoList[n];
	var _photoArray = [];
	var _options = this.options;


	var _nav = document.getElementsByClassName('nav')[0];
	var _ul = _nav.querySelector('ul');

	// 从图片列表中取出随机一张作为中间的图片
	for (var i = 0; i < _photoList.length; i++) {
		var _this = _photoList[i];

		_this.removeAttribute("style");
		_this.className = _this.className.replace('photo-back', 'photo-front');
		_this.className = _this.className.replace(/\s*photo-center\s*/, '');
		_photoArray.push(_this);

		_dot[i].className = 'dot';
		_dot[i].innerHTML = i + 1;
	}
	centerPhoto.className += " photo-center";
	if(document.body.clientWidth < 768){
		_nav.style.width = 5 * 30 + 'px';
		_nav.style.marginLeft = -(5 * 30 / 2) + 'px';
		if(n < 2){
			_ul.style.transform = 'translateX(0)';
		} else if(n > (_dot.length - 3)){
			_ul.style.transform = 'translateX(' + -(_dot.length - 5)*30 + 'px)';
			// _ul.style.left = -((_dot.length - 3)-2) * 30 + 'px';
		} else {
			_ul.style.transform = 'translateX(' + -(n - 2)*30 + 'px)';
			// _ul.style.left = -(n - 2)*30 + 'px';
		}
		// _ul.style.transition = 'transform 0.6s';
	}
	_dot[n].className += ' current fa fa-undo';
	_dot[n].innerHTML = '';
	_photoArray.splice(n, 1);

	// 根据传入的参数执行相应的排序函数
	if(_options === 'random'){
		randomSort(_wrap, _photoArray);
	}
	else if(_options === 'annular'){
		annularSort(_wrap, _photoArray);
	}
	else {
		alert('没有这种排序方式，请重新指定');
	}

	// 为导航条添加触摸事件
	dotScroll(_nav);
}

// 把获得的图片信息插入模板并执行一次排序
function addPhoto(_this, d){
	var _wrap = _this.wrap,
		photoList = '',
		nav = '';

	for (var i = 0; i < d.length; i++) {
		var _photo = '<div class="photo photo-front" id="photo_' + i + 
					'"><div class="photo-wrap"><div class="side side-front"><p class="image"><img src="dist/img/' + d[i].img + 
					'" alt="' + d[i].title + 
					'"></p><p class="caption"><span>' + d[i].title + 
					'</span></p></div><div class="side side-back"><p class="desc"><span>' + d[i].desc + 
					'</span></p></div></div></div>';
		var _dot = '<li class="dot" id="dot_' + i + '"></li>';
		photoList += _photo;
		nav += _dot;
	}
	nav = '<div class="nav"><ul>' + nav + '</ul></div>';

	_wrap.innerHTML = photoList + nav;
	_wrap.style.display = 'block';

	// 对图片随机进行一次排序
	_this.sort(random([0, d.length]));
	// 绑定翻转事件
	_this.turn();
	// 为图片背后的描述信息添加滚动条
	[].forEach.call(document.querySelectorAll('.desc'), function (el) {
		Ps.initialize(el);
	});
}

// 从给定的范围随机取一个值
function random(arr){
	var max = Math.max(arr[0], arr[1]);
	var min = Math.min(arr[0], arr[1]);
	var range = max - min;
	return Math.floor(Math.random() * range + min);
}

// 获取当前元素在同一级元素中的索引
function getIndex(arr, ele){
	for (var i = 0; i < arr.length; i++) {
		if(arr[i] === ele){
			return i;
		}
	}
}

// 翻转图片以及按钮
function turnBack(pele, dele, index, _this){
	var cls = pele.className;
	if(cls.indexOf("photo-center") != -1){
		if(cls.indexOf("photo-front") != -1){
			pele.className = cls.replace(/photo-front/, "photo-back");
			dele.className += ' back';
		}
		else if(cls.indexOf("photo-back") != -1) {
			pele.className = cls.replace(/photo-back/, "photo-front");
			dele.className = dele.className.replace(/\s*back\s*/, '');
		}
		else {
			alert("请为photo添加正面或反面的样式");
		}
	}
	else {
		_this.sort(index);
	}
}

// 随机排序
function randomSort(_wrap, _photoArray){

	// 左侧图片区域坐标取值范围
	// x(-photo.width/2, wrap/2 - photo.width)
	// y(-photo.height/2, wrap.height - photo.height/2)
	// 
	// 右侧图片区域坐标取值范围
	// x(wrap/2, wrap - photo.width/2)
	// y(-photo.height/2, wrap.height - photo.height/2)

	var leftPhotoList = _photoArray.splice(0, Math.floor(_photoArray.length/2));
	var rightPhotoList = _photoArray;

	var photoWidth = leftPhotoList[0].clientWidth;
	var photoHeight = leftPhotoList[0].clientHeight;
	var wrapWidth = _wrap.clientWidth;
	var wrapHeight = _wrap.clientHeight;

	for (var i = 0, k = leftPhotoList.length; i < k; i++) {
		leftPhotoList[i].style.top = random([-photoHeight/2, wrapHeight - photoHeight/2]) + 'px';
		leftPhotoList[i].style.left = random([-photoWidth/2, wrapWidth/2 - photoWidth]) + 'px';
		leftPhotoList[i].style.margin = 0;
		leftPhotoList[i].style.transform = 'rotate(' + random([-150, 150]) + 'deg)';
	}
	for (var i = 0, k = rightPhotoList.length; i < k; i++) {
		rightPhotoList[i].style.top = random([-photoHeight/2, wrapHeight - photoHeight/2]) + 'px';
		rightPhotoList[i].style.left = random([wrapWidth/2, wrapWidth - photoWidth/2]) + 'px';
		rightPhotoList[i].style.margin = 0;
		rightPhotoList[i].style.transform = 'rotate(' + random([-150, 150]) + 'deg)';
	}
}

// 环形排序
function annularSort(_wrap, _photoArray){

	// 半径：显示器长宽较小值
	// Math.min(wrapWidth, wrapHeight)
	// 
	// 左分区旋转角度
	// [-90deg, 75deg]
	// 
	// 右分区旋转角度
	// [105deg, 270deg]

	var leftPhotoList = _photoArray.splice(0, Math.floor(_photoArray.length/2));
	var rightPhotoList = _photoArray;

	var wrapWidth = _wrap.clientWidth;
	var wrapHeight = _wrap.clientHeight;
	var radius = Math.min(wrapWidth, wrapHeight) / 2;

	for (var i = 0, k = leftPhotoList.length; i < k; i++) {
		leftPhotoList[i].style.transform = 'rotate(' + random([105, 270]) + 'deg) translate(' + radius + 'px)';
	}
	for (var i = 0, k = rightPhotoList.length; i < k; i++) {
		rightPhotoList[i].style.transform = 'rotate(' + random([-90, 75]) + 'deg) translate(' + radius + 'px)';
	}
}

// 为导航条添加触摸滚动事件
function dotScroll(nav){

	var _nav = nav;
	var ul = _nav.querySelector('ul');
	var left, startX, endX, startT, endT;
	_nav.ontouchstart = function(e){
		var arr = getStyle(ul, 'transform');
		arr = arr.split(',');
		left = parseInt(arr[4]);
		// console.log(left);
		startX = e.touches[0].clientX;
		startT = new Date() - 0;
	}
	_nav.ontouchmove = function(e){
		e.preventDefault();
		ul.style.transition = 'transform 0s';

		endX = e.touches[0].clientX;
		ul.style.transform = 'translateX(' + (left + endX - startX) + 'px)';
	}
	_nav.ontouchend = function(e){
		endT = new Date() - 0;
		// 没有移动，直接返回
		if(endX == null) return ;
		// 移动时间小于300毫秒并且移动距离小于30PX，直接返回
		if((endT - startT < 300) && (Math.abs(endX - startX) < 30)){
			return ;
		}

		left += endX - startX;
		if(left < -300){
			left = -300;
		} else if(left > 0){
			left = 0;
		}
		endX = null;
		ul.style.transition = 'transform 0.6s ease-out';
		ul.style.transform = 'translateX(' + -(Math.ceil(Math.abs(left/30))*30) + 'px)';
	}
}

// 获取元素的样式
function getStyle(obj, attr) { 
	if(obj.currentStyle) 
	{ 
		return obj.currentStyle[attr]; 
	} 
		else 
	{ 
		return getComputedStyle(obj,false)[attr]; 
	} 
}