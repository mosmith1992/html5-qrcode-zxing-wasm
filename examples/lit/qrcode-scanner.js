var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { query } from 'lit-element';
import { Html5QrcodeScanner } from 'html5-qrcode';
let QRCodeScanner = (() => {
    let _classDecorators = [customElement('qrcode-scanner')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _reader_decorators;
    let _reader_initializers = [];
    let _reader_extraInitializers = [];
    var QRCodeScanner = _classThis = class extends _classSuper {
        render() {
            return html ` <div id="reader"></div> `;
        }
        firstUpdated() {
            const onScanSuccess = (decodedText, decodedResult) => {
                // handle the scanned code as you like
                console.log(`Code matched = ${decodedText}`, decodedResult);
            };
            const onScanFailure = (errorMessage, error) => {
                // handle scan failure, usually better to ignore and keep scanning
                console.warn(`Code scan error = ${errorMessage}`, error);
            };
            const config = {
                fps: 10,
                qrbox: {
                    width: 350,
                    height: 250,
                },
            };
            const html5QrcodeScanner = new Html5QrcodeScanner(this.reader, config, false);
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        }
        constructor() {
            super(...arguments);
            this.reader = __runInitializers(this, _reader_initializers, void 0);
            __runInitializers(this, _reader_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "QRCodeScanner");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _reader_decorators = [query('#reader')];
        __esDecorate(null, null, _reader_decorators, { kind: "field", name: "reader", static: false, private: false, access: { has: obj => "reader" in obj, get: obj => obj.reader, set: (obj, value) => { obj.reader = value; } }, metadata: _metadata }, _reader_initializers, _reader_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QRCodeScanner = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.styles = [
        css `
      :host {
        display: block;
      }
    `,
    ];
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QRCodeScanner = _classThis;
})();
export { QRCodeScanner };
