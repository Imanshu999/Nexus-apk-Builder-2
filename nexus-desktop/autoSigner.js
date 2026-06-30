const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { app } = require('electron');

class AutoSigner {
    constructor() {
        // Use userData for safe internal storage
        this.storagePath = app.getPath('userData');
        this.keystorePath = path.join(this.storagePath, 'debug.keystore');
        this.keystorePassword = 'nexus123';
        this.keyAlias = 'nexus_debug';
        this.binPath = path.join(app.getAppPath(), 'bin');
    }

    async initKeystore() {
        if (fs.existsSync(this.keystorePath)) {
            console.log('Keystore already exists at:', this.keystorePath);
            return true;
        }
        console.log('Generating new debug keystore...');
        
        // DName for the generated keystore
        const dname = 'CN=Nexus, OU=Development, O=Takano3D, L=Unknown, S=Unknown, C=US';
        
        // Ensure keytool is available in the system PATH
        const keytoolCmd = `keytool -genkey -v -keystore "${this.keystorePath}" -storepass ${this.keystorePassword} -alias ${this.keyAlias} -keypass ${this.keystorePassword} -keyalg RSA -keysize 2048 -validity 10000 -dname "${dname}"`;
        
        try {
            await execPromise(keytoolCmd);
            console.log('Keystore generated successfully.');
            return true;
        } catch (error) {
            throw new Error(`Keystore Corrupt or Generation Failed: ${error.message}`);
        }
    }

    async signApk(unsignedApkPath) {
        try {
            await this.initKeystore();

            console.log(`Starting signing process for: ${unsignedApkPath}`);
            const signerJarPath = path.join(this.binPath, 'uber-apk-signer.jar');
            
            // Execute java with uber-apk-signer and point to our generated keystore
            const signCmd = `java -jar "${signerJarPath}" -a "${unsignedApkPath}" --ks "${this.keystorePath}" --ksAlias ${this.keyAlias} --ksPass ${this.keystorePassword} --ksKeyPass ${this.keystorePassword} --overwrite`;
            
            const { stdout, stderr } = await execPromise(signCmd);
            
            return {
                success: true,
                message: 'APK auto-signed successfully with V2/V3 schemes.',
                stdout
            };
        } catch (error) {
            console.error('Signing error:', error);
            return {
                success: false,
                error: `Signing Failed: ${error.message}\n${error.stderr || ''}`
            };
        }
    }
}

module.exports = new AutoSigner();
