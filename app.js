// Globals
let toastContainer = null;
let alertContainer = null;
const defaultColor = {
    red: 221,
    green: 222,
    blue: 238
}
const defaultPresetColors = [
    '#ffcdd2',
    '#f8bbd0',
    '#e1bee7',
    '#ff8a80',
    '#ff80ab',
    '#ea80fc',
    '#b39ddb',
    '#9fa8da',
    '#90caf9',
    '#b388ff',
    '#8c9eff',
    '#82b1ff',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#80d8ff',
    '#84ffff',
    '#a7ffeb',
    '#c8e6c9',
    '#dcedc8',
    '#f0f4c3',
    '#b9f6ca',
    '#ccff90',
    '#ffcc80',
    '#7dc677',
    '#ccc678',
    '#d4d000',
    '#efc44e',
];
let customColors = new Array(24);
const copySound = new Audio('./copy-sound.mp3')
const randomColorButtonSound = copySound;
const copyToClipboardButtonSound = randomColorButtonSound;

// Onload Handler
window.onload = function () {
    main()
    updateColorCodeToDom(defaultColor);
    // display preset colors
    displayColorBoxes(document.getElementById('preset-colors'), defaultPresetColors)
    const customColorsString = localStorage.getItem('custom-colors')
    if (customColorsString) {
        customColors = JSON.parse(customColorsString)
        displayColorBoxes(document.getElementById('custom-colors'), customColors);
    }
}

// Main or Boot Function, this function will take care of getting all the DOM references
function main() {
    // Dom references
    const generateRandomColorBtn = document.getElementById('generate-random-color')
    const inputHex = document.getElementById('input-hex')
    const colorSliderRed = document.getElementById('color-slider-red')
    const colorSliderGreen = document.getElementById('color-slider-green')
    const colorSliderBlue = document.getElementById('color-slider-blue')
    const copyToClipboardButton = document.getElementById('copy-to-clipboard')
    const saveToCustomBtn = document.getElementById('save-to-custom')
    const presetColorsParent = document.getElementById('preset-colors')
    const customColorsParent = document.getElementById('custom-colors')
    const bgPreview = document.getElementById('bg-preview')
    const bgFileInput = document.getElementById('bg-file-input')
    const bgFileInputBtn = document.getElementById('bg-file-input-btn')
    const bgFileRemoveBtn = document.getElementById('bg-file-remove-btn')
    const bgController = document.getElementById('bg-controller')
    const bgSize = document.getElementById('bg-size')
    const bgRepeat = document.getElementById('bg-repeat')
    const bgPosition = document.getElementById('bg-position')
    const bgAttachment = document.getElementById('bg-attachment')

    // Event Listeners
    generateRandomColorBtn.addEventListener('click', handleGenerateRandomColorBtn);
    inputHex.addEventListener('keyup', handleInputHex);
    colorSliderRed.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue));
    colorSliderGreen.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue));
    colorSliderBlue.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue));
    saveToCustomBtn.addEventListener('click', handleSaveToCustomBtn(customColorsParent, inputHex));
    copyToClipboardButton.addEventListener('click', handleCopyToClipboard);
    presetColorsParent.addEventListener('click', handlePresetColorParent);
    customColorsParent.addEventListener('click', handleCustomColorParent);
    bgFileInputBtn.addEventListener('click', function () {
        bgFileInput.click()
    })
    bgFileInput.addEventListener('change', handleBgFileInput(bgPreview, bgFileRemoveBtn, bgController))
    bgFileRemoveBtn.addEventListener('click', handleBgFileRemoveBtn(bgPreview, bgFileRemoveBtn, bgController, bgFileInput))
    bgSize.addEventListener('change', changeBackgroundPreferences);
    bgRepeat.addEventListener('change', changeBackgroundPreferences);
    bgPosition.addEventListener('change', changeBackgroundPreferences);
    bgAttachment.addEventListener('change', changeBackgroundPreferences);
}

// Event Handlers
function handleGenerateRandomColorBtn() {
    const color = generateColorDecimal()
    updateColorCodeToDom(color)
}

function handleInputHex(e) {
    const hexColor = e.target.value;
    if (hexColor) {
        this.value = hexColor.toUpperCase()
        if (isValidHex(hexColor)) {
            const color = hexToDecimalColors(hexColor)
            updateColorCodeToDom(color)
        } else if (hexColor.length > 6) {
            if (alertContainer !== null) {
                alertContainer.remove();
                alertContainer = null;
            }
            generateAlertMessage(`${hexColor} is Invalid`)
        }
    }
}

function handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue) {
    return function () {
        const color = {
            red: parseInt(colorSliderRed.value),
            green: parseInt(colorSliderGreen.value),
            blue: parseInt(colorSliderBlue.value)
        }
        updateColorCodeToDom(color)
    }
}

function handleCopyToClipboard() {
    const colorModeRadios = document.getElementsByName('color-mode')
    const mode = getCheckedValueFromRadios(colorModeRadios)
    if (mode === null) {
        throw new Error('Invalid Radio Input')
    }

    if (toastContainer !== null) {
        toastContainer.remove();
        toastContainer = null;
    }

    if (alertContainer !== null) {
        alertContainer.remove();
        alertContainer = null;
    }

    if (mode === 'hex') {
        const hexColor = document.getElementById('input-hex').value
        if (hexColor && isValidHex(hexColor)) {
            navigator.clipboard.writeText(`#${hexColor}`);
            generateToastMessage(`#${hexColor} Copied`)
        } else {
            alert('Invalid Hex Code');
        }

    } else {
        const rgbColor = document.getElementById('input-rgb').value
        if (rgbColor) {
            navigator.clipboard.writeText(rgbColor);
            generateToastMessage(`${rgbColor} Copied`)
        } else {
            alert('Invalid RGB Color')
        }
    }
}

function handlePresetColorParent(event) {
    const child = event.target;
    if (child.className === 'color-box') {
        navigator.clipboard.writeText(child.getAttribute('data-color'))
        copySound.volume = 0.2;
        copySound.play()
        if (toastContainer !== null) {
            toastContainer.remove();
            toastContainer = null;
        }
        generateToastMessage('Copied')
    }
}

function handleCustomColorParent(event) {
    const child = event.target;
    if (child.className === 'color-box') {
        navigator.clipboard.writeText(child.getAttribute('data-color'))
        copySound.volume = 0.2;
        copySound.play()
        if (toastContainer !== null) {
            toastContainer.remove();
            toastContainer = null;
        }
        generateToastMessage('Copied')
    }
}

function handleSaveToCustomBtn(customColorsParent, inputHex) {
    return function () {
        const color = `#${inputHex.value}`;
        if (customColors.includes(color)) {
            alert('Already Saved');
            return;
        }

        if (toastContainer !== null) {
            toastContainer.remove();
            toastContainer = null;
        }
        generateToastMessage('Color Saved')
        customColors.unshift(color);
        if (customColors.length > 24) {
            customColors = customColors.slice(0, 24);
        }
        localStorage.setItem('custom-colors', JSON.stringify(customColors));
        removeChildren(customColorsParent);
        displayColorBoxes(customColorsParent, customColors);

    }
}

function handleBgFileInput(bgPreview, bgFileRemoveBtn, bgController) {
    return function (event) {
        const file = event.target.files[0];
        const imgUrl = URL.createObjectURL(file);
        bgPreview.style.background = `url(${imgUrl})`;
        document.body.style.background = `url(${imgUrl})`;
        bgFileRemoveBtn.style.display = 'inline';
        bgController.style.display = 'block'
    }
}

function handleBgFileRemoveBtn(bgPreview, bgFileRemoveBtn, bgController, bgFileInput) {
    return function (event) {
        bgPreview.style.background = 'none';
        bgPreview.style.backgroundColor = '#dddeee';
        document.body.style.background = 'none';
        document.body.style.backgroundColor = '#dddeee';
        bgFileRemoveBtn.style.display = 'none';
        bgController.style.display = 'none';
        bgFileInput.value = null;
    }
}

// DOM Functions
/**
 * generate a dynamic DOM elements to show a tost message
 * @param {string} msg 
 */
function generateToastMessage(msg) {
    toastContainer = document.createElement('div')
    toastContainer.innerText = msg;
    toastContainer.className = 'toast-message toast-message-slide-in';

    toastContainer.addEventListener('click', function () {
        toastContainer.classList.remove('toast-message-slide-in');
        toastContainer.classList.add('toast-message-slide-out');

        toastContainer.addEventListener('animationend', function () {
            toastContainer.remove();
            toastContainer = null;
        })
    })

    document.body.appendChild(toastContainer);
}

/**
 * generate a dynamic DOM elements to show a alert message
 * @param {string} msg 
 */
function generateAlertMessage(msg) {
    alertContainer = document.createElement('div')
    alertContainer.innerText = msg;
    alertContainer.className = 'alert-message alert-message-slide-in';

    alertContainer.addEventListener('click', function () {
        alertContainer.classList.remove('alert-message-slide-in');
        alertContainer.classList.add('alert-message-slide-out');

        alertContainer.addEventListener('animationend', function () {
            alertContainer.remove();
            alertContainer = null;
        })
    })

    document.body.appendChild(alertContainer);
}

/**
 * find the checked elements from a list of radio buttons
 * @param {Array} nodes
 * @returns {null / string}
 */
function getCheckedValueFromRadios(nodes) {
    let checkedValue = null
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
            checkedValue = nodes[i].value
            break;
        }
    }
    return checkedValue;
}

/**
 * update dom elements with calculated color values
 * @param {object} color 
 */
function updateColorCodeToDom(color) {
    const hexColor = generateHexColor(color)
    const rgbColor = generateRGBColor(color)

    document.getElementById('color-display').style.backgroundColor = `#${hexColor}`
    document.getElementById('input-hex').value = hexColor
    document.getElementById('input-rgb').value = rgbColor
    document.getElementById('color-slider-red').value = color.red
    document.getElementById('color-slider-red-label').innerText = color.red
    document.getElementById('color-slider-green').value = color.green
    document.getElementById('color-slider-green-label').innerText = color.green
    document.getElementById('color-slider-blue').value = color.blue
    document.getElementById('color-slider-blue-label').innerText = color.blue
}

/**
 * create a div element with class name of color-box
 * @param {string} color 
 * @returns {object}
 */
function generateColorBox(color) {
    const div = document.createElement('div')
    div.className = 'color-box'
    div.style.backgroundColor = color;
    div.setAttribute('data-color', color)

    return div;
}

/**
 * this function will create and append new color boxes to it's parent
 * @param {object} parent 
 * @param {Array} colors 
 */
function displayColorBoxes(parent, colors) {
    colors.forEach((color) => {
        if (isValidHex(color.slice(1))) {
            const colorBox = generateColorBox(color)
            parent.appendChild(colorBox)
        }
    })
}

/**
 * remove all children from parent
 * @param {object} parent 
 */
function removeChildren(parent) {
    let child = parent.lastElementChild;
    while (child) {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }
}

function changeBackgroundPreferences(params) {
    document.body.style.backgroundSize = document.getElementById('bg-size').value
    document.body.style.backgroundRepeat = document.getElementById('bg-repeat').value
    document.body.style.backgroundPosition = document.getElementById('bg-position').value
    document.body.style.backgroundAttachment = document.getElementById('bg-attachment').value
}

// Utils Functions

/**
 * generate and return an object of three color decimal values
 * @returns {object}
 */

function generateColorDecimal() {
    const red = Math.floor(Math.random() * 255)
    const green = Math.floor(Math.random() * 255)
    const blue = Math.floor(Math.random() * 255)

    return {
        red,
        green,
        blue,
    }
}

/**
 * take a color object of three decimal values and return a hexadecimal color code
 * @param {object} color
 * @returns {string}
 */

function generateHexColor({ red, green, blue }) {
    function getTwoCode(value) {
        const hex = value.toString(16)
        if (hex.length === 1) {
            return `0${hex}`;
        } else {
            return `${hex}`;
        }
    }

    return `${getTwoCode(red)}${getTwoCode(green)}${getTwoCode(blue)}`.toUpperCase();
}

/**
 * take a color object of three decimal values and return a rgb color code
 * @param {object} color 
 * @returns {string}
 */

function generateRGBColor({ red, green, blue }) {
    return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * function 4 - convert hex color to decimal colors object
 * @param {string} hex 
 * @returns {object}
 */

function hexToDecimalColors(hex) {
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4), 16);

    return {
        red,
        green,
        blue
    }
}

/**
 * validate hex color code
 * @param {string} color
 * @returns {boolean}
 */

function isValidHex(color) {
    if (color.length !== 6) return false;
    return /^[0-9A-Fa-f]{6}$/i.test(color)
}