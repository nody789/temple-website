const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'temple-secret-key-change-this-in-production';

// 這個中介軟體會檢查請求的 Authorization header 是否帶有有效的 JWT token
// 用法：在路由加上 require('../middleware/auth') 就會先驗證身份
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 格式必須是 "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授權，請先登入' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET); // 解碼後的使用者資訊存入 req.user
    next(); // 驗證通過，繼續執行下一個處理函式
  } catch {
    res.status(401).json({ message: 'Token 無效或已過期，請重新登入' });
  }
};
