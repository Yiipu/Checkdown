import crypto from "crypto";

const algorithm = "aes-256-ctr";
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-ctr", process.env.AES_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.AES_KEY,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}

export {
  encrypt,
  decrypt
};
