function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[69], {
  /***/
  "./node_modules/@ionic/core/dist/esm/ion-text.entry.js":
  /*!*************************************************************!*\
    !*** ./node_modules/@ionic/core/dist/esm/ion-text.entry.js ***!
    \*************************************************************/

  /*! exports provided: ion_text */

  /***/
  function node_modulesIonicCoreDistEsmIonTextEntryJs(module, __webpack_exports__, __webpack_require__) {
    "use strict";

    __webpack_require__.r(__webpack_exports__);
    /* harmony export (binding) */


    __webpack_require__.d(__webpack_exports__, "ion_text", function () {
      return Text;
    });
    /* harmony import */


    var _index_e23c3ffd_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
    /*! ./index-e23c3ffd.js */
    "./node_modules/@ionic/core/dist/esm/index-e23c3ffd.js");
    /* harmony import */


    var _ionic_global_fbc9a2ac_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
    /*! ./ionic-global-fbc9a2ac.js */
    "./node_modules/@ionic/core/dist/esm/ionic-global-fbc9a2ac.js");
    /* harmony import */


    var _theme_c2dc54d9_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
    /*! ./theme-c2dc54d9.js */
    "./node_modules/@ionic/core/dist/esm/theme-c2dc54d9.js");

    var textCss = ":host(.ion-color){color:var(--ion-color-base)}";

    var Text = /*#__PURE__*/function () {
      function Text(hostRef) {
        _classCallCheck(this, Text);

        Object(_index_e23c3ffd_js__WEBPACK_IMPORTED_MODULE_0__["r"])(this, hostRef);
      }

      _createClass(Text, [{
        key: "render",
        value: function render() {
          var mode = Object(_ionic_global_fbc9a2ac_js__WEBPACK_IMPORTED_MODULE_1__["b"])(this);
          return Object(_index_e23c3ffd_js__WEBPACK_IMPORTED_MODULE_0__["h"])(_index_e23c3ffd_js__WEBPACK_IMPORTED_MODULE_0__["H"], {
            "class": Object.assign(Object.assign({}, Object(_theme_c2dc54d9_js__WEBPACK_IMPORTED_MODULE_2__["c"])(this.color)), _defineProperty({}, mode, true))
          }, Object(_index_e23c3ffd_js__WEBPACK_IMPORTED_MODULE_0__["h"])("slot", null));
        }
      }]);

      return Text;
    }();

    Text.style = textCss;
    /***/
  }
}]);
//# sourceMappingURL=69-es5.js.map