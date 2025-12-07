import fs from 'fs';
import path from 'path';
import solc from 'solc';

function findImports(importPath) {
    if (importPath.startsWith('contracts/')) {
        const filePath = path.resolve(process.cwd(), importPath);
        if (fs.existsSync(filePath)) {
            return { contents: fs.readFileSync(filePath, 'utf8') };
        }
    }
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // This is a simplification; for complex projects, better resolution is needed.
        // Assuming all interfaces are in contracts/interfaces
        const possiblePath = path.resolve(process.cwd(), 'contracts', importPath.replace('../', ''));
        if (fs.existsSync(possiblePath)) {
            return { contents: fs.readFileSync(possiblePath, 'utf8') };
        }

        const interfacePath = path.resolve(process.cwd(), 'contracts/interfaces', path.basename(importPath));
        if (fs.existsSync(interfacePath)) {
            return { contents: fs.readFileSync(interfacePath, 'utf8') };
        }
    }
    return { error: 'File not found' };
}

const contractPath = path.resolve('contracts', 'VerifyMindVault.sol');
const mockFdcPath = path.resolve('contracts', 'MockFDC.sol');
const mockDexPath = path.resolve('contracts', 'MockDEX.sol');

const source = fs.readFileSync(contractPath, 'utf8');
const mockFdcSource = fs.readFileSync(mockFdcPath, 'utf8');
const mockDexSource = fs.readFileSync(mockDexPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'contracts/VerifyMindVault.sol': {
            content: source
        },
        'contracts/MockFDC.sol': {
            content: mockFdcSource
        },
        'contracts/MockDEX.sol': {
            content: mockDexSource
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

console.log('Compiling...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    output.errors.forEach(err => {
        console.error(err.formattedMessage);
    });
    // Don't exit if only warnings
    if (output.errors.some(err => err.severity === 'error')) {
        process.exit(1);
    }
}

const contract = output.contracts['contracts/VerifyMindVault.sol']['VerifyMindVault'];
fs.writeFileSync('VerifyMindVault.json', JSON.stringify(contract, null, 2));

const mockFdcContract = output.contracts['contracts/MockFDC.sol']['MockFDC'];
fs.writeFileSync('MockFDC.json', JSON.stringify(mockFdcContract, null, 2));

const mockDexContract = output.contracts['contracts/MockDEX.sol']['MockDEX'];
fs.writeFileSync('MockDEX.json', JSON.stringify(mockDexContract, null, 2));

console.log('Compilation successful! Artifacts saved.');
