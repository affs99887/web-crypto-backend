# RSA-AES 加密与解密服务

这是一个基于 Express 的 Node.js 服务，用于生成 RSA 密钥对并进行 AES-GCM 加密数据的解密操作。

对应的前端：https://github.com/affs99887/web-crypto-front 或者 https://gitee.com/scape0goat/web-crypto-front

原理文档：https://ucn1x4mi5suo.feishu.cn/wiki/V52pwIxMGiYaPTk73Y4cp8ULn4g?from=from_copylink

## 功能

- 生成 RSA 公钥和私钥。
- 提供获取 RSA 公钥的 API 端点。
- 接收经过 RSA 加密的 AES 密钥，并解密随后用 AES-GCM 加密的数据。

## 安装

1. 克隆仓库：

   ```bash
   git clone <仓库地址>
   cd <项目目录>
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

## 使用

### 启动服务

```bash
node app.js
```

服务器将会在端口 `3000`（或者环境变量 `PORT` 指定的端口）上运行。

### API 端点

#### 获取 RSA 公钥

- **URL**: `/public-key`
- **方法**: `GET`
- **响应**:
  
  ```json
  {
    "publicKey": "<base64编码的公钥>"
  }
  ```

#### 解密数据

- **URL**: `/decrypt`
- **方法**: `POST`
- **请求体**:
  
  ```json
  {
    "encryptedAesKey": "<使用RSA加密的AES密钥 (Base64编码)>",
    "iv": "<AES-GCM的初始化向量 (Base64编码)>",
    "encryptedData": "<AES-GCM加密后的数据 (Base64编码)>"
  }
  ```

- **响应**:

  成功时：

  ```json
  {
    "success": true,
    "decryptedData": "<解密后的明文数据>"
  }
  ```

  失败时：

  ```json
  {
    "success": false,
    "message": "解密失败",
    "error": "<错误消息>"
  }
  ```

### 示例

#### 获取公钥

```bash
curl http://localhost:3000/public-key
```

#### 解密数据

1. 首先使用服务器提供的 RSA 公钥加密 AES 密钥。
2. 使用 AES-GCM 对数据进行加密，并生成 `iv` 和 `auth tag`。
3. 将加密的 AES 密钥、`iv` 和加密的数据通过 `POST` 请求发送到 `/decrypt` 端点。

```bash
curl -X POST http://localhost:3000/decrypt \
-H "Content-Type: application/json" \
-d '{
  "encryptedAesKey": "<Base64编码的RSA加密AES密钥>",
  "iv": "<Base64编码的IV>",
  "encryptedData": "<Base64编码的AES加密数据>"
}'
```

## 注意事项

- 解密流程中使用了 RSA-OAEP 和 AES-GCM，因此传输的数据必须符合这些算法的输入要求。
- 生成的 RSA 公钥和私钥的长度为 2048 位。

## 许可

此项目遵循 MIT 许可协议。详见 [LICENSE](LICENSE) 文件。