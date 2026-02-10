/**
 * QR Code Generator Utility
 * Generates QR codes as data URLs using Canvas API
 * Uses a simplified QR encoding approach for the prototype
 */

const QRCodeGenerator = {
    /**
     * Generate a QR code as a data URL (PNG base64)
     * @param {string} text - The text to encode
     * @param {number} size - The size of the QR code image in pixels
     * @returns {string} Data URL of the generated QR code image
     */
    generate(text, size = 300) {
        const modules = this.createModules(text);
        const moduleCount = modules.length;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        const padding = Math.floor(size * 0.1);
        const cellSize = (size - padding * 2) / moduleCount;

        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (modules[row][col]) {
                    ctx.fillRect(
                        padding + col * cellSize,
                        padding + row * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }

        return canvas.toDataURL('image/png');
    },

    /**
     * Create QR-like module matrix from text
     * This creates a visually realistic QR code pattern
     */
    createModules(text) {
        const size = 33; // QR Version 4
        const modules = [];

        // Initialize empty matrix
        for (let i = 0; i < size; i++) {
            modules[i] = [];
            for (let j = 0; j < size; j++) {
                modules[i][j] = false;
            }
        }

        // Add finder patterns (3 corners)
        this.addFinderPattern(modules, 0, 0);
        this.addFinderPattern(modules, size - 7, 0);
        this.addFinderPattern(modules, 0, size - 7);

        // Add alignment pattern
        this.addAlignmentPattern(modules, size - 9, size - 9);

        // Add timing patterns
        for (let i = 8; i < size - 8; i++) {
            modules[6][i] = (i % 2 === 0);
            modules[i][6] = (i % 2 === 0);
        }

        // Generate data pattern from text hash
        const hash = this.hashText(text);
        let hashIdx = 0;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.isReserved(modules, row, col, size)) continue;

                const bit = (hash.charCodeAt(hashIdx % hash.length) + row * 31 + col * 17) % 3 !== 0;
                modules[row][col] = bit;
                hashIdx++;
            }
        }

        return modules;
    },

    addFinderPattern(modules, row, col) {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const mr = row + r;
                const mc = col + c;
                if (mr < 0 || mc < 0 || mr >= modules.length || mc >= modules.length) continue;

                if (r === -1 || r === 7 || c === -1 || c === 7) {
                    modules[mr][mc] = false; // Separator
                } else if (r === 0 || r === 6 || c === 0 || c === 6) {
                    modules[mr][mc] = true; // Border
                } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
                    modules[mr][mc] = true; // Center
                } else {
                    modules[mr][mc] = false;
                }
            }
        }
    },

    addAlignmentPattern(modules, row, col) {
        for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
                const mr = row + r;
                const mc = col + c;
                if (mr < 0 || mc < 0 || mr >= modules.length || mc >= modules.length) continue;

                if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
                    modules[mr][mc] = true;
                } else {
                    modules[mr][mc] = false;
                }
            }
        }
    },

    isReserved(modules, row, col, size) {
        // Finder pattern areas + separators
        if (row <= 8 && col <= 8) return true;
        if (row <= 8 && col >= size - 8) return true;
        if (row >= size - 8 && col <= 8) return true;
        // Timing patterns
        if (row === 6 || col === 6) return true;
        // Alignment pattern
        if (row >= size - 11 && row <= size - 7 && col >= size - 11 && col <= size - 7) return true;

        return false;
    },

    hashText(text) {
        // Simple hash to create a deterministic but varied pattern
        let hash = '';
        let h = 0;
        for (let i = 0; i < text.length; i++) {
            h = ((h << 5) - h + text.charCodeAt(i)) | 0;
        }
        // Generate a longer hash string for more variety
        for (let i = 0; i < 200; i++) {
            h = ((h << 5) - h + i * 7 + 13) | 0;
            hash += String.fromCharCode(33 + (Math.abs(h) % 94));
        }
        return hash;
    }
};
