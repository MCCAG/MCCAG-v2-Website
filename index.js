const tipsContainer = document.querySelector('.notification-tips');
const content = document.querySelector('.generator__content');
const contentTabs = document.querySelectorAll('.tabs__input');

const uploadInput = document.querySelector('.tab-panel--upload .file-input');
const skinWebsiteInput = document.querySelector('.input.skin-website');

const backgrounds = [
    '#ffcccb', '#add8e6', '#ffffff',
    'linear-gradient(135deg, #ffcccb 0%, #ffeb3b 100%)',
    'linear-gradient(135deg, #f1eef9 0%, #f5ccf6 100%)',
    'linear-gradient(135deg, #d4fc78 0%, #99e5a2 100%)',
    'linear-gradient(135deg, #41d8dd 0%, #5583ee 100%)',
    'linear-gradient(135deg, #323b42 0%, #121317 100%)'
];

let currentBackground = 0;
let current = content.querySelector('div#active-content');
let currentCanvas = current.querySelector('canvas');
let currentAvatarImage = new Image();
currentAvatarImage.src = 'Resources/Avatars/Keishi.png';
let customBackground = null; // 自定义背景图片

// 语言支持相关
let currentLang = localStorage.getItem('lang') || 'zh';
document.documentElement.lang = currentLang === 'jp' ? 'ja' : currentLang;

function applyTranslation(lang) {
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'jp' ? 'ja' : lang;
    
    // 更新页面标题
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
        titleElement.textContent = translations[lang][titleElement.getAttribute('data-i18n')];
    }
    
    // 更新文本内容
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // 更新alt属性
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (translations[lang][key]) {
            element.setAttribute('alt', translations[lang][key]);
        }
    });
    
    // 更新placeholder属性
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });
}

// 初始化
applyTranslation(currentLang);

// 语言切换事件
document.querySelectorAll('.language-switcher__item[data-lang]').forEach(li => {
    li.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        applyTranslation(lang);
        document.getElementById('language-switch').checked = false;
    });
});

function popupTips(text, type) {
    const tips = document.createElement('li');
    const tipsText = document.createElement('p');
    tips.className = type;
    tipsText.textContent = text;
    tips.appendChild(tipsText);
    tipsContainer.appendChild(tips);
    tips.style.transform = `translateX(-${tips.offsetWidth + 40}px)`;
    setTimeout(() => tips.style.transform = 'translateX(0px)', 100)
    setTimeout(() => {
        tips.style.transform = `translateX(-${tips.offsetWidth + 40}px)`;
        setTimeout(() => {
            tips.style.height = '0';
            setTimeout(() => tipsContainer.removeChild(tips), 1000);
        }, 1000);
    }, 8000);
}

function switchContent(index) {
    const transform = index * 400;
    return function (event) {
        current.id = '';
        // 获取面板ID
        const panelId = event.target.id;
        current = content.querySelector(`.tab-panel--${panelId}`);
        currentCanvas = current.querySelector('canvas');
        current.id = 'active-content';
        content.style.transform = `translateX(-${transform}px)`;
        updateCanvas();
    }
}

function closeSelections() {
    const selections = document.querySelectorAll('input:checked[type=checkbox]');
    for (const selection of selections) {
        if (selection.getAttribute('status') == '1') {
            selection.checked = false;
            selection.setAttribute('status', '0');
        } else selection.setAttribute('status', '1');
    }
}

function checkInputValue(regax) {
    return function (event) {
        const value = event.target.value;
        const filtered = value.replace(regax, ''); // 过滤掉非字母和下划线的字符
        if (filtered !== value) {
            event.target.value = filtered; // 更新输入框的值
        }
    }
}

function updateCanvas() {
    const context = currentCanvas.getContext('2d');
    
    // 清空画布
    context.clearRect(0, 0, 1000, 1000);
    
    // 绘制背景
    if (customBackground) {
        // 如果有自定义背景，绘制自定义背景
        const imgRatio = customBackground.width / customBackground.height;
        const canvasRatio = currentCanvas.width / currentCanvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        // 计算绘制尺寸和位置，确保图片居中并覆盖整个画布
        if (imgRatio > canvasRatio) {
            // 图片更宽，以高度为基准
            drawHeight = currentCanvas.height;
            drawWidth = customBackground.width * (drawHeight / customBackground.height);
            offsetX = (currentCanvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // 图片更高或等比例，以宽度为基准
            drawWidth = currentCanvas.width;
            drawHeight = customBackground.height * (drawWidth / customBackground.width);
            offsetX = 0;
            offsetY = (currentCanvas.height - drawHeight) / 2;
        }
        
        context.drawImage(customBackground, offsetX, offsetY, drawWidth, drawHeight);
    } else {
        // 否则绘制预设背景
        const background = backgrounds[currentBackground];
    if (background.startsWith('linear-gradient')) {
        const colors = background.match(/#\w{6}/g);
        const gradient = context.createLinearGradient(0, 0, 1000, 1000);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        context.fillStyle = gradient;
    } else context.fillStyle = background;
    context.fillRect(0, 0, 1000, 1000);
    }
    
    // 绘制头像
    context.drawImage(currentAvatarImage, 0, 0, 1000, 1000);
}

function downloadWithBackground() {
    const link = document.createElement('a');
    link.download = 'Avatar.png';
    link.href = currentCanvas.toDataURL('image/png');
    link.click();
    link.remove();
}

function downloadTransparent() {
    // 创建临时画布
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1000;
    tempCanvas.height = 1000;
    const tempContext = tempCanvas.getContext('2d');
    
    // 只绘制头像（不包含背景）
    tempContext.drawImage(currentAvatarImage, 0, 0, 1000, 1000);
    
    // 下载透明背景的图片
    const link = document.createElement('a');
    link.download = 'Avatar_Transparent.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    link.remove();
    
    // 删除临时画布
    tempCanvas.remove();
}

function handleDownload(event) {
    const downloadType = event.target.getAttribute('download-type');
    if (downloadType === 'with-bg') {
        downloadWithBackground();
    } else if (downloadType === 'transparent') {
        downloadTransparent();
    }
}

function changeBackground() {
    // 如果当前使用自定义背景，则重置为第一个预设背景
    if (customBackground) {
        customBackground = null;
        currentBackground = 0;
    } else {
        // 否则正常循环切换预设背景
        currentBackground += 1;
        if (currentBackground >= backgrounds.length) currentBackground = 0;
    }
    updateCanvas();
}

// API 相关
async function request(address, data) {
    console.debug('Request:', address, data);
    try {
        const response = await fetch('https://api.mccag.cn/' + address, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // 将数据对象转换为 JSON 字符串
        });
        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
            if (responseData.success) return responseData.data;
            return popupTips(responseData.message, 'error');
        }
        popupTips('请求失败，请检查网络连接！', 'error');
    } catch (error) {
        console.error(error);
        popupTips('请求失败，请检查网络连接！', 'error');
    }
}

async function generate(event) {
    const input = current.querySelector('.input.player-name');
    const avatarType = event.target.getAttribute('avatar-type');
    if (!input.value) return popupTips('请输入用户名！', 'warning');
    if (current.classList.contains('tab-panel--website') && !skinWebsiteInput.value) return popupTips('请输入皮肤站地址！', 'warning');
    const mask = current.querySelector('.loading-mask');
    mask.style.opacity = 1;
    const sendData = { 
        website: (current.classList.contains('tab-panel--website') ? 
            (skinWebsiteInput.value.startsWith('http://') || skinWebsiteInput.value.startsWith('https://')) ? 
                skinWebsiteInput.value : 'https://' + skinWebsiteInput.value : null), 
        player: input.value, 
        avatar_type: avatarType 
    };
    const response = await request('generate/account', sendData);
    mask.style.opacity = 0;
    if (!response) return;
    currentAvatarImage.src = ('data:image/png;base64,' + response.image);
    popupTips('生成头像成功！', 'success');
}

async function generateUpload(event) {
    if (!uploadInput.files || !uploadInput.files[0]) {
        return popupTips('请先上传皮肤！', 'warning');
    }
    
    // 获取选中的头像类型
    const avatarType = event ? event.target.getAttribute('avatar-type') || 'full' : 'full';
    
    const mask = current.querySelector('.loading-mask');
    mask.style.opacity = 1;
    const reader = new FileReader();
    reader.readAsDataURL(uploadInput.files[0]);
    reader.onload = async function () {
        const image = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const sendData = { skin_image: image, avatar_type: avatarType };
        const response = await request('generate/file', sendData);
        mask.style.opacity = 0;
        if (!response) return;
        currentAvatarImage.src = ('data:image/png;base64,' + response.image);
        popupTips('生成头像成功！', 'success');
}
}

// 事件监听
window.addEventListener('click', closeSelections);
currentAvatarImage.addEventListener('load', updateCanvas);

uploadInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            generateUpload();
        }
        fileReader.readAsDataURL(this.files[0]);
    }
});

document.querySelectorAll('.dropdown__item[avatar-type]').forEach(item => {
    item.addEventListener('click', function(e) {
        const parentId = e.target.closest('.actions').querySelector('input[type=checkbox]').id;
        if (parentId.includes('upload')) {
            generateUpload(e);
        } else {
            generate(e);
        }
        closeSelections();
    });
});

document.querySelectorAll('.dropdown__item[download-type]').forEach(item => {
    item.addEventListener('click', handleDownload);
});

document.querySelectorAll('.tabs__input').forEach((tab, index) => {
    tab.addEventListener('change', switchContent(index));
});

document.querySelectorAll('.change-background').forEach(button => {
    button.addEventListener('click', changeBackground);
});

// 处理背景上传
function handleBackgroundUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    // 验证文件类型
    if (!file.type.match('image.*')) {
        popupTips('请上传图片文件！', 'error');
        return;
    }
    
    // 验证文件大小（2MB = 2 * 1024 * 1024 字节）
    if (file.size > 2 * 1024 * 1024) {
        popupTips('图片大小不能超过2MB！', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            customBackground = img;
            updateCanvas();
            popupTips('背景图片上传成功！', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 创建背景上传的隐藏输入框
function createBackgroundUploader() {
    const bgFileInput = document.createElement('input');
    bgFileInput.type = 'file';
    bgFileInput.accept = 'image/*';
    bgFileInput.style.display = 'none';
    bgFileInput.id = 'background-upload';
    document.body.appendChild(bgFileInput);
    
    // 监听文件选择
    bgFileInput.addEventListener('change', handleBackgroundUpload);
    
    return bgFileInput;
}

// 初始化背景上传功能
const bgUploader = createBackgroundUploader();

// 点击上传背景按钮时触发文件选择
document.querySelectorAll('.btn.upload').forEach(button => {
    button.addEventListener('click', function() {
        bgUploader.click();
    });
});

// 在页面加载时进行初始化
document.addEventListener('DOMContentLoaded', function() {
    applyTranslation(currentLang);
    
    // 启用底部上传按钮
    document.querySelectorAll('.actions--disabled').forEach(actionsGroup => {
        // 移除disabled类，但仅启用上传背景按钮
        // 保留发布和分享按钮的禁用状态
        actionsGroup.classList.remove('actions--disabled');
        
        // 单独禁用发布和分享按钮
        actionsGroup.querySelectorAll('.btn.publish, .btn.share').forEach(btn => {
            btn.classList.add('btn--disabled');
            btn.setAttribute('disabled', 'disabled');
        });
    });
});

// 在JS文件末尾添加以下CSS样式类
const style = document.createElement('style');
style.textContent = `
  .btn--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);
