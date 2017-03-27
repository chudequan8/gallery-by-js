function Gallery(){
	this.wrap = document.getElementById('wrap');
	this.photoList = document.getElementsByClassName('photo');
	this.dotList = document.getElementsByClassName('dot');
	this.sortWay = 'annular';
	this.init = function(){
		var _this = this;
		_this.wrap.style.display = 'block';
		var _photoList = _this.photoList;
		var n = random([0, _photoList.length]);

		var _dot = _this.dotList;
		var centerPhoto = _photoList[n];
		var _photoArray = [];

		_this.sort(n);

		// 为图片和按钮添加点击事件处理程序
		for (var i = 0; i < _photoList.length; i++) {

			_photoList[i].onclick = (function(i){
				return function(){
					var item = this;
					var cls = item.className;
					var dele = _dot[i];
					if(cls.indexOf("photo-center") != -1){
						if(cls.indexOf("photo-front") != -1){
							item.className = cls.replace(/photo-front/, "photo-back");
							dele.className += ' back';
						}
						else if(cls.indexOf("photo-back") != -1) {
							item.className = cls.replace(/photo-back/, "photo-front");
							dele.className = dele.className.replace(/\s*back\s*/, '');
						}
						else {
							alert("请为photo添加正面或反面的样式");
						}
					}
					else {
						_this.sort(i);
					}
				}
			})(i);

			_dot[i].onclick = (function(i){
				return function(){
					var dele = this;
					var pele = _photoList[i];
					var cls = _photoList[i].className;
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
						_this.sort(i);
					}
				};
			})(i);
		}

		// 当屏幕大小发生改变时重新对图片进行排序
		var resizeTimer = null; 
		window.onresize = function(){
		    if( resizeTimer == null) {
		        resizeTimer = setTimeout(function(){
		        	windowWidth = document.body.clientWidth;
		        	windowHeight = document.body.clientHeight;
					_this.sort(random([0, _photoList.length]));
				    resizeTimer = null;
		        }.bind(_this), 2000);
		    } 
		}.bind(_this);

		// 为图片背后的描述信息添加滚动条
		[].forEach.call(document.querySelectorAll('.desc'), function (el) {
			Ps.initialize(el);
		});
		// 组织浏览器默认行为
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
}

/*  排序主函数
 *	options: n
 *	n: 选择第几张图片作为中间图
 */
Gallery.prototype.sort = function(n){
	var _photoList = this.photoList;
	n = parseInt(n) || 0;
	if(n>=0 && n<_photoList.length){
		n = n;
	}
	else {
		n = null;
		throw 'n的范围不对';
		return ;
	}
	var windowWidth = document.body.clientWidth;
	var windowHeight = document.body.clientHeight;
	var photoWidth = parseInt(_photoList[0].clientWidth);
	var photoHeight = parseInt(_photoList[0].clientHeight);

	var centerPhoto = _photoList[n];
	var _photoArray = [];
	var _dot = this.dotList;
	for (var i = 0; i < _photoList.length; i++) {
		var item = _photoList[i];
		item.removeAttribute("style");
		item.className = item.className.replace('photo-back', 'photo-front');
		item.className = item.className.replace(/\s*photo-center\s*/, '');
		_photoArray.push(item);

		_dot[i].className = 'dot';
		_dot[i].innerHTML = i + 1;
	}
	centerPhoto.className += " photo-center";
	_dot[n].className += ' current fa fa-undo';
	_dot[n].innerHTML = '';

	// 初始化导航条按钮显示个数
	var nav = document.getElementsByClassName('nav')[0];
	var ul = nav.querySelector('ul');
	if(document.body.clientWidth < 768){
		nav.style.width = 5 * 30 + 'px';
		nav.style.marginLeft = -(5 * 30 / 2) + 'px';
		if(n < 2){
			ul.style.transform = 'translateX(0)';
		} else if(n > (_dot.length - 3)){
			ul.style.transform = 'translateX(' + -(_dot.length - 5)*30 + 'px)';
		} else {
			ul.style.transform = 'translateX(' + -(n - 2)*30 + 'px)';
		}
	}
	_dot[n].className += ' current fa fa-undo';
	_dot[n].innerHTML = '';

	dotScroll(nav);

	_photoArray.splice(n, 1);

	var leftPhotoList = _photoArray.splice(0, Math.floor(_photoArray.length/2));
	var rightPhotoList = _photoArray;
	var _options = this.sortWay;

	// 根据传入的参数执行相应的排序函数
	if(_options === 'random'){
		randomSort(leftPhotoList, rightPhotoList, photoWidth, photoHeight, windowWidth, windowHeight);
	}
	else if(_options === 'annular'){
		annularSort(leftPhotoList, rightPhotoList, windowWidth, windowHeight);
	}
	else {
		alert('没有这种排序方式，请重新指定');
	}
}

/*  选择排序方式
 *	options: way
 *	way: 选择排序方式，'random'：随机; 'annular'：环形，默认随机
 */
Gallery.prototype.switch = function(way){
	var _photoList = this.photoList;

	var windowWidth = document.body.clientWidth;
	var windowHeight = document.body.clientHeight;
	var photoWidth = parseInt(_photoList[0].clientWidth);
	var photoHeight = parseInt(_photoList[0].clientHeight);
	var n = random([0, _photoList.length]);

	var centerPhoto = _photoList[n];
	var _photoArray = [];
	var _dot = this.dotList;
	for (var i = 0; i < _photoList.length; i++) {
		var item = _photoList[i];
		item.removeAttribute("style");
		item.className = item.className.replace('photo-back', 'photo-front');
		item.className = item.className.replace(/\s*photo-center\s*/, '');
		_photoArray.push(item);

		_dot[i].className = 'dot';
		_dot[i].innerHTML = i + 1;
	}
	centerPhoto.className += " photo-center";
	_dot[n].className += ' current fa fa-undo';
	_dot[n].innerHTML = '';

	// 初始化导航条按钮显示个数
	var nav = document.getElementsByClassName('nav')[0];
	var ul = nav.querySelector('ul');
	if(document.body.clientWidth < 768){
		nav.style.width = 5 * 30 + 'px';
		nav.style.marginLeft = -(5 * 30 / 2) + 'px';
		if(n < 2){
			ul.style.transform = 'translateX(0)';
		} else if(n > (_dot.length - 3)){
			ul.style.transform = 'translateX(' + -(_dot.length - 5)*30 + 'px)';
		} else {
			ul.style.transform = 'translateX(' + -(n - 2)*30 + 'px)';
		}
	}
	_dot[n].className += ' current fa fa-undo';
	_dot[n].innerHTML = '';

	dotScroll(nav);

	_photoArray.splice(n, 1);

	var leftPhotoList = _photoArray.splice(0, Math.floor(_photoArray.length/2));
	var rightPhotoList = _photoArray;
	var _options;
	if(way){
		_options =way;
	} else if(this.sortWay){
		_options = this.sortWay;
	} else {
		_options = 'random';
	}

	// 根据传入的参数执行相应的排序函数
	if(_options === 'random'){
		randomSort(leftPhotoList, rightPhotoList, photoWidth, photoHeight, windowWidth, windowHeight);
	}
	else if(_options === 'annular'){
		annularSort(leftPhotoList, rightPhotoList, windowWidth, windowHeight);
	}
	else {
		alert('没有这种排序方式，请重新指定');
	}
	this.sortWay = _options;
}

// 随机排序
function randomSort(leftPhotoList, rightPhotoList, photoWidth, photoHeight, windowWidth, windowHeight){
	for (var i = 0, k = leftPhotoList.length; i < k; i++) {
		leftPhotoList[i].style.transform = 'rotate(' + random([-150, 150]) + 'deg)';
		leftPhotoList[i].style.top = random([-photoHeight/2, windowHeight - photoHeight/2]) + 'px';
		leftPhotoList[i].style.left = random([-photoWidth/2, windowWidth/2 - photoWidth]) + 'px';
		leftPhotoList[i].style.margin = 0;

		rightPhotoList[i].style.transform = 'rotate(' + random([-150, 150]) + 'deg)';
		rightPhotoList[i].style.top = random([-photoHeight/2, windowHeight - photoHeight/2]) + 'px';
		rightPhotoList[i].style.left = random([windowWidth/2, windowWidth - photoWidth/2]) + 'px';
		rightPhotoList[i].style.margin = 0;
	}
	if(k < rightPhotoList.length){
		rightPhotoList[k].style.transform = 'rotate(' + random([-150, 150]) + 'deg)';
		rightPhotoList[k].style.top = random([-photoHeight/2, windowHeight - photoHeight/2]) + 'px';
		rightPhotoList[k].style.left = random([windowWidth/2, windowWidth - photoWidth/2]) + 'px';
		rightPhotoList[k].style.margin = 0;
	}
}

// 环形排序
function annularSort(leftPhotoList, rightPhotoList, windowWidth, windowHeight){

	// 半径：显示器长宽较小值
	// Math.min(wrapWidth, wrapHeight)
	// 
	// 左分区旋转角度
	// [-90deg, 75deg]
	// 
	// 右分区旋转角度
	// [105deg, 270deg]

	var radius = Math.min(windowWidth, windowHeight) / 2;

	for (var i = 0, k = leftPhotoList.length; i < k; i++) {
		leftPhotoList[i].style.transform = 'rotate(' + random([105, 270]) + 'deg) translate(' + radius + 'px)';
		rightPhotoList[i].style.transform = 'rotate(' + random([-90, 75]) + 'deg) translate(' + radius + 'px)';
	}
	if(k < rightPhotoList.length){
		rightPhotoList[k].style.transform = 'rotate(' + random([-90, 75]) + 'deg) translate(' + radius + 'px)';
	}
}

// 从给定的范围随机取一个值
function random(arr){
	var max = Math.max(arr[0], arr[1]);
	var min = Math.min(arr[0], arr[1]);
	var range = max - min;
	return Math.floor(Math.random() * range + min);
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
		ul.style.transition = 'transform 0.3s ease-out';
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
