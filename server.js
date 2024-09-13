const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 生成RSA密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('Generated public key:', publicKey);

// 提供公钥的端点
app.get('/public-key', (req, res) => {
    res.json({ publicKey: Buffer.from(publicKey).toString('base64') });
});

app.post('/decrypt', (req, res) => {
    try {
        console.log('Received decrypt request');
        const { encryptedAesKey, iv, encryptedData } = req.body;

        // 解密AES密钥
        console.log('Decrypting AES key...');
        const decryptedAesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedAesKey, 'base64') // 确保AES密钥正确被解码
        );

        // 解密后的AES密钥应该是32字节长
        console.log('Decrypted AES key length:', decryptedAesKey.length);

        // 解码IV和加密数据
        const ivBuffer = Buffer.from(iv, 'base64');
        const encryptedBuffer = Buffer.from(encryptedData, 'base64');

        // 分离认证标签（Auth Tag）
        const authTagLength = 16;
        const ciphertext = encryptedBuffer.slice(0, -authTagLength);
        const authTag = encryptedBuffer.slice(-authTagLength);

        // 使用AES-GCM解密数据
        const decipher = crypto.createDecipheriv('aes-256-gcm', decryptedAesKey, ivBuffer);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        res.json({ success: true, decryptedData: decrypted.toString() });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ success: false, message: '解密失败', error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
