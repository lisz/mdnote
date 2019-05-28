/**
 * 上传图片 同时转换成markdown格式
 * @author Lis <z@lisz.vip>
 */
var image = {
    init: function () {
        this.initEvent();
        this.refreshImage();
        ID('imageList').style.display = 'block';
    },
    // 初始化 绑定事件
    initEvent: function () {
        var that = this,
            file = ID('file');

        ID('btn').addEventListener('click', function () {
            that.start();
        });
        // 上传图片
        file.addEventListener('change', function (e) {
            var file = e.target.files[0],
                name = cos.getRandomName(this.value);

            cos.send(name, file);
        });

        // 绑定图片点击事件
        ID('imageList').addEventListener('click', function (e) {
            var target = e.target || e.srcElement;
            if (target.tagName === 'IMG') {
                that.copy(target.getAttribute('src'));
            }
        });

        // 鼠标移上 显示大图
        ID('imageList').addEventListener('mouseover', function (e) {
            var target = e.target || e.srcElement;
            if (target.tagName === 'IMG') {
                that.showBigImage(target.getAttribute('src'))
            }
        });

        ID('imageList').addEventListener('mouseout', function (e) {
            var target = e.target || e.srcElement;
            if (target.tagName === 'IMG') {
                ID('showImage').style.display = 'none';
            }
        });

        // 粘帖图片
        ID('clipboardInput').addEventListener('paste', function(event) {
            var items = (event.clipboardData && event.clipboardData.items) || [];
            var file = null;

            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        file = items[i].getAsFile();
                        cos.send(cos.getRandomName(file.name), file);
                        break;
                    }
                }
            }
        });

        // 清除历史
        ID('clean').addEventListener('click', function () {
            chrome.storage.sync.set({image: []}, function() {
                that.refreshImage();
            });
        })
    },
    // 点击上传按钮
    start: function () {
        ID('file').click();
    },
    // 加载本地历史 显示图片
    refreshImage: function () {
        chrome.storage.sync.get({image: []}, function(items) {
            var html = [];
            var images = items.image.reverse();
            for (var i=0;i<items.image.length;i++) {
                html.push('<li><a href="#"><img src="'+items.image[i]+'"></a></li>');
            }
            ID('imageList').innerHTML = html.join('');
        });
    },
    // 保存到本地记录
    insert: function (src) {
        var that = this;
        chrome.storage.sync.get({image: []}, function(items) {
            var data = items.image;
            data.push(src);
            if (data.length > 100) {
                data.shift();
            }
            chrome.storage.sync.set({image: data}, function() {
                console.log ('保存成功！');
                that.refreshImage();
            });
        });
        this.copy(src);
    },
    // 显示大图
    showBigImage (src) {
        var image = document.querySelector('#showImage img');
        image.setAttribute('src', src);
        ID('showImage').style.display = 'block';
    },
    // 复制文字
    copy: function (txt) {
        var op = ID('hidden');
        op.value = '![image]('+txt+')';
        op.focus();
        op.select();
        var result = document.execCommand('copy');

        if (result) {
            this.tips('复制成功');
        }
    },
    // 提示
    tips: function (txt) {
        var tips = ID('tips');
        tips.innerText = txt;
        tips.style.display = 'block';
        setTimeout(function(){
            tips.style.display = 'none';
        }, 1500);
    }
};

var cos = {
    // 上传图片到腾讯云
    send: function (name, file) {
        var config = {
            SecretId: '',
            SecretKey: '',
            Bucket: '',
            Region: ''
        };
        chrome.storage.sync.get(config, function (items) {
            var cos = new COS({
                SecretId: items.SecretId,
                SecretKey: items.SecretKey,
            });

            cos.putObject({
                Bucket: items.Bucket,
                Region: items.Region,
                Key: name,
                StorageClass: 'STANDARD',
                Body: file, // 上传文件对象
                onProgress: function(progressData) {
                }
            }, function(err, data) {
                if (err!=null) {
                    alert('上传失败，请检查配置参数！');
                } else if(data.Location!='') {
                    image.insert(data.Location);
                }
            });
        });
    },
    // 获取随机文件名称
    getRandomName: function (name) {
        var ext = name ? name.split('.').pop() : '',
            d = new Date(),
            path = "/";
        path += d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        path += '/' + Math.random().toString(36).substr(2) + '.';
        path += ext || 'jpg';

        return path;
    }
}

function ID (id) {
    return document.getElementById(id);
}

setTimeout(function () {
    image.init();
}, 300);