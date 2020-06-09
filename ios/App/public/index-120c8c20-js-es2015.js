(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["index-120c8c20-js"],{

/***/ "./node_modules/@ionic/core/dist/esm/index-120c8c20.js":
/*!*************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/index-120c8c20.js ***!
  \*************************************************************/
/*! exports provided: KEYBOARD_DID_CLOSE, KEYBOARD_DID_OPEN, copyLayoutViewport, copyVisualViewport, keyboardDidClose, keyboardDidOpen, keyboardDidResize, resetKeyboardAssist, setKeyboardClose, setKeyboardOpen, startKeyboardAssist, trackViewportChanges */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KEYBOARD_DID_CLOSE", function() { return KEYBOARD_DID_CLOSE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KEYBOARD_DID_OPEN", function() { return KEYBOARD_DID_OPEN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyLayoutViewport", function() { return copyLayoutViewport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyVisualViewport", function() { return copyVisualViewport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyboardDidClose", function() { return keyboardDidClose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyboardDidOpen", function() { return keyboardDidOpen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyboardDidResize", function() { return keyboardDidResize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetKeyboardAssist", function() { return resetKeyboardAssist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setKeyboardClose", function() { return setKeyboardClose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setKeyboardOpen", function() { return setKeyboardOpen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startKeyboardAssist", function() { return startKeyboardAssist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "trackViewportChanges", function() { return trackViewportChanges; });
const KEYBOARD_DID_OPEN = 'ionKeyboardDidShow';
const KEYBOARD_DID_CLOSE = 'ionKeyboardDidHide';
const KEYBOARD_THRESHOLD = 150;
let previousVisualViewport = {};
let currentVisualViewport = {};
let previousLayoutViewport = {};
let currentLayoutViewport = {};
let keyboardOpen = false;
/**
 * This is only used for tests
 */
const resetKeyboardAssist = () => {
    previousVisualViewport = {};
    currentVisualViewport = {};
    previousLayoutViewport = {};
    currentLayoutViewport = {};
    keyboardOpen = false;
};
const startKeyboardAssist = (win) => {
    startNativeListeners(win);
    if (!win.visualViewport) {
        return;
    }
    currentVisualViewport = copyVisualViewport(win.visualViewport);
    currentLayoutViewport = copyLayoutViewport(win);
    win.visualViewport.onresize = () => {
        trackViewportChanges(win);
        if (keyboardDidOpen() || keyboardDidResize(win)) {
            setKeyboardOpen(win);
        }
        else if (keyboardDidClose(win)) {
            setKeyboardClose(win);
        }
    };
};
/**
 * Listen for events fired by native keyboard plugin
 * in Capacitor/Cordova so devs only need to listen
 * in one place.
 */
const startNativeListeners = (win) => {
    win.addEventListener('keyboardDidShow', ev => setKeyboardOpen(win, ev));
    win.addEventListener('keyboardDidHide', () => setKeyboardClose(win));
};
const setKeyboardOpen = (win, ev) => {
    fireKeyboardOpenEvent(win, ev);
    keyboardOpen = true;
};
const setKeyboardClose = (win) => {
    fireKeyboardCloseEvent(win);
    keyboardOpen = false;
};
/**
 * Returns `true` if the `keyboardOpen` flag is not
 * set, the previous visual viewport width equal the current
 * visual viewport width, and if the scaled difference
 * of the previous visual viewport height minus the current
 * visual viewport height is greater than KEYBOARD_THRESHOLD
 *
 * We need to be able to accomodate users who have zooming
 * enabled in their browser (or have zoomed in manually) which
 * is why we take into account the current visual viewport's
 * scale value.
 */
const keyboardDidOpen = () => {
    const scaledHeightDifference = (previousVisualViewport.height - currentVisualViewport.height) * currentVisualViewport.scale;
    return (!keyboardOpen &&
        previousVisualViewport.width === currentVisualViewport.width &&
        scaledHeightDifference > KEYBOARD_THRESHOLD &&
        !layoutViewportDidChange());
};
/**
 * Returns `true` if the keyboard is open,
 * but the keyboard did not close
 */
const keyboardDidResize = (win) => {
    return keyboardOpen && !keyboardDidClose(win);
};
/**
 * Determine if the keyboard was closed
 * Returns `true` if the `keyboardOpen` flag is set and
 * the current visual viewport height equals the
 * layout viewport height.
 */
const keyboardDidClose = (win) => {
    return keyboardOpen && currentVisualViewport.height === win.innerHeight;
};
/**
 * Determine if the layout viewport has
 * changed since the last visual viewport change.
 * It is rare that a layout viewport change is not
 * associated with a visual viewport change so we
 * want to make sure we don't get any false positives.
 */
const layoutViewportDidChange = () => {
    return (currentLayoutViewport.width !== previousLayoutViewport.width ||
        currentLayoutViewport.height !== previousLayoutViewport.height);
};
/**
 * Dispatch a keyboard open event
 */
const fireKeyboardOpenEvent = (win, nativeEv) => {
    const keyboardHeight = nativeEv ? nativeEv.keyboardHeight : win.innerHeight - currentVisualViewport.height;
    const ev = new CustomEvent(KEYBOARD_DID_OPEN, {
        detail: { keyboardHeight }
    });
    win.dispatchEvent(ev);
};
/**
 * Dispatch a keyboard close event
 */
const fireKeyboardCloseEvent = (win) => {
    const ev = new CustomEvent(KEYBOARD_DID_CLOSE);
    win.dispatchEvent(ev);
};
/**
 * Given a window object, create a copy of
 * the current visual and layout viewport states
 * while also preserving the previous visual and
 * layout viewport states
 */
const trackViewportChanges = (win) => {
    previousVisualViewport = Object.assign({}, currentVisualViewport);
    currentVisualViewport = copyVisualViewport(win.visualViewport);
    previousLayoutViewport = Object.assign({}, currentLayoutViewport);
    currentLayoutViewport = copyLayoutViewport(win);
};
/**
 * Creates a deep copy of the visual viewport
 * at a given state
 */
const copyVisualViewport = (visualViewport) => {
    return {
        width: Math.round(visualViewport.width),
        height: Math.round(visualViewport.height),
        offsetTop: visualViewport.offsetTop,
        offsetLeft: visualViewport.offsetLeft,
        pageTop: visualViewport.pageTop,
        pageLeft: visualViewport.pageLeft,
        scale: visualViewport.scale
    };
};
/**
 * Creates a deep copy of the layout viewport
 * at a given state
 */
const copyLayoutViewport = (win) => {
    return {
        width: win.innerWidth,
        height: win.innerHeight
    };
};




/***/ })

}]);
//# sourceMappingURL=index-120c8c20-js-es2015.js.map