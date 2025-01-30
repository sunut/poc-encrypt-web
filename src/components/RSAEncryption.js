import React, { useState } from 'react';
import './RSAEncryption.css';

// RSA Public Keys for different environments
const PUBLIC_KEYS = {
    sit: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD8nd7ePSXa7BFMk6DPOo6Ci7kf
muB4HO0kFI32iDQVEZqU5PiKjpyCPc17dYP63uDXp9rGD/7oEmDDalJQvB7ETCeV
NTfzi451UUIcBGbAVdUPCE06Ffkwlz3eIKIOVzQAGNulZ1tJ8IqePUU/O9C3Zrwe
ziUpDOBdG9hzsrANPwIDAQAB
-----END PUBLIC KEY-----`,
    uat: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8RAczzQghSBi1SqfXzv0
TQ5V4obSlghFNsEYonDcuaktcz3RdJld+YMzTlMUJ011I1qNMzrN5Oq8a+JrBoCj
no+AA+GHMIlUBmZcAyR2iBZILjklaJA4gGlJa873t++hnvqu3oZHtQEWGPOVig1h
s41ENZvCfdBmBrCq99CB6sMXDh/dIkigYSrg6oO0TJTKrcI+ng/0Jn8T7sNENEtu
bFBwhpzfW85ZoA86wlSlGAYuhxSmCPJQHjcPxZg1CtKsSFI8mAlC+XhlRPduNAWC
fw4UxO8meKC70wcK05clnGbd071DXsOX872HhLgOpaAagWc3JnxdPIg4L2xVCHU+
GwIDAQAB
-----END PUBLIC KEY-----`,
    prod: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn2XDVgavpvILEgm5iHpa
/tXFs54TsaKsZHwYbD6EfydcH7z5/hDUqVEbsiSOT2Y2vs7HSSQEtcalGrc6dRnx
1qE8UmgN9bleUPXG8A6HPuHADnUgBKqQfOD9JZAZpNL5oEMGgvEjA7KKjE5PptV+
r2E/Ke+by/8/+M1d2w9RX3sQRcuVn3WXYNteSE2A7rVSY1lr+8R9YHjnAzTp4nnZ
gZRLEy45eb6ANHWx1d4Gix2gDzEBVV7/+r00YAJFr0F8usJ6I7eFSOVbxGJAEcFp
yBEHCgAM7qnvjAAQtDhOoszkIKYbbnEm/XUxKQgTiRWA0+pALFwnKtYvzbB5Nmzn
YQIDAQAB
-----END PUBLIC KEY-----`
};

const RSAEncryption = () => {
    const [plainText, setPlainText] = useState('');
    const [environment, setEnvironment] = useState('sit');
    const [encryptedText, setEncryptedText] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCode, setShowCode] = useState(false);

    // Function to parse PEM format public key
    const importPublicKey = async (pem) => {
        const pemContents = pem
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\\s/g, '');

        const binaryDer = window.atob(pemContents);
        const arrayBuffer = new Uint8Array(binaryDer.length);
        for (let i = 0; i < binaryDer.length; i++) {
            arrayBuffer[i] = binaryDer.charCodeAt(i);
        }

        return window.crypto.subtle.importKey(
            'spki',
            arrayBuffer,
            {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }
            },
            false,
            ['encrypt']
        );
    };

    // Function to encrypt data
    const encryptData = async (publicKey, data) => {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP'
            },
            publicKey,
            encodedData
        );

        return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(encryptedText);
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Failed to copy text: ' + err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setEncryptedText('');

        try {
            if (!plainText) {
                throw new Error('Plain text cannot be empty');
            }

            const publicKeyPem = PUBLIC_KEYS[environment];
            if (!publicKeyPem) {
                throw new Error('Invalid environment selected');
            }

            const publicKey = await importPublicKey(publicKeyPem);
            const encrypted = await encryptData(publicKey, plainText);
            setEncryptedText(encrypted);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const codeExample = `
    // Function to parse PEM format public key
    const importPublicKey = async (pem) => {
        const pemContents = pem
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\\s/g, '');

        const binaryDer = window.atob(pemContents);
        const arrayBuffer = new Uint8Array(binaryDer.length);
        for (let i = 0; i < binaryDer.length; i++) {
            arrayBuffer[i] = binaryDer.charCodeAt(i);
        }

        return window.crypto.subtle.importKey(
            'spki',
            arrayBuffer,
            {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }
            },
            false,
            ['encrypt']
        );
    };

    // Function to encrypt data
    const encryptData = async (publicKey, data) => {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP'
            },
            publicKey,
            encodedData
        );

        return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    };

    // Usage example:
    const encrypt = async (text, environment) => {
        const publicKeyPem = PUBLIC_KEYS[environment];
        const publicKey = await importPublicKey(publicKeyPem);
        return await encryptData(publicKey, text);
    };`;

    return (
        <div className="container">
            <h1>RSA Encryption PIN (Partner-Authen) Tool</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="plainText">Plain Text:</label>
                    <input
                        type="text"
                        id="plainText"
                        value={plainText}
                        onChange={(e) => setPlainText(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="environment">Environment:</label>
                    <select
                        id="environment"
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        required
                    >
                        <option value="sit">SIT</option>
                        <option value="uat">UAT</option>
                        <option value="prod">PROD</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Encrypting...' : 'Encrypt'}
                </button>
            </form>
            
            {error && <div className="error">{error}</div>}
            
            {encryptedText && (
                <div className="result">
                    <h3>Encrypted Result:</h3>
                    <div className="result-container">
                        <p className="encrypted-text">{encryptedText}</p>
                        <button className="copy-btn" onClick={copyToClipboard}>
                            Copy
                        </button>
                    </div>
                </div>
            )}

            <div className="code-section">
                <button 
                    className="show-code-btn"
                    onClick={() => setShowCode(!showCode)}
                >
                    {showCode ? 'Hide Code' : 'Show Code for Learning'}
                </button>
                {showCode && (
                    <div className="code-container">
                        <h3>Encryption Code Example:</h3>
                        <pre className="code-block">
                            <code>{codeExample}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RSAEncryption; 