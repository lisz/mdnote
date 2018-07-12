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
    initEvent: function () {
        var that = this,
            file = ID('file');

        ID('btn').addEventListener('click', function () {
            that.start();
        });

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

        // 清除历史
        ID('clean').addEventListener('click', function () {
            chrome.storage.sync.set({image: []}, function() {
                that.refreshImage();
            });
        })
    },
    start: function () {
        var that = this,
            file = ID('file');
        file.click();
    },
    // 显示图片
    refreshImage: function () {
        chrome.storage.sync.get({image: []}, function(items) {
            var html = [];
            var images = items.image.reverse();
            for (var i=0;i<items.image.length;i++) {
                html.push('<li><a href="javascript:;"><img src="'+items.image[i]+'"></a></li>');
            }
            ID('imageList').innerHTML = html.join('');
        });
    },
    insert: function (src) {
        var that = this;
        chrome.storage.sync.get({image: []}, function(items) {
            var data = items.image;
            data.push(src);
            if (data.length > 10) {
                data.shift();
            }
            chrome.storage.sync.set({image: data}, function() {
                console.log ('保存成功！');
                that.refreshImage();
            });
        });
        this.copy(src);
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
        var ext = name.split('.').pop(),
            d = new Date(),
            path = "/";
        path += d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        path += '/' + Math.random().toString(36).substr(2) + '.';
        // path += '/' + d.getTime() + '.';
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