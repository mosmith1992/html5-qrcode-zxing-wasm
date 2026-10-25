/**
 * @fileoverview
 * {@interface QrcodeDecoder} wrapper around zxing-wasm library.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * zxing-wasm library from https://github.com/Sec-ant/zxing-wasm.
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { readBarcodes, type ReaderOptions, type ReadInputBarcodeFormat, prepareZXingModule } from "zxing-wasm";
import ZXING_WASM_DATA_URL from "./zxing-wasm-bin";

import {
    QrcodeResult,
    QrcodeResultDebugData,
    QrcodeResultFormat,
    Html5QrcodeSupportedFormats,
    Logger,
    QrcodeDecoderAsync
} from "./core";

prepareZXingModule({
    overrides: {
        locateFile: (path: string, prefix: string) => {
            if (path.endsWith(".wasm")) {
                return ZXING_WASM_DATA_URL;
            }
            return prefix + path;
        }
    }
});

export class ZXingHtml5QrcodeDecoder implements QrcodeDecoderAsync {

    private readonly formatMap: Map<Html5QrcodeSupportedFormats, ReadInputBarcodeFormat>
        = new Map([
            [Html5QrcodeSupportedFormats.QR_CODE, "QRCode"],
            [Html5QrcodeSupportedFormats.AZTEC, "Aztec"],
            [Html5QrcodeSupportedFormats.CODABAR, "Codabar"],
            [Html5QrcodeSupportedFormats.CODE_39, "Code39"],
            [Html5QrcodeSupportedFormats.CODE_93, "Code93"],
            [Html5QrcodeSupportedFormats.CODE_128, "Code128"],
            [Html5QrcodeSupportedFormats.DATA_MATRIX, "DataMatrix"],
            [Html5QrcodeSupportedFormats.MAXICODE, "MaxiCode"],
            [Html5QrcodeSupportedFormats.ITF, "ITF"],
            [Html5QrcodeSupportedFormats.EAN_13, "EAN13"],
            [Html5QrcodeSupportedFormats.EAN_8, "EAN8"],
            [Html5QrcodeSupportedFormats.PDF_417, "PDF417"],
            [Html5QrcodeSupportedFormats.RSS_14, "DataBar"],
            [Html5QrcodeSupportedFormats.RSS_EXPANDED, "DataBarExp"],
            [Html5QrcodeSupportedFormats.UPC_A, "UPCA"],
            [Html5QrcodeSupportedFormats.UPC_E, "UPCE"]
        ]);

    private readonly reverseFormatMap: Map<string, Html5QrcodeSupportedFormats>
        = this.createReverseFormatMap();

    private readonly symbologyMap: Map<string, Html5QrcodeSupportedFormats>
        = new Map([
            ["QRCode", Html5QrcodeSupportedFormats.QR_CODE],
            ["Aztec", Html5QrcodeSupportedFormats.AZTEC],
            ["Codabar", Html5QrcodeSupportedFormats.CODABAR],
            ["Code39", Html5QrcodeSupportedFormats.CODE_39],
            ["Code93", Html5QrcodeSupportedFormats.CODE_93],
            ["Code128", Html5QrcodeSupportedFormats.CODE_128],
            ["DataMatrix", Html5QrcodeSupportedFormats.DATA_MATRIX],
            ["MaxiCode", Html5QrcodeSupportedFormats.MAXICODE],
            ["ITF", Html5QrcodeSupportedFormats.ITF],
            ["EANUPC", Html5QrcodeSupportedFormats.EAN_13],
            ["PDF417", Html5QrcodeSupportedFormats.PDF_417],
            ["DataBar", Html5QrcodeSupportedFormats.RSS_14]
        ]);

    private readerOptions: ReaderOptions;
    private verbose: boolean;
    private logger: Logger;

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean,
        logger: Logger) {
        this.verbose = verbose;
        this.logger = logger;

        const formats = this.createZXingFormats(requestedFormats);
        
        this.readerOptions = {
            tryHarder: true,
            formats: formats,
            maxNumberOfSymbols: 1
        };

        if (requestedFormats.includes(Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION)) {
            this.readerOptions.eanAddOnSymbol = "Read";
            this.logger.warn("UPC_EAN_EXTENSION is not a direct format in zxing-wasm, using eanAddOnSymbol option instead");
        }
    }

    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult> {
        return new Promise((resolve, reject) => {
            try {
                const context = canvas.getContext("2d");
                if (!context) {
                    reject("Could not get 2d context from canvas");
                    return;
                }

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                readBarcodes(imageData, this.readerOptions)
                    .then((results) => {
                        if (results.length === 0) {
                            reject("No barcode found");
                            return;
                        }

                        const result = results[0];
                        resolve({
                            text: result.text,
                            format: QrcodeResultFormat.create(
                                this.toHtml5QrcodeSupportedFormats(result.format, result.symbology)),
                            bounds: {
                                x: result.position.topLeft.x,
                                y: result.position.topLeft.y,
                                width: result.position.bottomRight.x - result.position.topLeft.x,
                                height: result.position.bottomRight.y - result.position.topLeft.y
                            },
                            debugData: this.createDebugData()
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    private createReverseFormatMap(): Map<string, Html5QrcodeSupportedFormats> {
        let result = new Map();
        this.formatMap.forEach(
            (value: string, key: Html5QrcodeSupportedFormats, _) => {
            result.set(value, key);
        });
        return result;
    }

    private toHtml5QrcodeSupportedFormats(format: string, symbology: string)
        : Html5QrcodeSupportedFormats {
        if (this.reverseFormatMap.has(format)) {
            return this.reverseFormatMap.get(format)!;
        }

        if (this.symbologyMap.has(symbology)) {
            return this.symbologyMap.get(symbology)!;
        }

        throw `Could not map format ${format} (symbology: ${symbology}) to Html5QrcodeSupportedFormats`;
    }

    private createZXingFormats(
        requestedFormats: Array<Html5QrcodeSupportedFormats>):
        Array<ReadInputBarcodeFormat> {
            let zxingFormats: Array<ReadInputBarcodeFormat> = [];
            for (const requestedFormat of requestedFormats) {
                if (requestedFormat === Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION) {
                    continue;
                }
                if (this.formatMap.has(requestedFormat)) {
                    zxingFormats.push(
                        this.formatMap.get(requestedFormat)!);
                } else {
                    this.logger.logError(`${requestedFormat} is not supported by`
                        + "ZXingHtml5QrcodeDecoder");
                }
            }
            return zxingFormats;
    }

    private createDebugData(): QrcodeResultDebugData {
        return { decoderName: "zxing-wasm" };
    }
}